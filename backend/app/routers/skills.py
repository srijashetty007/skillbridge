from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Skill, User
from app.schemas import SkillCreate, SkillGapAnalyzeRequest, SkillOut, SkillUpdate
from app.services.career_engine import ROLE_CATALOG
from app.services.seed import log_activity

router = APIRouter(prefix="/api/skills", tags=["Skills & Gap Analyzer"])


def compute_skill_status(proficiency: int, target_proficiency: int) -> str:
    if proficiency >= target_proficiency:
        return "proficient"
    if proficiency >= 40:
        return "learning"
    return "gap"


@router.get("", response_model=List[SkillOut])
def list_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Skill)
        .filter(Skill.user_id == current_user.id)
        .order_by(Skill.updated_at.desc())
        .all()
    )


@router.post("", response_model=SkillOut)
def add_or_update_skill(
    payload: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name_clean = payload.name.strip()
    existing = (
        db.query(Skill)
        .filter(Skill.user_id == current_user.id, Skill.name.ilike(name_clean))
        .first()
    )
    status_val = compute_skill_status(payload.proficiency, payload.target_proficiency)

    if existing:
        existing.proficiency = payload.proficiency
        existing.target_proficiency = payload.target_proficiency
        existing.category = payload.category
        existing.status = status_val
        db.commit()
        db.refresh(existing)
        log_activity(db, current_user.id, "skill", f"Updated {existing.name}", f"Proficiency: {existing.proficiency}%")
        return existing

    skill = Skill(
        user_id=current_user.id,
        name=name_clean,
        category=payload.category,
        proficiency=payload.proficiency,
        target_proficiency=payload.target_proficiency,
        status=status_val,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    log_activity(db, current_user.id, "skill", f"Added skill {skill.name}", f"Proficiency: {skill.proficiency}%")
    return skill


@router.patch("/{skill_id}", response_model=SkillOut)
def update_skill(
    skill_id: int,
    payload: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    if payload.proficiency is not None:
        skill.proficiency = payload.proficiency
    if payload.target_proficiency is not None:
        skill.target_proficiency = payload.target_proficiency
    if payload.category is not None:
        skill.category = payload.category

    skill.status = compute_skill_status(skill.proficiency, skill.target_proficiency)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")
    db.delete(skill)
    db.commit()
    return {"message": "Skill removed."}


@router.post("/analyze-gap")
def analyze_skill_gap(
    payload: SkillGapAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role_info = ROLE_CATALOG.get(payload.target_role)
    if not role_info:
        for k, v in ROLE_CATALOG.items():
            if payload.target_role.lower() in k.lower():
                role_info = v
                break

    required_skills = (
        role_info["required_skills"]
        if role_info
        else [
            {"name": "Problem Solving", "category": "Core", "target": 85},
            {"name": "Python", "category": "Programming", "target": 80},
            {"name": "Git & CI/CD", "category": "DevOps", "target": 75},
            {"name": "SQL & Databases", "category": "Data", "target": 75},
        ]
    )

    user_skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    user_map = {s.name.lower(): s for s in user_skills}

    analysis = []
    readiness_sum = 0
    for req in required_skills:
        req_name = req["name"]
        matched = user_map.get(req_name.lower())
        if not matched:
            for uname, uobj in user_map.items():
                if uname in req_name.lower() or req_name.lower() in uname:
                    matched = uobj
                    break

        current_level = matched.proficiency if matched else 0
        target_level = req["target"]
        gap = max(0, target_level - current_level)
        readiness_sum += min(100, round((current_level / target_level) * 100)) if target_level else 100

        analysis.append(
            {
                "skill": req_name,
                "category": req["category"],
                "current": current_level,
                "target": target_level,
                "gap": gap,
                "status": "ready" if gap == 0 else ("in_progress" if current_level > 0 else "missing"),
            }
        )

    readiness_score = round(readiness_sum / len(required_skills)) if required_skills else 0
    log_activity(
        db,
        current_user.id,
        "skill_gap",
        f"Analyzed skill gaps for {payload.target_role}",
        f"Role readiness: {readiness_score}%",
    )

    return {
        "target_role": payload.target_role,
        "readiness_score": readiness_score,
        "skills_analysis": analysis,
    }
