from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    create_reset_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models import Resume, Skill, StudentProfile, User
from app.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SignupRequest,
    UserOut,
)
from app.services.seed import log_activity

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    normalized_email = payload.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        email=normalized_email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
    )
    db.add(user)
    db.flush()

    profile = StudentProfile(
        user_id=user.id,
        college_name=payload.college_name.strip(),
        graduation_year=payload.graduation_year,
        target_role="Full-Stack Software Engineer",
        bio=f"Student at {payload.college_name.strip()} (Class of {payload.graduation_year}).",
    )
    db.add(profile)

    starter_skills = [
        Skill(user_id=user.id, name="Python", category="Programming", proficiency=65, target_proficiency=85, status="learning"),
        Skill(user_id=user.id, name="Git & CI/CD", category="DevOps", proficiency=55, target_proficiency=75, status="learning"),
        Skill(user_id=user.id, name="SQL & Databases", category="Data", proficiency=40, target_proficiency=80, status="learning"),
    ]
    db.add_all(starter_skills)

    starter_resume = Resume(
        user_id=user.id,
        title=f"{payload.full_name.strip()} - Campus Resume",
        target_role="Full-Stack Software Engineer",
        personal_info={
            "full_name": payload.full_name.strip(),
            "email": normalized_email,
            "location": "",
            "linkedin": "",
            "github": "",
        },
        summary=f"Motivated {payload.graduation_year} graduate from {payload.college_name.strip()} seeking entry-level software engineering opportunities.",
        education=[
            {
                "school": payload.college_name.strip(),
                "degree": "Bachelor's Degree",
                "graduation": str(payload.graduation_year),
                "gpa": "",
            }
        ],
        experience=[],
        projects=[],
        skills=["Python", "Git & CI/CD", "SQL & Databases"],
    )
    db.add(starter_resume)
    db.commit()
    db.refresh(user)

    log_activity(
        db,
        user.id,
        "account",
        "Joined SkillBridge",
        f"Created student profile for {payload.college_name.strip()} (Class of {payload.graduation_year})",
    )

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        return {
            "message": "If an account exists for that email, password reset instructions have been prepared.",
            "reset_token": None,
        }
    reset_token = create_reset_token(user.id, user.email)
    return {
        "message": "Password reset token generated. Enter your new password below to complete reset.",
        "reset_token": reset_token,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.token)
    if decoded.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid password reset token.")

    user = db.query(User).filter(User.id == int(decoded["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    log_activity(db, user.id, "security", "Password updated", "Account password was reset.")
    return {"message": "Password reset successful. You can now log in with your new password."}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
