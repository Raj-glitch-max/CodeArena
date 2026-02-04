from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas.auth import SignupRequest, LoginRequest, AuthTokens, UserOut

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/signup")
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where((User.email == payload.email) | (User.username == payload.username)))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account exists")
    u = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(u)
    await db.flush()
    token = create_access_token(str(u.id))
    return {
        "success": True,
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": u.id, "username": u.username, "email": u.email, "rating": u.rating},
        },
    }


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    u = result.scalars().first()
    if not u or not verify_password(payload.password, u.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(u.id))
    return {
        "success": True,
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": u.id, "username": u.username, "email": u.email, "rating": u.rating},
        },
    }
