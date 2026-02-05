from __future__ import annotations

import asyncio
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Submission

router = APIRouter(prefix="/api/v1/submissions", tags=["Submissions"])


@router.post("/run")
async def run_code(
    problem_id: int,
    code: str,
    language: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Run code against sample test cases (STUBBED for MVP).
    Returns fake results after 2s delay to simulate execution.
    """
    user_id = int(current_user.get("id"))
    
    # Validate inputs
    if not code or len(code) < 5:
        raise HTTPException(status_code=400, detail="Code is required")
    if language not in ["python", "rust", "javascript"]:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
    
    # Create submission record
    submission = Submission(
        user_id=user_id,
        challenge_id=problem_id,
        code=code,
        language=language,
        status="RUNNING",
    )
    db.add(submission)
    await db.flush()
    await db.commit()
    
    # Simulate execution delay
    await asyncio.sleep(2)
    
    # Generate fake test results
    tests_total = random.randint(5, 10)
    tests_passed = random.randint(int(tests_total * 0.6), tests_total)
    
    # Update submission with fake results
    submission.status = "ACCEPTED" if tests_passed == tests_total else "WRONG_ANSWER"
    submission.result_summary = {
        "tests_passed": tests_passed,
        "tests_total": tests_total,
    }
    submission.execution_time_ms = random.randint(20, 150)
    submission.memory_usage_mb = random.randint(10, 50)
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "id": submission.id,
            "status": submission.status,
            "tests_passed": tests_passed,
            "tests_total": tests_total,
            "runtime_ms": submission.execution_time_ms,
            "memory_kb": submission.memory_usage_mb * 1024,
            "test_results": [
                {"passed": i < tests_passed, "input": f"Test {i+1}", "expected": "...", "actual": "..."}
                for i in range(tests_total)
            ]
        }
    }


@router.post("/submit")
async def submit_code(
    problem_id: int,
    code: str,
    language: str,
    battle_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Submit code for full evaluation (STUBBED for MVP).
    Returns ACCEPTED or WRONG_ANSWER randomly with fake metrics.
    """
    user_id = int(current_user.get("id"))
    
    # Validate inputs
    if not code or len(code) < 5:
        raise HTTPException(status_code=400, detail="Code is required")
    if language not in ["python", "rust", "javascript"]:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")
    
    # Create submission
    submission = Submission(
        user_id=user_id,
        challenge_id=problem_id,
        code=code,
        language=language,
        status="RUNNING",
    )
    db.add(submission)
    await db.flush()
    await db.commit()
    
    # Simulate execution delay
    await asyncio.sleep(2)
    
    # Generate fake results (70% acceptance rate)
    is_accepted = random.random() < 0.7
    tests_total = random.randint(10, 15)
    tests_passed = tests_total if is_accepted else random.randint(5, tests_total - 1)
    
    submission.status = "ACCEPTED" if is_accepted else "WRONG_ANSWER"
    submission.result_summary = {
        "tests_passed": tests_passed,
        "tests_total": tests_total,
        "accepted": is_accepted,
    }
    submission.execution_time_ms = random.randint(30, 200)
    submission.memory_usage_mb = random.randint(15, 80)
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "id": submission.id,
            "status": submission.status,
            "tests_passed": tests_passed,
            "tests_total": tests_total,
            "runtime_ms": submission.execution_time_ms,
            "memory_kb": submission.memory_usage_mb * 1024,
            "error_message": None if is_accepted else "Output mismatch on hidden test case",
        }
    }
