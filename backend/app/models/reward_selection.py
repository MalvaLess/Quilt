from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class RewardSelection(Base):
    __tablename__ = "reward_selections"

    id = Column(Integer, primary_key=True)
    play_session_id = Column(
        Integer, ForeignKey("play_sessions.id"), unique=True, nullable=False
    )
    reward_option_id = Column(Integer, ForeignKey("reward_options.id"), nullable=False)
    chosen_date = Column(Date, nullable=True)
    chosen_time = Column(Time, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    play_session = relationship("PlaySession", back_populates="reward_selection")
    reward_option = relationship("RewardOption")
