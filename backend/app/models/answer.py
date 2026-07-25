from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    response_text = Column(String)
    points_awarded = Column(Integer, default=0)
    skipped = Column(Boolean, nullable=False, default=False, server_default="false")
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    player = relationship("Player", back_populates="answers")
    question = relationship("Question", back_populates="answers")