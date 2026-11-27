from typing import Dict, List, Optional
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from app.config import get_gemini_config


class GeminiNotConfiguredError(Exception):
    """Raised when GEMINI_API_KEY is missing or unconfigured."""


class GeminiServiceError(Exception):
    """Raised when the Gemini API returns an error without exposing secrets."""


def _is_placeholder_key(key: str) -> bool:
    lowered = key.lower()
    return (
        not key
        or lowered.startswith("your_")
        or lowered.startswith("your-")
        or "your_actual_api_key" in lowered
        or "your_api_key" in lowered
    )


def is_gemini_configured() -> bool:
    api_key, _ = get_gemini_config()
    return not _is_placeholder_key(api_key)


def _sanitize_error_text(raw: str, secret: str) -> str:
    if secret and secret in raw:
        return raw.replace(secret, "[REDACTED]")
    return raw


def generate_chat_reply(
    user_message: str,
    history: List[Dict[str, str]],
    student_context: Optional[str] = None,
) -> str:
    """
    Generate a response from Gemini API via the official google-genai SDK.
    Raises GeminiNotConfiguredError if GEMINI_API_KEY is missing or placeholder.
    Raises GeminiServiceError with a safe message on upstream API failures.
    """
    api_key, model_name = get_gemini_config()
    if _is_placeholder_key(api_key):
        raise GeminiNotConfiguredError(
            "SkillBridge AI requires a valid GEMINI_API_KEY in backend/.env to generate live AI responses."
        )

    client = genai.Client(api_key=api_key)

    system_instruction = (
        "You are SkillBridge AI, an encouraging, practical career mentor for college students and fresh graduates. "
        "You help with career discovery, technical concepts, resume bullet improvements, interview prep (STAR method & coding), "
        "skill gap recommendations, and structured learning advice. Keep answers clear, actionable, and concise with bullet points when helpful."
    )
    if student_context:
        system_instruction += f"\n\nStudent Profile Context:\n{student_context}"

    contents = []
    for msg in history[-12:]:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=1024,
            ),
        )
    except genai_errors.APIError as exc:
        code = getattr(exc, "code", None)
        if code in (400, 401, 403):
            raise GeminiServiceError(
                "Gemini API rejected the request. Please verify that GEMINI_API_KEY in backend/.env is valid and active."
            )
        if code == 429:
            raise GeminiServiceError(
                "Gemini API rate limit or quota exceeded. Please wait a moment and try again."
            )
        safe_msg = _sanitize_error_text(str(exc), api_key)
        raise GeminiServiceError(f"Gemini API error ({code or 'upstream'}): {safe_msg}")
    except Exception as exc:
        safe_msg = _sanitize_error_text(str(exc), api_key)
        raise GeminiServiceError(f"Unable to connect to Gemini API: {safe_msg}")

    text = (response.text or "").strip()
    if not text:
        raise GeminiServiceError("Gemini API returned an empty response. Please try rephrasing your question.")
    return text


def generate_resume_ai_review(resume_summary: str, target_role: str) -> str:
    """Gemini-powered resume critique; raises GeminiNotConfiguredError if no key."""
    prompt = (
        f"Review this student resume targeting the role '{target_role}'. "
        "Provide 3 strengths, 3 specific action-oriented improvements (including quantified bullet suggestions), "
        "and missing ATS keywords:\n\n"
        f"{resume_summary}"
    )
    return generate_chat_reply(prompt, history=[], student_context=None)
