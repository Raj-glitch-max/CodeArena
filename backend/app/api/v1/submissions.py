from __future__ import annotations

from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.redis import get_redis
from app.schemas.submissions import SubmissionRunRequest
from app.services.submission_service import SubmissionService

router = APIRouter(prefix="/api/v1", tags=["Submissions"])


@router.post("/submissions/run")
async def run_submission(
    payload: SubmissionRunRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user.get("id", 0))
    svc = SubmissionService(db, redis)
    s = await svc.create_submission(
        user_id=user_id,
        challenge_id=payload.challenge_id,
        code=payload.code,
        language=payload.language,
        algorithm_id=payload.algorithm_id,
    )
    await svc.enqueue(submission_id=s.id, mode="run")
    return {"success": True, "data": {"id": s.id, "status": s.status}}


@router.post("/submissions/submit")
async def submit_submission(
    payload: SubmissionRunRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user.get("id", 0))
    svc = SubmissionService(db, redis)
    s = await svc.create_submission(
        user_id=user_id,
        challenge_id=payload.challenge_id,
        code=payload.code,
        language=payload.language,
        algorithm_id=payload.algorithm_id,
    )
    await svc.enqueue(submission_id=s.id, mode="submit")
    return {"success": True, "data": {"id": s.id, "status": s.status}}


@router.get("/submissions/{submission_id}")
async def get_submission_status(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user=Depends(get_current_user),
):
    svc = SubmissionService(db, redis)
    s = await svc.get_status(submission_id)
    if not s:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Submission not found"}}
    return {
        "success": True,
        "data": {
            "id": s.id,
            "status": s.status,
            "result_summary": s.result_summary,
            "execution_time_ms": s.execution_time_ms,
            "memory_usage_mb": s.memory_usage_mb,
        },
    }
