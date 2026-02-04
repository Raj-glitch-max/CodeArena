from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .user import User


class Algorithm(Base):
    """
    Algorithm organism model.

    This represents a persistent, battle-ready organism owned by a user.
    It tracks lifecycle (permadeath), evolution lineage, traits, and performance
    metrics as described in ``projectIDEA.mdc`` and ``database_API.mdc``.
    """

    __tablename__ = "algorithms"

    __table_args__ = (
        CheckConstraint(
            "language IN ('python', 'rust', 'javascript')",
            name="chk_algorithms_language",
        ),
        CheckConstraint(
            "death_count <= 3",
            name="chk_algorithms_death_count",
        ),
    )

    # Identity / ownership
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Source & language
    code: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(20), nullable=False)

    # Metadata
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Battle stats
    battles_won: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    battles_lost: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Lifecycle / permadeath
    death_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_alive: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    generation: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    parent_algorithm_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("algorithms.id"),
        nullable=True,
    )

    # Traits & performance
    traits: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    avg_execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    avg_memory_usage_mb: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    killed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="algorithms",
    )
    parent_algorithm: Mapped[Optional["Algorithm"]] = relationship(
        "Algorithm",
        remote_side="Algorithm.id",
        back_populates="children",
    )
    children: Mapped[List["Algorithm"]] = relationship(
        "Algorithm",
        back_populates="parent_algorithm",
        cascade="all, delete-orphan",
    )

