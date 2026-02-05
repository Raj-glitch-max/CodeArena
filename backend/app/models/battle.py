from __future__ import annotations

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .user import User
    from .algorithm import Algorithm
    from .challenge import Challenge


class Battle(Base):
    """
    Battle/Match model for 1v1 coding battles.
    
    Tracks two players competing on a problem with their algorithms.
    Stores results, ELO changes, and battle state.
    """
    
    __tablename__ = "battles"
    
    __table_args__ = (
        CheckConstraint(
            "status IN ('waiting', 'in_progress', 'completed', 'cancelled')",
            name="chk_battles_status",
        ),
        CheckConstraint(
            "player1_id != player2_id",
            name="chk_battles_different_players",
        ),
    )
    
    # Identity
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Players
    player1_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    player2_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    
    # Algorithms used
    algorithm1_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("algorithms.id"),
        nullable=True,
        index=True,
    )
    algorithm2_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("algorithms.id"),
        nullable=True,
        index=True,
    )
    
    # Problem
    problem_id: Mapped[int] = mapped_column(
        ForeignKey("challenges.id"),
        nullable=False,
        index=True,
    )
    
    # Status
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="waiting",
        index=True,
    )
    
    # Results
    winner_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    player1_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    player2_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
   # ELO changes
    player1_elo_change: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    player2_elo_change: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Battle metrics (JSON for flexibility)
    player1_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    player2_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Duration
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
