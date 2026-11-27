from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import CareerAssessment, User
from app.schemas import AssessmentCreate, AssessmentOut
from app.services.career_engine import ROLE_CATALOG, compute_career_recommendations
from app.services.seed import log_activity

router = APIRouter(prefix="/api/careers", tags=["Career Assessment"])


@router.get("/catalog")
def get_career_catalog():
    return [
        {
            "role": role,
            "salary_entry": info["salary_entry"],
            "demand": info["demand"],
            "tags": info["tags"],
            "required_skills": info["required_skills"],
        }
        for role, info in ROLE_CATALOG.items()
    ]


@router.get("/assessments", response_model=List[AssessmentOut])
def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CareerAssessment)
        .filter(CareerAssessment.user_id == current_user.id)
        .order_by(CareerAssessment.created_at.desc())
        .all()
    )


@router.post("/assessments", response_model=AssessmentOut)
def create_assessment(
    payload: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recommendations = compute_career_recommendations(
        interests=payload.interests,
        strengths=payload.strengths,
        work_style=payload.work_style,
        preferred_industries=payload.preferred_industries,
    )

    assessment = CareerAssessment(
        user_id=current_user.id,
        interests=payload.interests,
        strengths=payload.strengths,
        work_style=payload.work_style,
        preferred_industries=payload.preferred_industries,
        experience_level=payload.experience_level,
        recommended_careers=recommendations,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    top_role = recommendations[0]["role"] if recommendations else "Software Engineer"
    log_activity(
        db,
        current_user.id,
        "assessment",
        "Completed Career Assessment",
        f"Top match: {top_role} ({recommendations[0]['match_score']}% match)",
    )
    return assessment
