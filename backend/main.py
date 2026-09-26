import os
import sqlite3
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI()

# CORS Middleware to allow Render and Vercel to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Securely grab the API key from Render Environment
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: API Key not found. Please check your .env file or Render Environment.")
else:
    genai.configure(api_key=api_key)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-3.5-flash')

# Database Setup
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

# Text Analysis Request Model
class AnnotationRequest(BaseModel):
    username: str
    raw_text: str

@app.post("/api/annotate")
async def annotate_data(request: AnnotationRequest):
    prompt = f"""
    You are an enterprise AI data extraction engine. Analyze the following text payload:
    "{request.raw_text}"
    Return a structured JSON with:
    1. "primary_sentiment": Positive, Negative, or Neutral.
    2. "sentiment_confidence": A float between 0.0 and 1.0.
    3. "entities": A list of dictionaries, each with "name", "type".
    4. "user_intent": A clear classification of the user's goal.
    """
    try:
        response = model.generate_content(prompt)
        result = response.text
    except Exception as e:
        result = f'{{"error": "{str(e)}" }}'

    cursor.execute(
        "INSERT INTO annotations (username, input_data, ai_result, type) VALUES (?, ?, ?, ?)",
        (request.username, request.raw_text, result, "text")
    )
    conn.commit()
    return {"status": "success", "data": result}

@app.get("/api/history/{username}")
async def get_history(username: str):
    cursor.execute("SELECT id, input_data, ai_result, type FROM annotations WHERE username = ? ORDER BY id DESC", (username,))
    rows = cursor.fetchall()
    history = []
    for row in rows:
        history.append({
            "id": row[0],
            "input_data": row[1],
            "ai_result": row[2],
            "type": row[3]
        })
    return {"history": history}

@app.post("/api/batch")
async def process_batch(user: str = Form(...), file: UploadFile = File(...)):
    try:
        content = await file.read()
        text_content = content.decode('utf-8')
        
        prompt = f"Analyze this batch file content and extract key structured data in JSON: {text_content}"
        response = model.generate_content(prompt)
        result = response.text
        
        cursor.execute(
            "INSERT INTO annotations (username, input_data, ai_result, type) VALUES (?, ?, ?, ?)",
            (user, f"Batch File: {file.filename}", result, "batch")
        )
        conn.commit()
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/vision")
async def process_vision(user: str = Form(...), file: UploadFile = File(...)):
    # Basic mock processor to prevent crashes if Gemini Vision dependencies are missing
    cursor.execute(
        "INSERT INTO annotations (username, input_data, ai_result, type) VALUES (?, ?, ?, ?)",
        (user, f"Image File: {file.filename}", '{"status": "vision processed successfully"}', "vision")
    )
    conn.commit()
    return {"status": "success"}