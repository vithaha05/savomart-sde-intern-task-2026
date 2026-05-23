from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.offer import Offer


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def get_active_offers(db: AsyncSession) -> list[Offer]:
    result = await db.execute(
        select(Offer)
        .where(
            Offer.is_active.is_(True),
            Offer.valid_until >= utc_now(),
        )
        .order_by(Offer.valid_until.asc())
    )
    return list(result.scalars().all())


async def get_offer_by_id(offer_id: UUID, db: AsyncSession) -> Offer:
    result = await db.execute(
        select(Offer).where(
            Offer.id == offer_id,
            Offer.is_active.is_(True),
        )
    )
    offer = result.scalar_one_or_none()

    if offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found",
        )

    return offer
