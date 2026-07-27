from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    theme_color = Column(String)
    description = Column(String)
    status = Column(String, default="draft")
    reward_threshold = Column(Integer, nullable=False, default=60, server_default="60")
    spend_points_on_claim = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("Creator", back_populates="experiences")
    modules = relationship(
        "Module",
        back_populates="experience",
        cascade="all, delete-orphan",
        order_by="Module.order_index",
    )
    players = relationship(
        "Player", back_populates="experience", cascade="all, delete-orphan"
    )
