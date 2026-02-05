from __future__ import annotations

from typing import Optional, Literal

from pydantic import BaseModel, Field


class ChallengeCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    difficulty: Literal['easy', 'medium', 'hard'] = 'easy'
    description: str = Field(default="")


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    difficulty: Optional[Literal['easy', 'medium', 'hard']] = None
    description: Optional[str] = None


class ChallengeOut(BaseModel):
    id: int
    title: str
    difficulty: str
    description: str
