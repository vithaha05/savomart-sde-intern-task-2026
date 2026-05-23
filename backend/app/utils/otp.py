# OTP strategy:
#
# Savomart uses short-lived, single-use 6-digit OTPs because customers authenticate
# with mobile numbers and need a low-friction login flow. Each new OTP invalidates
# older unused OTPs for the same mobile number, expires after five minutes, is
# stored as an HMAC digest instead of plaintext, and is rate-limited to three
# requests per ten minutes. In development, OTP_DEV_MODE can return the OTP in the
# API response for local testing; production never logs or returns OTP values and
# should plug the SMS provider into send_otp().
from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.otp import OTP


logger = logging.getLogger(__name__)
settings = get_settings()

OTP_EXPIRE_MINUTES = 5


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp_code(mobile: str, otp: str) -> str:
    message = f"{mobile}:{otp}".encode("utf-8")
    return hmac.new(
        settings.secret_key.encode("utf-8"),
        message,
        hashlib.sha256,
    ).hexdigest()


async def send_otp(mobile: str, otp: str) -> Optional[str]:
    if settings.otp_dev_mode:
        logger.info("OTP_DEV_MODE enabled; returning OTP for mobile %s", mobile)
        return otp

    raise NotImplementedError(
        "Production SMS delivery is not configured. Add MSG91/Fast2SMS delivery "
        "inside app.utils.otp.send_otp() and keep OTP_DEV_MODE=false in production."
    )


async def verify_otp_code(db: AsyncSession, mobile: str, code: str) -> bool:
    result = await db.execute(
        select(OTP)
        .where(
            OTP.mobile_number == mobile,
            OTP.is_used.is_(False),
        )
        .order_by(OTP.created_at.desc())
        .limit(1)
    )
    otp_record = result.scalar_one_or_none()

    if otp_record is None:
        return False

    expected_hash = hash_otp_code(mobile, code)
    if not hmac.compare_digest(otp_record.otp_code, expected_hash):
        return False

    if otp_record.expires_at <= utc_now():
        otp_record.is_used = True
        await db.commit()
        return False

    otp_record.is_used = True
    await db.commit()
    return True


def otp_expires_at() -> datetime:
    return utc_now() + timedelta(minutes=OTP_EXPIRE_MINUTES)
