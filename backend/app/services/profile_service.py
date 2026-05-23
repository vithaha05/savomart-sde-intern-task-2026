from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.coupon import Coupon
from app.models.loyalty_profile import LoyaltyProfile
from app.models.user import User
from app.schemas.profile import (
    CouponResponse,
    LoyaltyProfileResponse,
    UserProfileResponse,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def calculate_tier(points: int) -> tuple[str, int]:
    if points >= 5000:
        return "Platinum", 100

    if points >= 1000:
        progress = int(((points - 1000) / 4000) * 100)
        return "Gold", min(max(progress, 0), 100)

    progress = int((points / 1000) * 100)
    return "Silver", min(max(progress, 0), 100)


def _days_remaining(valid_until: datetime) -> int:
    expires_at = valid_until
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    remaining = expires_at - utc_now()
    return max(remaining.days, 0)


def _is_active_coupon(coupon: Coupon, now: datetime) -> bool:
    expires_at = coupon.valid_until
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return not coupon.is_used and expires_at >= now


def _to_coupon_response(coupon: Coupon) -> CouponResponse:
    return CouponResponse(
        id=coupon.id,
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        min_purchase=coupon.min_purchase,
        valid_until=coupon.valid_until,
        is_used=coupon.is_used,
        days_remaining=_days_remaining(coupon.valid_until),
    )


def _to_loyalty_response(loyalty: LoyaltyProfile) -> LoyaltyProfileResponse:
    tier, progress = calculate_tier(loyalty.points_balance)
    return LoyaltyProfileResponse(
        points_balance=loyalty.points_balance,
        tier=tier,
        total_earned=loyalty.total_earned,
        total_redeemed=loyalty.total_redeemed,
        tier_progress=progress,
    )


async def get_user_coupons(user_id: UUID, db: AsyncSession) -> list[CouponResponse]:
    now = utc_now()
    active_coupon = and_(
        Coupon.is_used.is_(False),
        Coupon.valid_until >= now,
    )
    result = await db.execute(
        select(Coupon)
        .where(Coupon.user_id == user_id)
        .order_by(active_coupon.desc(), Coupon.valid_until.asc())
    )
    coupons = result.scalars().all()

    return [_to_coupon_response(coupon) for coupon in coupons]


async def get_user_profile(user_id: UUID, db: AsyncSession) -> UserProfileResponse:
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.loyalty_profile))
    )
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    if user.loyalty_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loyalty profile not found",
        )

    now = utc_now()
    coupon_result = await db.execute(
        select(Coupon)
        .where(
            Coupon.user_id == user_id,
            Coupon.is_used.is_(False),
            Coupon.valid_until >= now,
        )
        .order_by(Coupon.valid_until.asc())
    )
    active_coupons = coupon_result.scalars().all()

    return UserProfileResponse(
        id=user.id,
        mobile_number=user.mobile_number,
        name=user.name,
        email=user.email,
        loyalty=_to_loyalty_response(user.loyalty_profile),
        coupons=[_to_coupon_response(coupon) for coupon in active_coupons],
    )
