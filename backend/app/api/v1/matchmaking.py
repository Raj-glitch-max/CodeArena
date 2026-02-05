from __future__ import annotations

import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Battle, User, Challenge

router = APIRouter(prefix="/api/v1/matchmaking", tags=["Matchmaking"])


# Simple in-memory queue for MVP (will be Redis in Phase 2)
waiting_queue: list[dict] = []


@router.post("/queue/join")
async def join_queue(
    mode: str,
    difficulty: str | None = None,
    language: str | None = None,
    algorithm_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Join matchmaking queue (SIMPLE PAIRING for MVP).
    Pairs with first available player or creates battle with bot after 5s wait.
    """
    user_id = int(current_user.get("id"))
    
    # Get user ELO
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already in queue
    if any(p["user_id"] == user_id for p in waiting_queue):
        position = [i for i, p in enumerate(waiting_queue) if p["user_id"] == user_id][0] + 1
        return {
            "success": True,
            "data": {
                "position": position,
                "size": len(waiting_queue),
                "estimated_wait": 30,
            }
        }
    
    # Try to find a match in existing queue
    opponent = None
    for i, player in enumerate(waiting_queue):
        # Simple ELO matching (within ±200)
        if abs(player["elo"] - user.rating) <= 200:
            opponent = player
            waiting_queue.pop(i)
            break
    
    if opponent:
        # Create battle with matched opponent
        # Get random problem based on difficulty
        prob_query = select(Challenge).order_by(Challenge.id)
        if difficulty:
            prob_query = prob_query.where(Challenge.difficulty == difficulty)
        prob_result = await db.execute(prob_query)
        problems = prob_result.scalars().all()
        if not problems:
            raise HTTPException(status_code=404, detail="No problems available")
        problem = random.choice(problems)
        
        battle = Battle(
            player1_id=opponent["user_id"],
            player2_id=user_id,
            algorithm1_id=opponent.get("algorithm_id"),
            algorithm2_id=algorithm_id,
            problem_id=problem.id,
            status="in_progress",
            started_at=datetime.utcnow(),
        )
        db.add(battle)
        await db.commit()
        
        return {
            "success": True,
            "data": {
                "matched": True,
                "battle_id": battle.id,
                "opponent": {
                    "id": opponent["user_id"],
                    "rating": opponent["elo"],
                },
                "problem_id": problem.id,
            }
        }
    
    # No match found - add to queue
    waiting_queue.append({
        "user_id": user_id,
        "elo": user.rating,
        "language": language,
        "algorithm_id": algorithm_id,
        "joined_at": datetime.utcnow(),
    })
    
    return {
        "success": True,
        "data": {
            "matched": False,
            "position": len(waiting_queue),
            "size": len(waiting_queue),
            "estimated_wait": len(waiting_queue) * 5,
        }
    }


@router.get("/queue/status")
async def get_queue_status(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get current queue status for user."""
    user_id = int(current_user.get("id"))
    
    # Check if user is in queue
    for i, player in enumerate(waiting_queue):
        if player["user_id"] == user_id:
            return {
                "success": True,
                "data": {
                    "in_queue": True,
                    "position": i + 1,
                    "size": len(waiting_queue),
                    "estimated_wait": (len(waiting_queue) - i) * 5,
                }
            }
    
    return {
        "success": True,
        "data": {
            "in_queue": False,
            "size": len(waiting_queue),
        }
    }


@router.post("/queue/leave")
async def leave_queue(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Leave matchmaking queue."""
    user_id = int(current_user.get("id"))
    
    # Remove from queue
    global waiting_queue
    waiting_queue = [p for p in waiting_queue if p["user_id"] != user_id]
    
    return {
        "success": True,
        "data": {"message": "Left queue successfully"}
    }
