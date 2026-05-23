from __future__ import annotations

from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.loyalty_profile import LoyaltyProfile
from app.models.otp import OTP
from app.models.user import User
from app.schemas.auth import SendOTPResponse, VerifyOTPResponse
from app.utils.jwt import create_access_token
from app.utils.otp import (
    generate_otp,
    hash_otp_code,
    otp_expires_at,
    send_otp,
    utc_now,
    verify_otp_code,
)


settings = get_settings()
OTP_RATE_LIMIT_COUNT = 3
OTP_RATE_LIMIT_WINDOW_MINUTES = 10


async def send_login_otp(db: AsyncSession, mobile_number: str) -> SendOTPResponse:
    window_start = utc_now() - timedelta(minutes=OTP_RATE_LIMIT_WINDOW_MINUTES)
    count_result = await db.execute(
        select(func.count())
        .select_from(OTP)
        .where(
            OTP.mobile_number == mobile_number,
            OTP.created_at >= window_start,
        )
    )
    request_count = count_result.scalar_one()

    if request_count >= OTP_RATE_LIMIT_COUNT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please try again later.",
        )

    await db.execute(
        update(OTP)
        .where(
            OTP.mobile_number == mobile_number,
            OTP.is_used.is_(False),
        )
        .values(is_used=True)
    )

    otp_code = generate_otp()
    db.add(
        OTP(
            mobile_number=mobile_number,
            otp_code=hash_otp_code(mobile_number, otp_code),
            expires_at=otp_expires_at(),
        )
    )
    await db.commit()

    dev_otp = await send_otp(mobile_number, otp_code)
    message = "OTP sent successfully"
    if dev_otp is not None:
        message = "OTP generated in development mode"

    return SendOTPResponse(message=message, dev_otp=dev_otp)


async def verify_login_otp(
    db: AsyncSession,
    mobile_number: str,
    otp_code: str,
) -> VerifyOTPResponse:
    is_valid = await verify_otp_code(db, mobile_number, otp_code)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    result = await db.execute(select(User).where(User.mobile_number == mobile_number))
    user = result.scalar_one_or_none()
    is_new_user = user is None

    if user is None:
        user = User(mobile_number=mobile_number)
        db.add(user)
        await db.flush()
        db.add(LoyaltyProfile(user_id=user.id))
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(
        user_id=user.id,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return VerifyOTPResponse(
        access_token=access_token,
        token_type="bearer",
        is_new_user=is_new_user,
    )
