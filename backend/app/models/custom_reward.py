from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class CustomReward(Base):
    __tablename__ = "custom_rewards"

    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    label = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    player = relationship("Player", back_populates="custom_rewards")
    module = relationship("Module", back_populates="custom_rewards")
