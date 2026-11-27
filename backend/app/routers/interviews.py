from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import InterviewSession, User
from app.schemas import InterviewOut, InterviewStartRequest, InterviewSubmitRequest
from app.services.career_engine import evaluate_interview_answers, get_interview_questions
from app.services.seed import log_activity

router = APIRouter(prefix="/api/interviews", tags=["Interview Preparation"])


@router.get("", response_model=List[InterviewOut])
def list_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )


@router.post("/start", response_model=InterviewOut)
def start_interview(
    payload: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = get_interview_questions(payload.role, payload.interview_type, payload.difficulty)
    session = InterviewSession(
        user_id=current_user.id,
        role=payload.role,
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        questions=questions,
        answers=[],
        status="in_progress",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/submit", response_model=InterviewOut)
def submit_interview(
    session_id: int,
    payload: InterviewSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    evaluation = evaluate_interview_answers(payload.answers)
    session.answers = payload.answers
    session.score = evaluation["score"]
    session.feedback = evaluation["feedback"]
    session.status = "completed"

    db.commit()
    db.refresh(session)
    log_activity(
        db,
        current_user.id,
        "interview",
        f"Completed {session.interview_type} interview",
        f"Role: {session.role} | Score: {session.score}/100",
    )
    return session
