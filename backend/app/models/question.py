from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    prompt = Column(String, nullable=False)
    input_type = Column(String, default="text")  # text | multiple_choice
    points = Column(Integer, default=15)
    options = Column(JSON, nullable=True)
    repeatable = Column(Boolean, default=False)
    image_id = Column(Integer, ForeignKey("uploaded_images.id"), nullable=True)

    module = relationship("Module", back_populates="questions")
    answers = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan"
    )
    image = relationship("UploadedImage")
