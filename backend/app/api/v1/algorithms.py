from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Algorithm

router = APIRouter(prefix="/api/v1/algorithms", tags=["Algorithms"])


@router.get("")
async def list_my_algorithms(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all algorithms owned by the current user."""
    user_id = int(current_user.get("id"))
    result = await db.execute(
        select(Algorithm)
        .where(Algorithm.user_id == user_id)
        .order_by(Algorithm.created_at.desc())
    )
    items = []
    for a in result.scalars().all():
        items.append(
            {
                "id": a.id,
                "name": a.name or f"Algorithm #{a.id}",
                "user_id": a.user_id,
                "language": a.language,
                "battles_won": a.battles_won,
                "battles_lost": a.battles_lost,
                "death_count": a.death_count,
                "is_alive": a.is_alive,
                "generation": a.generation,
                "traits": a.traits or [],
                "rating": 1000 + (a.battles_won * 25) - (a.battles_lost * 25),  # Simple rating calc
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
        )
    return {"success": True, "data": items}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_algorithm(
    name: str,
    code: str,
    language: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new algorithm organism."""
    user_id = int(current_user.get("id"))
    
    # Validate language
    if language not in ["python", "rust", "javascript"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid language: {language}. Must be python, rust, or javascript."
        )
    
    # Validate code length
    if not code or len(code) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code must be at least 10 characters"
        )
    
    algo = Algorithm(
        user_id=user_id,
        name=name,
        code=code,
        language=language,
        is_alive=True,
        generation=1,
    )
    db.add(algo)
    await db.flush()
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "id": algo.id,
            "name": algo.name,
            "language": algo.language,
            "is_alive": algo.is_alive,
            "generation": algo.generation,
            "user_id": algo.user_id,
        }
    }


@router.get("/{algorithm_id}")
async def get_algorithm(
    algorithm_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get algorithm details."""
    algo = await db.get(Algorithm, algorithm_id)
    if not algo:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    # Check ownership
    user_id = int(current_user.get("id"))
    if algo.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this algorithm")
    
    return {
        "success": True,
        "data": {
            "id": algo.id,
            "name": algo.name,
            "code": algo.code,
            "language": algo.language,
            "battles_won": algo.battles_won,
            "battles_lost": algo.battles_lost,
            "death_count": algo.death_count,
            "is_alive": algo.is_alive,
            "generation": algo.generation,
            "traits": algo.traits or [],
            "created_at": algo.created_at.isoformat() if algo.created_at else None,
        }
    }
