from __future__ import annotations

from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.redis import get_redis
from app.models import User, Algorithm
from app.schemas.matchmaking import JoinQueueRequest, QueuePositionResponse
from app.services.matchmaker import MatchmakerService

router = APIRouter(prefix="/api/v1", tags=["Matchmaking"])


@router.post("/matchmaking/queue/join")
async def join_queue(
    payload: JoinQueueRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user.get("id", 0))
    elo = 1000
    result = await db.execute(select(User.rating).where(User.id == user_id))
    row = result.first()
    if row is not None:
        elo = int(row[0])
    algo_q = await db.execute(
        select(Algorithm).where(
            Algorithm.id == payload.algorithm_id,
            Algorithm.user_id == user_id,
        )
    )
    algo = algo_q.scalars().first()
    if not algo:
        return {"success": False, "error": {"code": "ALGORITHM_NOT_FOUND", "message": "Algorithm not found"}}
    if not algo.is_alive:
        return {"success": False, "error": {"code": "ALGORITHM_DEAD", "message": "Algorithm is not alive"}}
    if algo.language != payload.language:
        return {"success": False, "error": {"code": "LANGUAGE_MISMATCH", "message": "Language mismatch"}}
    svc = MatchmakerService(redis)
    qp = await svc.add_to_queue(
        user_id=user_id,
        elo=elo,
        difficulty=payload.difficulty,
        language=payload.language,
        algorithm_id=payload.algorithm_id,
    )
    return {
        "success": True,
        "data": {
            "position": qp.position,
            "size": qp.size,
            "queue": f"queue:{payload.difficulty}:{payload.language}",
        },
    }


@router.post("/matchmaking/queue/leave")
async def leave_queue(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user.get("id", 0))
    svc = MatchmakerService(redis)
    removed = await svc.remove_from_all_queues(user_id=user_id)
    return {"success": True, "data": {"removed": removed}}
