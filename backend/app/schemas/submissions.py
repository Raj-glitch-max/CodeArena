from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SubmissionRunRequest(BaseModel):
    challenge_id: int
    code: str = Field(min_length=1)
    language: str = Field(min_length=1)
    algorithm_id: Optional[int] = None


class SubmissionCreateResponse(BaseModel):
    id: int
    status: str


class SubmissionStatusResponse(BaseModel):
    id: int
    status: str
    result_summary: dict | None = None
    execution_time_ms: int | None = None
    memory_usage_mb: int | None = None
