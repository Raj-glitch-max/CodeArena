from __future__ import annotations

import os
from typing import AsyncGenerator

from redis.asyncio import Redis, from_url

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_redis: Redis | None = None


def get_redis_client() -> Redis:
    global _redis
    if _redis is None:
        _redis = from_url(REDIS_URL, decode_responses=True, max_connections=50)
    return _redis


async def get_redis() -> AsyncGenerator[Redis, None]:
    client = get_redis_client()
    try:
        yield client
    finally:
        pass
