from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me")
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(User).where(User.id == int(current_user.get("id"))))
    u = result.scalars().first()
    if not u:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "User not found"}}
    return {
        "success": True,
        "data": {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "rating": u.rating,
            "battles_won": u.battles_won,
            "battles_lost": u.battles_lost,
            "win_streak": u.win_streak,
            "loss_streak": u.loss_streak,
            "best_win_streak": u.best_win_streak,
        },
    }
