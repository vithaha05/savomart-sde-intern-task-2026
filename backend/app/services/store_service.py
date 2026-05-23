from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import get_settings
from app.schemas.store import StoreResponse


STORE_CACHE_TTL = timedelta(minutes=5)
STORE_API_TIMEOUT_SECONDS = 8.0
STORE_CACHE: dict[str, Any] = {
    "timestamp": None,
    "stores": None,
}

settings = get_settings()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _cache_is_fresh() -> bool:
    timestamp = STORE_CACHE.get("timestamp")
    stores = STORE_CACHE.get("stores")

    return (
        isinstance(timestamp, datetime)
        and stores is not None
        and utc_now() - timestamp < STORE_CACHE_TTL
    )


def _cached_or_service_unavailable(exc: Exception) -> list[StoreResponse]:
    cached_stores = STORE_CACHE.get("stores")
    if cached_stores is not None:
        return list(cached_stores)

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Savomart store service is currently unavailable",
    ) from exc


def _extract_store_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]

    if not isinstance(payload, dict):
        return []

    for key in ("stores", "data", "results", "items"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
        if isinstance(value, dict):
            nested = _extract_store_items(value)
            if nested:
                return nested

    return []


def _first_value(raw: dict[str, Any], keys: tuple[str, ...], default: Any = None) -> Any:
    for key in keys:
        value = raw.get(key)
        if value is not None:
            return value
    return default


def _parse_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _parse_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}
    return bool(value)


def _parse_store(raw: dict[str, Any]) -> StoreResponse:
    return StoreResponse(
        id=str(_first_value(raw, ("id", "store_id", "storeId", "code"), "")),
        name=str(_first_value(raw, ("name", "store_name", "storeName"), "")),
        address=str(_first_value(raw, ("address", "full_address", "fullAddress"), "")),
        city=str(_first_value(raw, ("city", "city_name", "cityName"), "")),
        lat=_parse_float(_first_value(raw, ("lat", "latitude"))),
        lng=_parse_float(_first_value(raw, ("lng", "longitude", "lon"))),
        phone=_first_value(raw, ("phone", "mobile", "contact", "contact_number")),
        is_operational=_parse_bool(
            _first_value(raw, ("is_operational", "isOperational", "operational"), True)
        ),
    )


async def fetch_stores() -> list[StoreResponse]:
    if _cache_is_fresh():
        return list(STORE_CACHE["stores"])

    headers = {"X-cron-token": settings.savomart_api_token}

    try:
        async with httpx.AsyncClient(timeout=STORE_API_TIMEOUT_SECONDS) as client:
            response = await client.get(settings.savomart_api_url, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        return _cached_or_service_unavailable(exc)

    try:
        payload = response.json()
    except ValueError as exc:
        return _cached_or_service_unavailable(exc)

    stores = [
        store
        for store in (_parse_store(item) for item in _extract_store_items(payload))
        if store.is_operational
    ]

    STORE_CACHE["timestamp"] = utc_now()
    STORE_CACHE["stores"] = stores
    return list(stores)


def haversine_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_km = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius_km * c


def find_nearest(lat: float, lng: float, stores: list[StoreResponse]) -> StoreResponse | None:
    stores_with_distance = []
    for store in stores:
        stores_with_distance.append(
            store.model_copy(
                update={
                    "distance_km": round(
                        haversine_distance_km(lat, lng, store.lat, store.lng),
                        2,
                    )
                }
            )
        )

    if not stores_with_distance:
        return None

    sorted_stores = sorted(stores_with_distance, key=lambda store: store.distance_km or 0.0)
    return sorted_stores[0]
