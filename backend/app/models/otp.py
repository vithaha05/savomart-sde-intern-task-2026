from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Index, String, func, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class OTP(Base):
    __tablename__ = "otps"
    __table_args__ = (
        Index(
            "ix_otps_one_active_per_mobile",
            "mobile_number",
            unique=True,
            postgresql_where=text("is_used = false"),
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    mobile_number: Mapped[str] = mapped_column(
        String(20),
        index=True,
        nullable=False,
    )
    otp_code: Mapped[str] = mapped_column(String(128), nullable=False)
    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default=text("false"),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"OTP(id={self.id!s}, mobile_number={self.mobile_number!r})"
