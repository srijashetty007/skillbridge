from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Resume, User
from app.schemas import ResumeOut, ResumeSaveRequest
from app.services.ai_service import (
    GeminiNotConfiguredError,
    generate_resume_ai_review,
)
from app.services.seed import log_activity

router = APIRouter(prefix="/api/resumes", tags=["Resume Builder"])


@router.get("", response_model=List[ResumeOut])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )


@router.post("", response_model=ResumeOut)
def save_resume(
    payload: ResumeSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.id:
        resume = (
            db.query(Resume)
            .filter(Resume.id == payload.id, Resume.user_id == current_user.id)
            .first()
        )
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")
        resume.title = payload.title
        resume.target_role = payload.target_role
        resume.template = payload.template
        resume.personal_info = payload.personal_info
        resume.summary = payload.summary
        resume.education = payload.education
        resume.experience = payload.experience
        resume.projects = payload.projects
        resume.skills = payload.skills
        action_title = f"Updated resume: {resume.title}"
    else:
        resume = Resume(
            user_id=current_user.id,
            title=payload.title,
            target_role=payload.target_role,
            template=payload.template,
            personal_info=payload.personal_info,
            summary=payload.summary,
            education=payload.education,
            experience=payload.experience,
            projects=payload.projects,
            skills=payload.skills,
        )
        db.add(resume)
        action_title = f"Created resume: {payload.title}"

    db.commit()
    db.refresh(resume)
    log_activity(db, current_user.id, "resume", action_title, f"Target: {resume.target_role}")
    return resume


@router.post("/{resume_id}/ai-review", response_model=ResumeOut)
def review_resume_with_ai(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    resume_text = (
        f"Title: {resume.title}\n"
        f"Summary: {resume.summary}\n"
        f"Education: {resume.education}\n"
        f"Experience: {resume.experience}\n"
        f"Projects: {resume.projects}\n"
        f"Skills: {', '.join(resume.skills or [])}"
    )

    try:
        feedback = generate_resume_ai_review(resume_text, resume.target_role)
    except GeminiNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {exc}")

    resume.ai_feedback = feedback
    db.commit()
    db.refresh(resume)
    log_activity(db, current_user.id, "resume", f"AI reviewed {resume.title}")
    return resume


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted."}
