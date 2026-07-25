from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Player(Base):
    __tablename__ = "players"
    __table_args__ = (
        UniqueConstraint("experience_id", "name", name="uq_player_per_experience"),
    )

    id = Column(Integer, primary_key=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    name = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)  # para retomar sin login
    total_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    experience = relationship("Experience", back_populates="players")
    answers = relationship(
        "Answer", back_populates="player", cascade="all, delete-orphan"
    )
    reward_selections = relationship(
        "RewardSelection", back_populates="player", cascade="all, delete-orphan"
    )
    custom_rewards = relationship(
        "CustomReward", back_populates="player", cascade="all, delete-orphan"
    )
