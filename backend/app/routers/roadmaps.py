from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.auth import get_current_user
from app.database import get_db
from app.models import LearningRoadmap, StudentProfile, User
from app.schemas import MilestoneToggleRequest, RoadmapGenerateRequest, RoadmapOut
from app.services.career_engine import build_roadmap_milestones
from app.services.seed import log_activity

router = APIRouter(prefix="/api/roadmaps", tags=["Learning Roadmaps"])


@router.get("", response_model=List[RoadmapOut])
def list_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id)
        .order_by(LearningRoadmap.updated_at.desc())
        .all()
    )


@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(
    payload: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    milestones = build_roadmap_milestones(payload.target_role)
    roadmap = LearningRoadmap(
        user_id=current_user.id,
        target_role=payload.target_role,
        title=f"{payload.target_role} Roadmap",
        description=f"Personalized {len(milestones)}-phase study plan paced at {payload.weekly_hours} hrs/week.",
        milestones=milestones,
        progress_pct=0,
    )
    db.add(roadmap)

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        profile.target_role = payload.target_role

    db.commit()
    db.refresh(roadmap)
    log_activity(db, current_user.id, "roadmap", f"Generated roadmap for {payload.target_role}")
    return roadmap


@router.patch("/{roadmap_id}/milestones", response_model=RoadmapOut)
def toggle_milestone(
    roadmap_id: int,
    payload: MilestoneToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roadmap = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.id == roadmap_id, LearningRoadmap.user_id == current_user.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    updated_title = None
    milestones = list(roadmap.milestones or [])
    for m in milestones:
        if m.get("id") == payload.milestone_id:
            m["completed"] = payload.completed
            updated_title = m.get("title")
            break

    if updated_title is None:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    completed_count = sum(1 for m in milestones if m.get("completed"))
    roadmap.milestones = milestones
    flag_modified(roadmap, "milestones")
    roadmap.progress_pct = round((completed_count / len(milestones)) * 100) if milestones else 0

    db.commit()
    db.refresh(roadmap)

    if payload.completed:
        log_activity(
            db,
            current_user.id,
            "roadmap",
            f"Completed milestone: {updated_title}",
            f"{roadmap.title} ({roadmap.progress_pct}%)",
        )
    return roadmap


@router.delete("/{roadmap_id}")
def delete_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roadmap = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.id == roadmap_id, LearningRoadmap.user_id == current_user.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    db.delete(roadmap)
    db.commit()
    return {"message": "Roadmap deleted."}
