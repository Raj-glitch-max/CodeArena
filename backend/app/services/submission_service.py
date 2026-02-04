from __future__ import annotations

import json
from typing import Optional

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission


class SubmissionService:
    def __init__(self, db: AsyncSession, redis: Redis) -> None:
        self.db = db
        self.redis = redis

    async def create_submission(
        self,
        *,
        user_id: int,
        challenge_id: int,
        code: str,
        language: str,
        algorithm_id: Optional[int],
    ) -> Submission:
        s = Submission(
            user_id=user_id,
            algorithm_id=algorithm_id,
            challenge_id=challenge_id,
            code=code,
            language=language,
            status="PENDING",
        )
        self.db.add(s)
        await self.db.flush()
        return s

    async def enqueue(self, *, submission_id: int, mode: str) -> None:
        payload = {
            "submission_id": submission_id,
            "mode": mode,
        }
        await self.redis.rpush("code_execution_tasks", json.dumps(payload))

    async def get_status(self, submission_id: int) -> Optional[Submission]:
        result = await self.db.execute(select(Submission).where(Submission.id == submission_id))
        return result.scalars().first()
