from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.support import (
    ContactInfoResponse,
    SupportTicketRequest,
    SupportTicketResponse,
)
from app.services.support_service import create_support_ticket, get_contact_info


router = APIRouter()


@router.get("/contact", response_model=ContactInfoResponse)
async def read_support_contact() -> ContactInfoResponse:
    return get_contact_info()


@router.post(
    "/ticket",
    response_model=SupportTicketResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ticket(
    payload: SupportTicketRequest,
    db: AsyncSession = Depends(get_db),
) -> SupportTicketResponse:
    return await create_support_ticket(payload, db)
