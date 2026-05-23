from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, computed_field


class OfferResponse(BaseModel):
    id: UUID
    title: str
    description: str
    discount_label: str
    valid_until: datetime
    is_all_stores: bool
    store_ids: Optional[List[str]]
    image_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def days_remaining(self) -> int:
        valid_until = self.valid_until
        if valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)

        return max((valid_until - datetime.now(timezone.utc)).days, 0)
