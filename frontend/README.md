# ⚙️ SynthForge: Enterprise AI Data Extraction Engine

**[🌐 View Live Dashboard](https://synthforge-tau.vercel.app/)**

SynthForge is a full-stack, enterprise-grade AI platform that leverages Google's Gemini 3.5 Flash models to extract highly structured JSON data from unstructured text, batch files, and multimodal image payloads.

## 🚀 Core Features
* **Enterprise NLP Pipeline:** Converts unstructured text into highly structured JSON (Primary Sentiment, Confidence Score, User Intent).
* **Multimodal Vision AI:** Ingests image payloads to extract detected objects, text, and contextual data.
* **Batch Processing:** Handles bulk `.txt` file uploads, routing asynchronous requests to the AI engine.
* **Multi-Tenant Architecture:** Built-in SQLite authentication separating workspaces and historical data.
* **Dataset Export:** Instant compilation and export of the database log into `.csv` formats for ML training.

## 🧪 Try it Live
Want to test the core Python extraction engine without booting up the full Next.js/FastAPI stack? Run the backend pipeline directly in your browser:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Ishu975/synthforge/blob/main/SynthForge_Playground.ipynb)

## 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS (Cyber-Neon Aesthetics) — *Deployed on Vercel*
* **Backend:** Python, FastAPI, Uvicorn — *Deployed on Render*
* **Database:** SQLite (Relational Multi-tenant persistence)
* **AI Integration:** Google Gemini 3.5 Flash API (google-genai SDK)

## 💻 Quick Start (Local Development)

**1. Clone the repository**
```bash
git clone [https://github.com/Ishu975/synthforge.git](https://github.com/Ishu975/synthforge.git)
cd synthforge
