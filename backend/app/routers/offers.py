from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.offer import OfferResponse
from app.services.offer_service import get_active_offers, get_offer_by_id


router = APIRouter()


@router.get("", response_model=list[OfferResponse])
async def read_offers(db: AsyncSession = Depends(get_db)) -> list[OfferResponse]:
    return await get_active_offers(db)


@router.get("/{offer_id}", response_model=OfferResponse)
async def read_offer(
    offer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> OfferResponse:
    return await get_offer_by_id(offer_id, db)
