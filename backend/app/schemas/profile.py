from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.coupon import DiscountType


class LoyaltyProfileResponse(BaseModel):
    points_balance: int
    tier: str
    total_earned: int
    total_redeemed: int
    tier_progress: int


class CouponResponse(BaseModel):
    id: UUID
    code: str
    discount_type: DiscountType
    discount_value: float
    min_purchase: float | None
    valid_until: datetime
    is_used: bool
    days_remaining: int

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(BaseModel):
    id: UUID
    mobile_number: str
    name: str | None
    email: str | None
    loyalty: LoyaltyProfileResponse
    coupons: list[CouponResponse]
