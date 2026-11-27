from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import JobApplication, JobOpportunity, Skill, User
from app.schemas import JobApplicationRequest, JobOut
from app.services.seed import log_activity

router = APIRouter(prefix="/api/jobs", tags=["Job & Internship Discovery"])


@router.get("", response_model=List[JobOut])
def list_jobs(
    q: Optional[str] = Query(default=None),
    job_type: Optional[str] = Query(default=None),
    remote: Optional[bool] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(JobOpportunity)
    if job_type and job_type != "all":
        query = query.filter(JobOpportunity.job_type == job_type)
    if remote is not None:
        query = query.filter(JobOpportunity.remote == remote)

    jobs = query.order_by(JobOpportunity.posted_at.desc()).all()

    if q:
        q_lower = q.lower()
        jobs = [
            j
            for j in jobs
            if q_lower in j.title.lower()
            or q_lower in j.company.lower()
            or q_lower in j.description.lower()
            or any(q_lower in s.lower() for s in (j.required_skills or []))
        ]

    user_skills = {s.name.lower() for s in db.query(Skill).filter(Skill.user_id == current_user.id).all()}
    apps = {
        a.job_id: a.status
        for a in db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    }

    output = []
    for job in jobs:
        req = job.required_skills or []
        if req:
            matched = sum(
                1
                for r in req
                if any(us in r.lower() or r.lower() in us for us in user_skills)
            )
            score = min(98, 45 + round((matched / len(req)) * 53))
        else:
            score = 75

        output.append(
            JobOut(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                job_type=job.job_type,
                remote=job.remote,
                salary_range=job.salary_range,
                required_skills=req,
                description=job.description,
                apply_url=job.apply_url,
                posted_at=job.posted_at,
                application_status=apps.get(job.id),
                match_score=score,
            )
        )

    output.sort(key=lambda x: x.match_score, reverse=True)
    return output


@router.post("/{job_id}/apply")
def update_job_application(
    job_id: int,
    payload: JobApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(JobOpportunity).filter(JobOpportunity.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opportunity not found.")

    app_record = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id, JobApplication.job_id == job_id)
        .first()
    )
    if app_record:
        app_record.status = payload.status
        app_record.notes = payload.notes
    else:
        app_record = JobApplication(
            user_id=current_user.id,
            job_id=job_id,
            status=payload.status,
            notes=payload.notes,
        )
        db.add(app_record)

    db.commit()
    log_activity(
        db,
        current_user.id,
        "job",
        f"{payload.status.title()} job: {job.title}",
        f"{job.company} ({job.location})",
    )
    return {"job_id": job_id, "status": app_record.status}
