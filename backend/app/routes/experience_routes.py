from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.experience import Experience
from app.schemas.experience import ExperienceCreate, ExperienceOut

router = APIRouter(prefix="/api/experiences", tags=["experiences"])


@router.post("/", response_model=ExperienceOut)
def create_experience(
    data: ExperienceCreate, creator_id: int, db: Session = Depends(get_db)
):
    exp = Experience(**data.model_dump(), creator_id=creator_id)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.get("/", response_model=list[ExperienceOut])
def list_experiences(db: Session = Depends(get_db)):
    return db.query(Experience).all()


@router.get("/{experience_id}", response_model=ExperienceOut)
def get_experience(experience_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experience).get(experience_id)
    if not exp:
        raise HTTPException(404, "No encontrada")
    return exp
