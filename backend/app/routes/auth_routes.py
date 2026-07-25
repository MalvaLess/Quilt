from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.creator import Creator
from app.schemas.auth import CreatorCreate, CreatorLogin, CreatorOut, Token
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_creator,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=CreatorOut)
def register(data: CreatorCreate, db: Session = Depends(get_db)):
    if db.query(Creator).filter(Creator.email == data.email).first():
        raise HTTPException(400, "Email ya registrado")
    creator = Creator(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )
    db.add(creator)
    db.commit()
    db.refresh(creator)
    return creator


@router.post("/login", response_model=Token)
def login(data: CreatorLogin, db: Session = Depends(get_db)):
    creator = db.query(Creator).filter(Creator.email == data.email).first()
    if not creator or not verify_password(data.password, creator.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    token = create_access_token({"sub": str(creator.id)})
    return {"access_token": token}


@router.get("/me", response_model=CreatorOut)
def get_me(current_creator: Creator = Depends(get_current_creator)):
    return current_creator
