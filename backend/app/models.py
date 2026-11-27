from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("CareerAssessment", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    college_name = Column(String(200), nullable=False, default="")
    graduation_year = Column(Integer, nullable=False, default=2027)
    degree = Column(String(120), nullable=False, default="B.Tech / B.S.")
    major = Column(String(150), nullable=False, default="Computer Science")
    target_role = Column(String(150), nullable=False, default="Full-Stack Software Engineer")
    bio = Column(Text, nullable=False, default="")
    linkedin_url = Column(String(255), nullable=False, default="")
    github_url = Column(String(255), nullable=False, default="")
    portfolio_url = Column(String(255), nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="profile")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(80), nullable=False, default="Technical")
    proficiency = Column(Integer, nullable=False, default=40)
    target_proficiency = Column(Integer, nullable=False, default=85)
    status = Column(String(40), nullable=False, default="learning")  # proficient | learning | gap
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="skills")


class CareerAssessment(Base):
    __tablename__ = "career_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interests = Column(JSON, nullable=False, default=list)
    strengths = Column(JSON, nullable=False, default=list)
    work_style = Column(String(100), nullable=False, default="Collaborative")
    preferred_industries = Column(JSON, nullable=False, default=list)
    experience_level = Column(String(80), nullable=False, default="Beginner")
    recommended_careers = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("User", back_populates="assessments")


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(150), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False, default="")
    milestones = Column(JSON, nullable=False, default=list)
    progress_pct = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="roadmaps")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False, default="Software Engineering Resume")
    target_role = Column(String(150), nullable=False, default="Software Engineer")
    template = Column(String(60), nullable=False, default="modern")
    personal_info = Column(JSON, nullable=False, default=dict)
    summary = Column(Text, nullable=False, default="")
    education = Column(JSON, nullable=False, default=list)
    experience = Column(JSON, nullable=False, default=list)
    projects = Column(JSON, nullable=False, default=list)
    skills = Column(JSON, nullable=False, default=list)
    ai_feedback = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="resumes")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(150), nullable=False)
    interview_type = Column(String(60), nullable=False, default="technical")  # technical | behavioral | system_design
    difficulty = Column(String(40), nullable=False, default="entry")
    questions = Column(JSON, nullable=False, default=list)
    answers = Column(JSON, nullable=False, default=list)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=False, default="")
    status = Column(String(40), nullable=False, default="in_progress")  # in_progress | completed
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("User", back_populates="interviews")


class JobOpportunity(Base):
    __tablename__ = "job_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(150), nullable=False)
    location = Column(String(150), nullable=False)
    job_type = Column(String(60), nullable=False, default="internship")  # internship | full_time
    remote = Column(Boolean, nullable=False, default=False)
    salary_range = Column(String(100), nullable=False, default="")
    required_skills = Column(JSON, nullable=False, default=list)
    description = Column(Text, nullable=False)
    apply_url = Column(String(300), nullable=False, default="")
    posted_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(40), nullable=False, default="saved")  # saved | applied | interviewing
    notes = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="job_applications")
    job = relationship("JobOpportunity", back_populates="applications")


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="New Career Chat")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(30), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    conversation = relationship("ChatConversation", back_populates="messages")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(60), nullable=False)
    title = Column(String(200), nullable=False)
    detail = Column(String(300), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("User", back_populates="activities")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
