from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_message: str


class ChatResponse(BaseModel):
    reply: str
    ticket_saved: bool
    ticket_id: Optional[str] = None
