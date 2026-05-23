from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.profile import CouponResponse, UserProfileResponse
from app.services.profile_service import get_user_coupons, get_user_profile
from app.utils.jwt import get_current_user


router = APIRouter()


@router.get("", response_model=UserProfileResponse)
async def read_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    return await get_user_profile(current_user.id, db)


@router.get("/coupons", response_model=list[CouponResponse])
async def read_profile_coupons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CouponResponse]:
    return await get_user_coupons(current_user.id, db)
