from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.coupon import Coupon, DiscountType
from app.models.loyalty_profile import LoyaltyProfile
from app.models.offer import Offer
from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def get_or_create_user(mobile_number: str, name: str, email: str) -> User:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.mobile_number == mobile_number))
        user = result.scalar_one_or_none()

        if user is None:
            user = User(mobile_number=mobile_number, name=name, email=email)
            db.add(user)
            await db.flush()
        else:
            user.name = name
            user.email = email

        await db.commit()
        await db.refresh(user)
        return user


async def upsert_loyalty_profile(
    user_id,
    points_balance: int,
    tier: str,
    total_earned: int,
    total_redeemed: int,
) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(LoyaltyProfile).where(LoyaltyProfile.user_id == user_id)
        )
        loyalty = result.scalar_one_or_none()

        if loyalty is None:
            loyalty = LoyaltyProfile(user_id=user_id)
            db.add(loyalty)

        loyalty.points_balance = points_balance
        loyalty.tier = tier
        loyalty.total_earned = total_earned
        loyalty.total_redeemed = total_redeemed

        await db.commit()


async def create_coupon_if_missing(
    user_id,
    code: str,
    discount_type: DiscountType,
    discount_value: float,
    min_purchase: float | None,
    valid_until: datetime,
    is_used: bool,
) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Coupon).where(Coupon.code == code))
        coupon = result.scalar_one_or_none()

        if coupon is None:
            db.add(
                Coupon(
                    user_id=user_id,
                    code=code,
                    discount_type=discount_type,
                    discount_value=discount_value,
                    min_purchase=min_purchase,
                    valid_until=valid_until,
                    is_used=is_used,
                )
            )
            await db.commit()


async def create_offer_if_missing(
    title: str,
    description: str,
    discount_label: str,
    valid_until: datetime,
    is_all_stores: bool,
    store_ids: list[str] | None,
    image_url: str | None = None,
) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Offer).where(Offer.title == title))
        offer = result.scalar_one_or_none()

        if offer is None:
            db.add(
                Offer(
                    title=title,
                    description=description,
                    discount_label=discount_label,
                    valid_until=valid_until,
                    is_all_stores=is_all_stores,
                    store_ids=store_ids,
                    image_url=image_url,
                    is_active=True,
                )
            )
            await db.commit()


async def seed() -> None:
    now = utc_now()
    users = [
        ("+919876543210", "Aarav Sharma", "aarav@example.com", 250, "Silver", 350, 100),
        ("+919876543211", "Diya Patel", "diya@example.com", 1500, "Gold", 1800, 300),
        ("+919876543212", "Kabir Rao", "kabir@example.com", 6200, "Platinum", 7600, 1400),
    ]

    created_users: list[User] = []
    for mobile, name, email, points, tier, earned, redeemed in users:
        user = await get_or_create_user(mobile, name, email)
        await upsert_loyalty_profile(user.id, points, tier, earned, redeemed)
        created_users.append(user)

    coupon_sets = [
        [
            ("WELCOME10-AARAV", DiscountType.PERCENT, 10, 500, now + timedelta(days=14), False),
            ("SNACK50-AARAV", DiscountType.FLAT, 50, 299, now + timedelta(days=5), False),
            ("OLD25-AARAV", DiscountType.FLAT, 25, None, now - timedelta(days=2), False),
        ],
        [
            ("GOLD15-DIYA", DiscountType.PERCENT, 15, 1000, now + timedelta(days=21), False),
            ("USED100-DIYA", DiscountType.FLAT, 100, 999, now + timedelta(days=10), True),
            ("DAIRY75-DIYA", DiscountType.FLAT, 75, 499, now + timedelta(days=3), False),
        ],
        [
            ("PLATINUM20-KABIR", DiscountType.PERCENT, 20, 2000, now + timedelta(days=30), False),
            ("FRESH150-KABIR", DiscountType.FLAT, 150, 1499, now + timedelta(days=7), False),
            ("EXPIRED20-KABIR", DiscountType.PERCENT, 20, None, now - timedelta(days=5), True),
        ],
    ]

    for user, coupons in zip(created_users, coupon_sets):
        for code, discount_type, value, min_purchase, valid_until, is_used in coupons:
            await create_coupon_if_missing(
                user.id,
                code,
                discount_type,
                value,
                min_purchase,
                valid_until,
                is_used,
            )

    offers = [
        (
            "Weekend Basket Saver",
            "Save more on pantry staples across Savomart.",
            "Up to 20% off",
            now + timedelta(days=12),
            True,
            None,
        ),
        (
            "Fresh Produce Bonus",
            "Extra savings on fruits and vegetables.",
            "10% off",
            now + timedelta(days=8),
            True,
            None,
        ),
        (
            "Monthly Essentials Deal",
            "Discounts on household essentials and groceries.",
            "Flat Rs. 150 off",
            now + timedelta(days=20),
            True,
            None,
        ),
        (
            "Koramangala Store Special",
            "Local-only offer for Savomart Koramangala shoppers.",
            "Buy 2 Get 1",
            now + timedelta(days=9),
            False,
            ["BLR-KRM-001"],
        ),
        (
            "Indiranagar Fresh Hour",
            "Evening fresh-food discounts at Indiranagar.",
            "15% off",
            now + timedelta(days=6),
            False,
            ["BLR-IND-002"],
        ),
        (
            "Whitefield Family Pack",
            "Bulk savings for family packs at Whitefield.",
            "Flat Rs. 200 off",
            now + timedelta(days=16),
            False,
            ["BLR-WFD-003"],
        ),
    ]

    for offer in offers:
        await create_offer_if_missing(*offer)

    print("Seed data created successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
