from __future__ import annotations

from dataclasses import dataclass

from redis.asyncio import Redis


@dataclass
class QueuePosition:
    position: int
    size: int


class MatchmakerService:
    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    @staticmethod
    def _queue_key(difficulty: str, language: str) -> str:
        return f"queue:{difficulty}:{language}"

    @staticmethod
    def _member(user_id: int, algorithm_id: int) -> str:
        return f"{user_id}:{algorithm_id}"

    async def add_to_queue(self, *, user_id: int, elo: int, difficulty: str, language: str, algorithm_id: int) -> QueuePosition:
        key = self._queue_key(difficulty, language)
        member = self._member(user_id, algorithm_id)
        await self.redis.zadd(key, {member: elo})
        rank = await self.redis.zrank(key, member)
        size = await self.redis.zcard(key)
        if rank is None:
            rank = size - 1
        return QueuePosition(position=rank + 1, size=size)

    async def remove_from_all_queues(self, *, user_id: int) -> int:
        removed = 0
        async for key in self.redis.scan_iter(match="queue:*"):
            members = await self.redis.zrange(key, 0, -1)
            to_remove = [m for m in members if m.startswith(f"{user_id}:")]
            if to_remove:
                removed += await self.redis.zrem(key, *to_remove)
        return removed
