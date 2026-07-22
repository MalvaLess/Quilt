from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("Creator", back_populates="experiences")
    modules = relationship(
        "Module",
        back_populates="experience",
        cascade="all, delete-orphan",
        order_by="Module.order_index",
    )
    play_sessions = relationship(
        "PlaySession", back_populates="experience", cascade="all, delete-orphan"
    )
