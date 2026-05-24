from typing import Optional
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    secret_key: str = Field(alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=10080,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    groq_api_key: str = Field(alias="GROQ_API_KEY")
    otp_dev_mode: bool = Field(default=False, alias="OTP_DEV_MODE")
    savomart_api_url: str = Field(
        default="https://internal-service.savomart.in/bridge/api/store/list?is_operational=True",
        alias="SAVOMART_API_URL",
    )
    savomart_api_token: str = Field(
        default="savo-bridge-cron-secret",
        alias="SAVOMART_API_TOKEN",
    )
    support_phone: str = Field(default="+91 98765 00000", alias="SUPPORT_PHONE")
    support_email: str = Field(default="support@savomart.in", alias="SUPPORT_EMAIL")
    support_operating_hours: str = Field(
        default="Monday to Saturday, 9:00 AM - 8:00 PM IST",
        alias="SUPPORT_OPERATING_HOURS",
    )
    frontend_url: Optional[str] = Field(default=None, alias="FRONTEND_URL")

    cors_origins: list[str] = Field(
        default=[
            "http://localhost:5173",
        ],
        alias="CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def use_async_postgres_driver(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # If FRONTEND_URL is provided, ensure it's included in CORS origins
    if settings.frontend_url:
        try:
            if settings.frontend_url not in settings.cors_origins:
                settings.cors_origins.append(settings.frontend_url)
        except Exception:
            pass
    return settings
