from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class RewardSelection(Base):
    __tablename__ = "reward_selections"

    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    reward_option_id = Column(
        Integer, ForeignKey("reward_options.id", ondelete="CASCADE"), nullable=True
    )
    custom_reward_id = Column(
        Integer, ForeignKey("custom_rewards.id", ondelete="CASCADE"), nullable=True
    )
    chosen_date = Column(Date, nullable=True)
    chosen_time = Column(Time, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    player = relationship("Player", back_populates="reward_selections")
    reward_option = relationship("RewardOption")
    custom_reward = relationship("CustomReward")
