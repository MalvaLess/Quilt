from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    type = Column(String, nullable=False)  # question | minigame | reward_picker | info
    order_index = Column(Integer, nullable=False, default=0)
    custom_reward_limit = Column(Integer, nullable=True)  # solo aplica a reward_picker; None/0 = deshabilitado

    experience = relationship("Experience", back_populates="modules")
    questions = relationship(
        "Question", back_populates="module", cascade="all, delete-orphan"
    )
    reward_options = relationship(
        "RewardOption",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="RewardOption.order_index",
    )
    custom_rewards = relationship(
        "CustomReward", back_populates="module", cascade="all, delete-orphan"
    )
