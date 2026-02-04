from __future__ import annotations

from pydantic import BaseModel, Field


class JoinQueueRequest(BaseModel):
    mode: str = Field(min_length=1)
    difficulty: str = Field(min_length=1)
    language: str = Field(min_length=1)
    algorithm_id: int


class QueuePositionResponse(BaseModel):
    position: int
    size: int


class Envelope(BaseModel):
    success: bool
    data: dict | None = None
    message: str | None = None
    error: dict | None = None
