from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
import sqlite3
import csv
import io
import os # NEW: Allows Python to read your computer system files
from dotenv import load_dotenv # NEW: Loads your hidden .env file

# NEW: Tell Python to load the secrets from the .env file
load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# UPGRADED: It now grabs the key securely from the environment!
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("API Key not found. Please check your .env file.")
    
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-3.5-flash')


conn = sqlite3.connect('database.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS annotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        input_data TEXT,
        ai_result TEXT,
        type TEXT
    )
''')
conn.commit()

class AnnotationRequest(BaseModel):
    username: str
    raw_text: str

@app.post("/api/annotate")
async def annotate_data(request: AnnotationRequest):
    prompt = f"""
    You are an enterprise AI data extraction engine. Analyze the following text payload and extract a highly structured JSON response including:
    1. "primary_sentiment": Positive, Negative, or Neutral.
    2. "sentiment_confidence": A float between 0.0 and 1.0.
    3. "entities": A list of dictionaries, each with "name", "type" (e.g., PERSON, ORG, LOC), and "relevance_score".
    4. "user_intent": A clear classification of the user's goal.
    5. "actionable_flags": Any urgent flags (e.g., "high_churn_risk", "requires_support").
    Format strictly as JSON. No markdown. Payload: "{request.raw_text}"
    """
    try:
        response = await model.generate_content_async(prompt)
        if not response.parts: return {"annotated_data": "Error: Safety block."}
        
        result_text = response.text.replace("```json", "").replace("```", "").strip()
        cursor.execute("INSERT INTO annotations (username, input_data, ai_result, type) VALUES (?, ?, ?, ?)", 
                       (request.username, request.raw_text, result_text, "text"))
        conn.commit()
        return {"annotated_data": result_text}
    except Exception as e:
        return {"annotated_data": f"Backend Error: {str(e)}"}

@app.post("/api/batch")
async def batch_annotate(username: str = Form(...), file: UploadFile = File(...)):
    contents = await file.read()
    lines = [line.strip() for line in contents.decode("utf-8").split("\n") if line.strip()]
    processed = 0
    
    for line in lines[:5]:
        prompt = f"""Extract primary_sentiment, sentiment_confidence, entities (name, type), and user_intent from this text payload. Format strictly as JSON. Payload: "{line}" """
        try:
            response = await model.generate_content_async(prompt)
            result_text = response.text.replace("```json", "").replace("```", "").strip()
            cursor.execute("INSERT INTO annotations (username, input_data, ai_result, type) VALUES (?, ?, ?, ?)", 
                           (username, line, result_text, "batch_text"))
            conn.commit()
            processed += 1
        except Exception:
            continue
            
    return {"message": f"Successfully processed {processed} records for {username}."}

@app.post("/api/annotate-image")
async def annotate_image(username: str = Form(...), file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image_parts = [{"mime_type": file.content_type, "data": image_data}]
        
        prompt = """
        You are an enterprise computer vision engine. Analyze this visual payload and output highly structured JSON containing:
        1. "detected_objects": List of objects with estimated bounding box context.
        2. "scene_classification": The primary setting/environment.
        3. "extracted_text_ocr": Any text visible in the image.
        4. "risk_flags": Any safety or compliance risks detected.
        Format strictly as JSON. No markdown.
        """
        response = await model.generate_content_async([prompt, image_parts[0]])
        result_text = response.text.replace("```json", "").replace("```", "").strip()
        cursor.execute("INSERT INTO annotations (username, input_data, ai_result, type) VALUES (?, ?, ?, ?)", 
                       (username, f"Image Upload: {file.filename}", result_text, "vision"))
        conn.commit()
        return {"annotated_data": result_text}
    except Exception as e:
        return {"annotated_data": f"Error: {str(e)}"}

@app.get("/api/history")
async def get_history(username: str):
    cursor.execute("SELECT id, input_data, ai_result, type FROM annotations WHERE username = ? ORDER BY id DESC", (username,))
    rows = cursor.fetchall()
    history_list = [{"id": r[0], "input_data": r[1], "ai_result": r[2], "type": r[3]} for r in rows]
    return {"history": history_list}

@app.get("/api/export")
async def export_csv(username: str):
    cursor.execute("SELECT id, input_data, ai_result, type FROM annotations WHERE username = ? ORDER BY id ASC", (username,))
    rows = cursor.fetchall()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Input Data", "AI JSON Result", "Data Type"])
    for row in rows:
        writer.writerow(row)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename={username}_dataset.csv"}
    )
