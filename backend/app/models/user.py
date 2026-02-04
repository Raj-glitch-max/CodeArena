from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .algorithm import Algorithm


class User(Base):
    """
    Persistent user account model.

    Notes
    -----
    - ``rating`` represents the user's ELO rating.
    - Streak fields enable fast leaderboard and progression queries without
      requiring aggregation over the battles table.
    """

    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint("rating >= 0", name="chk_users_rating_non_negative"),
        CheckConstraint(
            "subscription_tier IN ('free', 'premium', 'elite')",
            name="chk_users_subscription_tier",
        ),
    )

    # Core identity
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Competitive stats / ELO
    rating: Mapped[int] = mapped_column(Integer, nullable=False, default=1000, index=True)
    battles_won: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    battles_lost: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Streak tracking
    win_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    loss_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    best_win_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Subscription / account state
    subscription_tier: Mapped[str] = mapped_column(
        String(20), nullable=False, default="free"
    )
    subscription_expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

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
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    algorithms: Mapped[List["Algorithm"]] = relationship(
        "Algorithm",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

