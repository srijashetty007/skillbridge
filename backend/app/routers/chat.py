from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import get_gemini_config
from app.database import get_db
from app.models import ChatConversation, ChatMessage, Skill, StudentProfile, User
from app.schemas import ChatConversationOut, ChatSendRequest
from app.services.ai_service import (
    GeminiNotConfiguredError,
    GeminiServiceError,
    generate_chat_reply,
    is_gemini_configured,
)

router = APIRouter(prefix="/api/chat", tags=["SkillBridge AI Chatbot"])


@router.get("/status")
def chat_status():
    _, model_name = get_gemini_config()
    configured = is_gemini_configured()
    return {
        "configured": configured,
        "model": model_name,
        "message": (
            "SkillBridge AI is connected to Gemini."
            if configured
            else "GEMINI_API_KEY is not configured in backend/.env. Add a valid Gemini API key to enable live SkillBridge AI responses."
        ),
    }


@router.get("/conversations", response_model=List[ChatConversationOut])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.updated_at.desc())
        .all()
    )


def _handle_chat_message(
    payload: ChatSendRequest,
    current_user: User,
    db: Session,
) -> ChatConversationOut:
    cleaned_message = payload.message.strip()
    if not cleaned_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if not is_gemini_configured():
        raise HTTPException(
            status_code=503,
            detail="SkillBridge AI is not configured yet. Please set GEMINI_API_KEY in backend/.env.",
        )

    created_new_conversation = False
    if payload.conversation_id:
        conversation = (
            db.query(ChatConversation)
            .filter(
                ChatConversation.id == payload.conversation_id,
                ChatConversation.user_id == current_user.id,
            )
            .first()
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found.")
    else:
        title_preview = cleaned_message[:48]
        conversation = ChatConversation(
            user_id=current_user.id,
            title=title_preview if len(cleaned_message) <= 48 else f"{title_preview}...",
        )
        db.add(conversation)
        db.flush()
        created_new_conversation = True

    history = [
        {"role": m.role, "content": m.content}
        for m in (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conversation.id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )
    ]

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    student_context = (
        f"Name: {current_user.full_name}\n"
        f"College: {profile.college_name if profile else 'N/A'} (Class of {profile.graduation_year if profile else 'N/A'})\n"
        f"Target Role: {profile.target_role if profile else 'Software Engineer'}\n"
        f"Current Skills: {', '.join(f'{s.name} ({s.proficiency}%)' for s in skills) or 'None listed'}"
    )

    try:
        assistant_reply = generate_chat_reply(
            user_message=cleaned_message,
            history=history,
            student_context=student_context,
        )
    except GeminiNotConfiguredError as exc:
        if created_new_conversation:
            db.rollback()
        raise HTTPException(status_code=503, detail=str(exc))
    except GeminiServiceError as exc:
        if created_new_conversation:
            db.rollback()
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception:
        if created_new_conversation:
            db.rollback()
        raise HTTPException(
            status_code=502,
            detail="Failed to generate AI response. Please try again.",
        )

    db.add(ChatMessage(conversation_id=conversation.id, role="user", content=cleaned_message))
    db.add(ChatMessage(conversation_id=conversation.id, role="assistant", content=assistant_reply))
    db.commit()
    db.refresh(conversation)

    result = ChatConversationOut.model_validate(conversation)
    result.reply = assistant_reply
    return result


@router.post("", response_model=ChatConversationOut)
def chat_endpoint(
    payload: ChatSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _handle_chat_message(payload, current_user, db)


@router.post("/send", response_model=ChatConversationOut)
def send_chat_message(
    payload: ChatSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _handle_chat_message(payload, current_user, db)


@router.delete("/conversations/{conversation_id}/messages")
def clear_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == current_user.id,
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation.id).delete()
    db.commit()
    db.refresh(conversation)
    return ChatConversationOut.model_validate(conversation)


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == current_user.id,
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted."}
