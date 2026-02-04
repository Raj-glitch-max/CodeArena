from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import engine, Base, AsyncSessionLocal
from app.models import User, Algorithm, Submission  # noqa: F401
from app.core.security import hash_password


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:  # type: AsyncSession
        user = await session.get(User, 1)
        if not user:
            user = User(id=1, username="dev", email="dev@example.com", password_hash=hash_password("password123"), rating=1000)
            session.add(user)
            await session.flush()
        else:
            user.password_hash = hash_password("password123")
        algo = None
        # Ensure at least one algorithm for user 1
        from sqlalchemy import select
        result = await session.execute(select(Algorithm).where(Algorithm.user_id == 1))
        algo = result.scalars().first()
        if not algo:
            algo = Algorithm(
                user_id=1,
                code="def solve(x):\n    return x\n",
                language="python",
                name="dev_algo",
                is_alive=True,
                death_count=0,
                generation=1,
                traits=[],
            )
            session.add(algo)
        await session.commit()
        print({"user_id": user.id, "algorithm_id": algo.id})


if __name__ == "__main__":
    asyncio.run(init_db())
