from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ContactMessage
from app.schemas import ContactCreateRequest

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactCreateRequest, db: Session = Depends(get_db)):
    msg = ContactMessage(
        name=payload.name.strip(),
        email=payload.email.strip().lower(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(msg)
    db.commit()
    return {"message": "Thank you for reaching out! Our team has received your message."}
