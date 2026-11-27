from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


# ---------- Auth & Profile ----------

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)
    college_name: str = Field(..., min_length=2, max_length=200)
    graduation_year: int = Field(..., ge=2020, le=2035)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)


class ProfileOut(BaseModel):
    college_name: str
    graduation_year: int
    degree: str
    major: str
    target_role: str
    bio: str
    linkedin_url: str
    github_url: str
    portfolio_url: str

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    college_name: Optional[str] = Field(None, max_length=200)
    graduation_year: Optional[int] = Field(None, ge=2020, le=2035)
    degree: Optional[str] = Field(None, max_length=120)
    major: Optional[str] = Field(None, max_length=150)
    target_role: Optional[str] = Field(None, max_length=150)
    bio: Optional[str] = None
    linkedin_url: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Skills ----------

class SkillCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(default="Technical", max_length=80)
    proficiency: int = Field(default=40, ge=0, le=100)
    target_proficiency: int = Field(default=85, ge=0, le=100)


class SkillUpdate(BaseModel):
    proficiency: Optional[int] = Field(None, ge=0, le=100)
    target_proficiency: Optional[int] = Field(None, ge=0, le=100)
    category: Optional[str] = Field(None, max_length=80)


class SkillOut(BaseModel):
    id: int
    name: str
    category: str
    proficiency: int
    target_proficiency: int
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True


class SkillGapAnalyzeRequest(BaseModel):
    target_role: str = Field(..., min_length=2, max_length=150)


# ---------- Career Assessment ----------

class AssessmentCreate(BaseModel):
    interests: List[str] = Field(..., min_length=1)
    strengths: List[str] = Field(..., min_length=1)
    work_style: str = Field(..., min_length=2, max_length=100)
    preferred_industries: List[str] = Field(default_factory=list)
    experience_level: str = Field(default="Beginner", max_length=80)


class AssessmentOut(BaseModel):
    id: int
    interests: List[str]
    strengths: List[str]
    work_style: str
    preferred_industries: List[str]
    experience_level: str
    recommended_careers: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Learning Roadmap ----------

class RoadmapGenerateRequest(BaseModel):
    target_role: str = Field(..., min_length=2, max_length=150)
    weekly_hours: int = Field(default=10, ge=2, le=60)


class MilestoneToggleRequest(BaseModel):
    milestone_id: str
    completed: bool


class RoadmapOut(BaseModel):
    id: int
    target_role: str
    title: str
    description: str
    milestones: List[Dict[str, Any]]
    progress_pct: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Resumes ----------

class ResumeSaveRequest(BaseModel):
    id: Optional[int] = None
    title: str = Field(default="My Resume", min_length=1, max_length=150)
    target_role: str = Field(default="Software Engineer", max_length=150)
    template: str = Field(default="modern", max_length=60)
    personal_info: Dict[str, Any] = Field(default_factory=dict)
    summary: str = ""
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)


class ResumeOut(BaseModel):
    id: int
    title: str
    target_role: str
    template: str
    personal_info: Dict[str, Any]
    summary: str
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    skills: List[str]
    ai_feedback: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Interviews ----------

class InterviewStartRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=150)
    interview_type: str = Field(default="technical")  # technical | behavioral | system_design
    difficulty: str = Field(default="entry")


class InterviewSubmitRequest(BaseModel):
    answers: List[Dict[str, str]]  # [{"question": "...", "answer": "..."}]


class InterviewOut(BaseModel):
    id: int
    role: str
    interview_type: str
    difficulty: str
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    score: Optional[int]
    feedback: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Jobs ----------

class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: str
    job_type: str
    remote: bool
    salary_range: str
    required_skills: List[str]
    description: str
    apply_url: str
    posted_at: datetime
    application_status: Optional[str] = None
    match_score: int = 0

    class Config:
        from_attributes = True


class JobApplicationRequest(BaseModel):
    status: str = Field(default="saved")  # saved | applied | interviewing
    notes: str = ""


# ---------- Chat ----------

class ChatSendRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(..., min_length=1, max_length=4000)


class ChatMessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatConversationOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageOut] = []
    reply: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Contact ----------

class ContactCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    subject: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=5, max_length=3000)
