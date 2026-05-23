from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator


INDIAN_MOBILE_PATTERN = re.compile(r"^(?:\+91)?[6-9]\d{9}$")


def normalize_indian_mobile(value: str) -> str:
    mobile_number = value.strip().replace(" ", "").replace("-", "")

    if not INDIAN_MOBILE_PATTERN.fullmatch(mobile_number):
        raise ValueError(
            "mobile_number must be a valid 10-digit Indian mobile number"
        )

    if mobile_number.startswith("+91"):
        return mobile_number

    return f"+91{mobile_number}"


class SendOTPRequest(BaseModel):
    mobile_number: str = Field(..., examples=["9876543210"])

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str) -> str:
        return normalize_indian_mobile(value)


class SendOTPResponse(BaseModel):
    message: str
    dev_otp: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    mobile_number: str = Field(..., examples=["9876543210"])
    otp_code: str = Field(..., min_length=6, max_length=6, examples=["123456"])

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str) -> str:
        return normalize_indian_mobile(value)

    @field_validator("otp_code")
    @classmethod
    def validate_otp_code(cls, value: str) -> str:
        otp_code = value.strip()
        if not otp_code.isdigit():
            raise ValueError("otp_code must contain exactly 6 digits")
        return otp_code


class VerifyOTPResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
