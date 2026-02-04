from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING','RUNNING','ACCEPTED','WRONG_ANSWER','TIME_LIMIT','RUNTIME_ERROR','MEMORY_LIMIT','FAILED')",
            name="chk_submissions_status",
        ),
        CheckConstraint(
            "language IN ('python','rust','javascript')",
            name="chk_submissions_language",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    algorithm_id: Mapped[Optional[int]] = mapped_column(ForeignKey("algorithms.id", ondelete="SET NULL"), nullable=True, index=True)
    challenge_id: Mapped[int] = mapped_column(Integer, index=True)

    code: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(20), nullable=False)

    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)
    result_summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    stdout: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stderr: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    memory_usage_mb: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
