from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import (
    ActivityLog,
    CareerAssessment,
    InterviewSession,
    JobApplication,
    LearningRoadmap,
    Resume,
    Skill,
    StudentProfile,
    User,
)
from app.schemas import ProfileUpdate, UserOut
from app.services.seed import log_activity

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Profile"])


@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).order_by(Skill.proficiency.desc()).all()
    latest_assessment = (
        db.query(CareerAssessment)
        .filter(CareerAssessment.user_id == current_user.id)
        .order_by(CareerAssessment.created_at.desc())
        .first()
    )
    roadmaps = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id)
        .order_by(LearningRoadmap.updated_at.desc())
        .all()
    )
    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(8)
        .all()
    )

    resumes_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    interviews_count = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).count()
    applications_count = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).count()

    avg_skill = round(sum(s.proficiency for s in skills) / len(skills)) if skills else 0
    proficient_count = sum(1 for s in skills if s.status == "proficient")

    return {
        "user": UserOut.model_validate(current_user),
        "stats": {
            "total_skills": len(skills),
            "proficient_skills": proficient_count,
            "avg_skill_progress": avg_skill,
            "resumes_count": resumes_count,
            "interviews_count": interviews_count,
            "saved_jobs_count": applications_count,
            "active_roadmaps": len(roadmaps),
        },
        "skills": [
            {
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "proficiency": s.proficiency,
                "target_proficiency": s.target_proficiency,
                "status": s.status,
            }
            for s in skills
        ],
        "recommended_careers": latest_assessment.recommended_careers if latest_assessment else [
            {
                "role": profile.target_role if profile else "Full-Stack Software Engineer",
                "match_score": 84,
                "salary_entry": "$80,000 - $115,000",
                "demand": "Very High",
                "key_skills": ["TypeScript", "React", "Python", "SQL & Databases"],
                "reason": "Take the Career Assessment to personalize your AI career matches.",
            }
        ],
        "active_roadmap": (
            {
                "id": roadmaps[0].id,
                "title": roadmaps[0].title,
                "target_role": roadmaps[0].target_role,
                "progress_pct": roadmaps[0].progress_pct,
                "milestones": roadmaps[0].milestones,
            }
            if roadmaps
            else None
        ),
        "recent_activities": [
            {
                "id": a.id,
                "action_type": a.action_type,
                "title": a.title,
                "detail": a.detail,
                "created_at": a.created_at,
            }
            for a in activities
        ],
    }


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    for field in (
        "college_name",
        "graduation_year",
        "degree",
        "major",
        "target_role",
        "bio",
        "linkedin_url",
        "github_url",
        "portfolio_url",
    ):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value.strip() if isinstance(value, str) else value)

    db.commit()
    db.refresh(current_user)
    log_activity(db, current_user.id, "profile", "Updated student profile", f"Target role: {profile.target_role}")
    return UserOut.model_validate(current_user)
