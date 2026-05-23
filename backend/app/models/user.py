from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, String, func, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.coupon import Coupon
    from app.models.loyalty_profile import LoyaltyProfile
    from app.models.support_ticket import SupportTicket


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    mobile_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
        nullable=False,
    )

    loyalty_profile: Mapped[Optional[LoyaltyProfile]] = relationship(
        "LoyaltyProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    coupons: Mapped[List[Coupon]] = relationship(
        "Coupon",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    support_tickets: Mapped[List[SupportTicket]] = relationship(
        "SupportTicket",
        back_populates="user",
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!s}, mobile_number={self.mobile_number!r})"
