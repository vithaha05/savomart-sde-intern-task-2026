from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class StoreResponse(BaseModel):
    id: str
    name: str
    address: str
    city: str
    lat: float
    lng: float
    phone: str | None
    is_operational: bool
    distance_km: Optional[float] = None
