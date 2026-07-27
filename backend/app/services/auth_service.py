import os
from datetime import datetime, timedelta
from fastapi import Depends, Header, HTTPException
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.creator import Creator

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None


def get_current_creator(
    authorization: str | None = Header(None), db: Session = Depends(get_db)
) -> Creator:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "No autenticado")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Token inválido o expirado")

    creator = db.query(Creator).get(int(payload["sub"]))
    if not creator:
        raise HTTPException(401, "Creador no encontrado")
    if creator.deleted_at is not None:
        raise HTTPException(401, "Cuenta eliminada")
    return creator
