from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.store import StoreResponse
from app.services.store_service import fetch_stores, find_nearest


router = APIRouter()


@router.get("", response_model=list[StoreResponse])
async def read_stores() -> list[StoreResponse]:
    return await fetch_stores()


@router.get("/nearest", response_model=StoreResponse)
async def read_nearest_store(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
) -> StoreResponse:
    stores = await fetch_stores()
    nearest_store = find_nearest(lat, lng, stores)
    if nearest_store is None:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No operational stores found",
        )

    return nearest_store
