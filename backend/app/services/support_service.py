from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.support_ticket import SupportTicket
from app.schemas.support import (
    ContactInfoResponse,
    SupportTicketRequest,
    SupportTicketResponse,
)


settings = get_settings()


def get_contact_info() -> ContactInfoResponse:
    return ContactInfoResponse(
        phone=settings.support_phone,
        email=settings.support_email,
        operating_hours=settings.support_operating_hours,
    )


async def create_support_ticket(
    payload: SupportTicketRequest,
    db: AsyncSession,
) -> SupportTicketResponse:
    ticket = SupportTicket(
        name=payload.name,
        contact=payload.contact,
        issue_category=payload.issue_category,
        description=payload.description,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return SupportTicketResponse(
        id=ticket.id,
        message="Support ticket created successfully",
        status=ticket.status,
        created_at=ticket.created_at,
    )
