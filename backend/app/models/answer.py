from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    play_session_id = Column(Integer, ForeignKey("play_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    response_text = Column(String)
    points_awarded = Column(Integer, default=0)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    play_session = relationship("PlaySession", back_populates="answers")
    question = relationship("Question", back_populates="answers")
