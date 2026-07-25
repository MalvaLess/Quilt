from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class RewardOption(Base):
    __tablename__ = "reward_options"

    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    label = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)
    order_index = Column(Integer, default=0)
    unlock_points = Column(Integer, nullable=True)
    requires_datetime = Column(Boolean, nullable=False, default=False, server_default="false")

    module = relationship("Module", back_populates="reward_options")
