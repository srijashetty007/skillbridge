from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routers import (
    auth,
    careers,
    chat,
    contact,
    dashboard,
    interviews,
    jobs,
    resumes,
    roadmaps,
    skills,
)
from app.services.seed import seed_jobs_if_empty

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_jobs_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(careers.router)
app.include_router(skills.router)
app.include_router(roadmaps.router)
app.include_router(resumes.router)
app.include_router(interviews.router)
app.include_router(jobs.router)
app.include_router(chat.router)
app.include_router(contact.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "SkillBridge API"}
