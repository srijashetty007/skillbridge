# SkillBridge

SkillBridge is an AI-powered career development platform built for college students and fresh graduates. It helps students discover suitable careers, identify skill gaps, follow personalized learning roadmaps, build resumes, practice interviews, find internships/jobs, and chat with **SkillBridge AI**.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React, React Router
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic, PyJWT, bcrypt
- **Database:** SQLite by default (PostgreSQL-ready via `DATABASE_URL`)
- **AI:** Google Gemini API (`google-genai`) via FastAPI backend

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── routers/        # Auth, profile, careers, skills, roadmaps, resumes, interviews, jobs, chat, contact
│   │   ├── services/       # Gemini AI integration & career intelligence helpers
│   │   ├── auth.py         # JWT & bcrypt password hashing
│   │   ├── config.py       # Environment settings
│   │   ├── database.py     # SQLAlchemy engine & session setup (SQLite / PostgreSQL)
│   │   ├── main.py         # FastAPI app & startup seeding
│   │   └── models.py       # All database tables
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Sidebar, ProtectedRoute, SkillBridge AI Chatbot
    │   ├── context/        # AuthContext
    │   ├── lib/            # API client
    │   └── pages/          # Landing, Login, Signup, Dashboard, and all feature modules
    ├── .env.example
    ├── index.html
    └── package.json
```

## Setup & Installation

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set:
- `SECRET_KEY`: A strong random secret key for JWT signing
- `GEMINI_API_KEY`: Your Google Gemini API key (required for live **SkillBridge AI** chatbot responses; if omitted, the app runs normally and clearly notifies you to configure the key in `backend/.env`)
- `DATABASE_URL`: Defaults to `sqlite:///./skillbridge.db` (can be switched to `postgresql+psycopg2://user:pass@host:5432/skillbridge`)

Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will open at `http://localhost:5173`. Vite proxies `/api/*` requests directly to `http://127.0.0.1:8000`.
