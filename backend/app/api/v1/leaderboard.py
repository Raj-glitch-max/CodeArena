from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import User

router = APIRouter(prefix="/api/v1/leaderboard", tags=["Leaderboard"])


@router.get("")
async def get_leaderboard(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get top users by ELO rating."""
    result = await db.execute(
        select(User)
        .where(User.is_active == True)
        .order_by(desc(User.rating))
        .limit(limit)
    )
    users = result.scalars().all()
    
    items = []
    for rank, user in enumerate(users, start=1):
        total_battles = user.battles_won + user.battles_lost
        win_rate = (user.battles_won / total_battles * 100) if total_battles > 0 else 0
        
        items.append({
            "rank": rank,
            "user": {
                "id": user.id,
                "username": user.username,
                "avatar_url": None,  # Not implemented yet
            },
            "rating": user.rating,
            "wins": user.battles_won,
            "losses": user.battles_lost,
            "win_rate": round(win_rate, 1),
            "streak": user.win_streak,
        })
    
    return {"success": True, "data": items}
