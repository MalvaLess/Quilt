import uuid
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class PlaySession(Base):
    __tablename__ = "play_sessions"

    id = Column(Integer, primary_key=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    player_label = Column(String, nullable=True)
    token = Column(String, unique=True, default=lambda: uuid.uuid4().hex)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    total_points = Column(Integer, default=0)

    experience = relationship("Experience", back_populates="play_sessions")
    answers = relationship(
        "Answer", back_populates="play_session", cascade="all, delete-orphan"
    )
    reward_selection = relationship(
        "RewardSelection",
        back_populates="play_session",
        uselist=False,
        cascade="all, delete-orphan",
    )
