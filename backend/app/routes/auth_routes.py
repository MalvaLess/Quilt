from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.creator import Creator
from app.rate_limit import limiter
from app.schemas.auth import (
    AccountDelete,
    AccountUpdate,
    CreatorCreate,
    CreatorLogin,
    CreatorOut,
    PasswordChange,
    Token,
)
from app.services.account_service import DELETION_GRACE_DAYS
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_creator,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=CreatorOut)
@limiter.limit("10/minute")
def register(request: Request, data: CreatorCreate, db: Session = Depends(get_db)):
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
@limiter.limit("10/minute")
def login(request: Request, data: CreatorLogin, db: Session = Depends(get_db)):
    creator = db.query(Creator).filter(Creator.email == data.email).first()
    if not creator or not verify_password(data.password, creator.password_hash):
        raise HTTPException(401, "Credenciales inválidas")

    reactivated = creator.deleted_at is not None
    if reactivated:
        creator.deleted_at = None
        db.commit()

    token = create_access_token({"sub": str(creator.id)})
    return {"access_token": token, "reactivated": reactivated}


@router.get("/me", response_model=CreatorOut)
def get_me(current_creator: Creator = Depends(get_current_creator)):
    return current_creator


@router.patch("/me", response_model=CreatorOut)
def update_me(
    data: AccountUpdate,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    if data.display_name is not None:
        current_creator.display_name = data.display_name
    db.commit()
    db.refresh(current_creator)
    return current_creator


@router.post("/change-password")
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    if not verify_password(data.current_password, current_creator.password_hash):
        raise HTTPException(401, "Contraseña actual incorrecta")
    current_creator.password_hash = hash_password(data.new_password)
    db.commit()
    return {"updated": True}


@router.post("/delete-account")
def delete_account(
    data: AccountDelete,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    if not verify_password(data.password, current_creator.password_hash):
        raise HTTPException(401, "Contraseña incorrecta")
    current_creator.deleted_at = datetime.now(timezone.utc)
    db.commit()
    purge_date = current_creator.deleted_at + timedelta(days=DELETION_GRACE_DAYS)
    return {"deleted": True, "purge_date": purge_date}
