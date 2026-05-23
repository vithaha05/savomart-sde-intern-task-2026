from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
)
from app.services.auth_service import send_login_otp, verify_login_otp


router = APIRouter()


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp_endpoint(
    payload: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
) -> SendOTPResponse:
    return await send_login_otp(db, payload.mobile_number)


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp_endpoint(
    payload: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
) -> VerifyOTPResponse:
    return await verify_login_otp(db, payload.mobile_number, payload.otp_code)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout() -> dict[str, str]:
    return {"message": "Logged out successfully"}
