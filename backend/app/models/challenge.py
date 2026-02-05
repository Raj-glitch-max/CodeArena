from __future__ import annotations

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Challenge(Base):
    """
    Coding problem/challenge model.
    
    Stores problem details, test cases, starter code, and metadata.
    """
    __tablename__ = "challenges"
    __table_args__ = (
        CheckConstraint(
            "difficulty IN ('easy','medium','hard')",
            name="chk_challenges_difficulty",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(250), nullable=False, unique=True, index=True)
    difficulty: Mapped[str] = mapped_column(String(16), nullable=False, default="easy", index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    
    # Additional fields for frontend
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    constraints: Mapped[list] = mapped_column(JSON, nullable=True)
    examples: Mapped[list] = mapped_column(JSON, nullable=True)  # [{input, output, explanation}]
    starter_code: Mapped[dict] = mapped_column(JSON, nullable=True)  # {language: code}
    test_cases: Mapped[list] = mapped_column(JSON, nullable=False, default=list)  # [{input, output, is_hidden}]
    
    # Stats
    acceptance_rate: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    submissions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    solved_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
