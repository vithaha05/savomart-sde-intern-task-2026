from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


SupportCategory = Literal[
    "Order Issue",
    "Points / Rewards",
    "Coupon Problem",
    "Store Feedback",
    "Account Help",
    "Other",
]


class ContactInfoResponse(BaseModel):
    phone: str
    email: str
    operating_hours: str


class SupportTicketRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact: str = Field(..., min_length=1, max_length=255)
    issue_category: SupportCategory
    description: str = Field(..., min_length=10)


class SupportTicketResponse(BaseModel):
    id: UUID
    message: str
    status: str
    created_at: datetime
