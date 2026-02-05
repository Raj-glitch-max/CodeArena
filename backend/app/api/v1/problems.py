from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Challenge
from app.schemas.challenges import ChallengeCreate, ChallengeOut, ChallengeUpdate

router = APIRouter(prefix="/api/v1/problems", tags=["Problems"])


@router.get("")
async def list_problems(
    difficulty: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """List all problems with optional filtering."""
    query = select(Challenge).order_by(Challenge.id)
    
    if difficulty:
        query = query.where(Challenge.difficulty == difficulty)
    if search:
        query = query.where(Challenge.title.ilike(f"%{search}%"))
    
    result = await db.execute(query)
    items = [
        {
            "id": c.id,
            "title": c.title,
            "slug": c.slug,
            "difficulty": c.difficulty,
            "description": c.description,
            "tags": c.tags or [],
            "acceptance_rate": c.acceptance_rate,
            "submissions_count": c.submissions_count,
            "solved_count": c.solved_count,
        }
        for c in result.scalars().all()
    ]
    return {"success": True, "data": items}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_problem(payload: ChallengeCreate, db: AsyncSession = Depends(get_db)):
    c = Challenge(title=payload.title, difficulty=payload.difficulty, description=payload.description)
    db.add(c)
    await db.flush()
    await db.commit()
    return {"success": True, "data": {"id": c.id, "title": c.title, "difficulty": c.difficulty, "description": c.description}}


@router.get("/{problem_id}")
async def get_problem(problem_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed problem with examples, starter code, and test cases."""
    c = await db.get(Challenge, problem_id)
    if not c:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {
        "success": True,
        "data": {
            "id": c.id,
            "title": c.title,
            "slug": c.slug,
            "difficulty": c.difficulty,
            "description": c.description,
            "tags": c.tags or [],
            "constraints": c.constraints or [],
            "examples": c.examples or [],
            "starter_code": c.starter_code or {},
            "acceptance_rate": c.acceptance_rate,
            "submissions_count": c.submissions_count,
        }
    }


@router.patch("/{problem_id}")
async def update_problem(problem_id: int, payload: ChallengeUpdate, db: AsyncSession = Depends(get_db)):
    c = await db.get(Challenge, problem_id)
    if not c:
        raise HTTPException(status_code=404, detail="Problem not found")
    if payload.title is not None:
        c.title = payload.title
    if payload.difficulty is not None:
        c.difficulty = payload.difficulty
    if payload.description is not None:
        c.description = payload.description
    await db.flush()
    await db.commit()
    return {"success": True, "data": {"id": c.id, "title": c.title, "difficulty": c.difficulty, "description": c.description}}


@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_problem(problem_id: int, db: AsyncSession = Depends(get_db)):
    c = await db.get(Challenge, problem_id)
    if not c:
        raise HTTPException(status_code=404, detail="Problem not found")
    await db.delete(c)
    await db.commit()
    return {"success": True}
