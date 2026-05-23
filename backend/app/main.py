from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_db, init_db
from app.routers import auth, health, offers, profile, stores, support


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Savomart Loyalty Companion API",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(offers.router, prefix="/offers", tags=["offers"])
    app.include_router(profile.router, prefix="/profile", tags=["profile"])
    app.include_router(stores.router, prefix="/stores", tags=["stores"])
    app.include_router(support.router, prefix="/support", tags=["support"])
    app.include_router(health.router, prefix="", tags=["health"])

    return app


app = create_app()
