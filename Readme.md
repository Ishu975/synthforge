# ⚙️ SynthForge: Enterprise AI Data Extraction Engine

SynthForge is a multimodal, full-stack internal tool designed to automate data labeling and structural extraction pipelines using Large Language Models. Featuring a high-performance, glassmorphic UI, it bridges the gap between software engineering and Machine Learning operations.

<GenerateWidget component_placeholder_id="GenerateWidget_c_080ea85b7b52977b_r_2ad040cdfddbadd6_0" height="500px" type="inline_visualization">
<skills>diagram</skills>

**Idea:** Visualize the architecture of the SynthForge platform highlighting multimodal ingestion and multitenancy.
**Visual type:** Architecture flowchart.
**Data specification:**
- **Data structure:** nodes and directed edges
- **Initial values:**
  Nodes: Frontend (Next.js Cyber-UI), Auth (Workspace Login), Backend (FastAPI), Database (SQLite Multi-tenant), AI Engine (Gemini Vision & Text).
  Edges: Frontend -> Auth (Session Init), Auth -> Backend (Route Data), Backend -> AI Engine (Async Vision/NLP Processing), AI Engine -> Database (Store Structured JSON), Database -> Frontend (Vector Log UI), Backend -> ML Engineer (CSV Export).
- **Mapping:** Draw as a flowchart with distinct layers for Client, Auth, Server, Data, and External AI.
**User controls:** None.
**Interactivity:** Hover to highlight data flow paths.
**Animation:** None.
</GenerateWidget>

## 🚀 Core Features
* **Enterprise NLP Pipeline:** Converts unstructured text into highly structured JSON (Sentiment analysis, Confidence scoring, Entity Extraction, User Intent).
* **Multimodal Vision AI:** Ingests image payloads to extract detected objects, scene classifications, and OCR text.
* **Batch Processing:** Handles bulk `.txt` file uploads, routing asynchronous requests to the LLM backend.
* **Multi-Tenant Architecture:** Built-in SQLite authentication separating workspace data between different users.
* **Dataset Export:** Instant compilation and export of the vector database log into `.csv` formats for ML training.

## 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS (Glassmorphism & Cyber-Neon Aesthetics)
* **Backend:** Python, FastAPI, Uvicorn
* **Database:** SQLite (Relational persistence)
* **AI Integration:** Google Gemini 3.5 Flash API (google-generativeai)

## 💻 Quick Start

**1. Clone the repository**
`git clone https://github.com/YOUR_USERNAME/synthforge.git`

**2. Start the Python Backend**
`cd backend`
`pip install fastapi uvicorn google-generativeai pydantic python-multipart`
*(Add your Gemini API Key to main.py)*
`python -m uvicorn main:app --reload`

**3. Start the Next.js Frontend**
`cd ../frontend`
`npm install`
`npm run dev`

Navigate to `http://localhost:3000` to access the workspace.