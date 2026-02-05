from __future__ import annotations

import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Battle, User, Challenge

router = APIRouter(prefix="/api/v1/battles", tags=["Battles"])


@router.get("")
async def list_battles(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all battles for current user."""
    user_id = int(current_user.get("id"))
    
    result = await db.execute(
        select(Battle)
        .where(or_(Battle.player1_id == user_id, Battle.player2_id == user_id))
        .order_by(Battle.created_at.desc())
        .limit(50)
    )
    battles = result.scalars().all()
    
    items = []
    for b in battles:
        # Get player info
        p1 = await db.get(User, b.player1_id)
        p2 = await db.get(User, b.player2_id)
        prob = await db.get(Challenge, b.problem_id)
        
        items.append({
            "id": b.id,
            "problem_id": b.problem_id,
            "problem": {"id": prob.id, "title": prob.title, "difficulty": prob.difficulty} if prob else None,
            "player1_id": b.player1_id,
            "player2_id": b.player2_id,
            "player1": {"id": p1.id, "username": p1.username, "rating": p1.rating} if p1 else None,
            "player2": {"id": p2.id, "username": p2.username, "rating": p2.rating} if p2 else None,
            "winner_id": b.winner_id,
            "status": b.status,
            "player1_score": b.player1_score,
            "player2_score": b.player2_score,
            "player1_elo_change": b.player1_elo_change,
            "player2_elo_change": b.player2_elo_change,
            "duration_seconds": b.duration_seconds,
            "started_at": b.started_at.isoformat() if b.started_at else None,
            "ended_at": b.ended_at.isoformat() if b.ended_at else None,
        })
    
    return {"success": True, "data": items}


@router.get("/{battle_id}")
async def get_battle(
    battle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get battle details."""
    user_id = int(current_user.get("id"))
    battle = await db.get(Battle, battle_id)
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    
    # Check if user is participant
    if battle.player1_id != user_id and battle.player2_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this battle")
    
    # Get related data
    p1 = await db.get(User, battle.player1_id)
    p2 = await db.get(User, battle.player2_id)
    prob = await db.get(Challenge, battle.problem_id)
    
    return {
        "success": True,
        "data": {
            "id": battle.id,
            "problem_id": battle.problem_id,
            "problem": {
                "id": prob.id,
                "title": prob.title,
                "difficulty": prob.difficulty,
                "description": prob.description,
                "examples": prob.examples or [],
                "starter_code": prob.starter_code or {},
            } if prob else None,
            "player1": {"id": p1.id, "username": p1.username, "rating": p1.rating} if p1 else None,
            "player2": {"id": p2.id, "username": p2.username, "rating": p2.rating} if p2 else None,
            "winner_id": battle.winner_id,
            "status": battle.status,
            "player1_score": battle.player1_score,
            "player2_score": battle.player2_score,
            "player1_elo_change": battle.player1_elo_change,
            "player2_elo_change": battle.player2_elo_change,
            "duration_seconds": battle.duration_seconds,
            "started_at": battle.started_at.isoformat() if battle.started_at else None,
            "ended_at": battle.ended_at.isoformat() if battle.ended_at else None,
        }
    }


@router.get("/{battle_id}/state")
async def get_battle_state(
    battle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get current battle state for polling (MVP HTTP polling instead of WebSocket).
    Returns timer, scores, and status.
    """
    user_id = int(current_user.get("id"))
    battle = await db.get(Battle, battle_id)
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    
    # Check authorization
    if battle.player1_id != user_id and battle.player2_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Calculate time remaining (assuming 30min battles)
    time_remaining = 1800  # 30 minutes default
    if battle.started_at:
        elapsed = (datetime.utcnow() - battle.started_at).total_seconds()
        time_remaining = max(0, 1800 - int(elapsed))
    
    return {
        "success": True,
        "data": {
            "battle_id": battle.id,
            "status": battle.status,
            "timer_remaining": time_remaining,
            "player1_tests_passed": battle.player1_metrics.get("tests_passed", 0) if battle.player1_metrics else 0,
            "player2_tests_passed": battle.player2_metrics.get("tests_passed", 0) if battle.player2_metrics else 0,
            "player1_score": battle.player1_score or 0,
            "player2_score": battle.player2_score or 0,
        }
    }


@router.post("/{battle_id}/submit")
async def submit_battle_solution(
    battle_id: int,
    code: str,
    language: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Submit solution for battle (STUBBED for MVP).
    Returns fake results and potentially ends battle.
    """
    user_id = int(current_user.get("id"))
    battle = await db.get(Battle, battle_id)
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    
    # Check if user is in this battle
    if battle.player1_id != user_id and battle.player2_id != user_id:
        raise HTTPException(status_code=403, detail="Not in this battle")
    
    if battle.status == "completed":
        raise HTTPException(status_code=400, detail="Battle already completed")
    
    # Generate fake test results
    tests_total = random.randint(10, 15)
    tests_passed = random.randint(7, tests_total)
    score = (tests_passed / tests_total) * 100
    
    # Update battle metrics
    is_player1 = battle.player1_id == user_id
    if is_player1:
        battle.player1_score = int(score)
        battle.player1_metrics = {"tests_passed": tests_passed, "tests_total": tests_total}
    else:
        battle.player2_score = int(score)
        battle.player2_metrics = {"tests_passed": tests_passed, "tests_total": tests_total}
    
    # Check if both players submitted - if so, end battle
    if battle.player1_score is not None and battle.player2_score is not None:
        battle.status = "completed"
        battle.ended_at = datetime.utcnow()
        
        # Determine winner
        if battle.player1_score > battle.player2_score:
            battle.winner_id = battle.player1_id
        elif battle.player2_score > battle.player1_score:
            battle.winner_id = battle.player2_id
        # else: draw (winner_id stays None)
        
        # Calculate ELO changes (simple +25/-25 for MVP)
        if battle.winner_id == battle.player1_id:
            battle.player1_elo_change = 25
            battle.player2_elo_change = -25
        elif battle.winner_id == battle.player2_id:
            battle.player1_elo_change = -25
            battle.player2_elo_change = 25
        else:
            # Draw
            battle.player1_elo_change = 0
            battle.player2_elo_change = 0
        
        # Update user ratings
        p1 = await db.get(User, battle.player1_id)
        p2 = await db.get(User, battle.player2_id)
        if p1:
            p1.rating += battle.player1_elo_change
            if battle.winner_id == p1.id:
                p1.battles_won += 1
                p1.win_streak += 1
                p1.loss_streak = 0
                if p1.win_streak > p1.best_win_streak:
                    p1.best_win_streak = p1.win_streak
            else:
                p1.battles_lost += 1
                p1.loss_streak += 1
                p1.win_streak = 0
        
        if p2:
            p2.rating += battle.player2_elo_change
            if battle.winner_id == p2.id:
                p2.battles_won += 1
                p2.win_streak += 1
                p2.loss_streak = 0
                if p2.win_streak > p2.best_win_streak:
                    p2.best_win_streak = p2.win_streak
            else:
                p2.battles_lost += 1
                p2.loss_streak += 1
                p2.win_streak = 0
    
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "battle_id": battle.id,
            "tests_passed": tests_passed,
            "tests_total": tests_total,
            "score": int(score),
            "battle_status": battle.status,
            "winner_id": battle.winner_id,
        }
    }
