from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.creator import Creator
from app.models.experience import Experience
from app.models.module import Module


def get_owned_experience(experience_id: int, current_creator: Creator, db: Session) -> Experience:
    experience = db.query(Experience).get(experience_id)
    if not experience:
        raise HTTPException(404, "Experiencia no encontrada")
    if experience.creator_id != current_creator.id:
        raise HTTPException(403, "No tenés permiso sobre esta experiencia")
    return experience


def get_owned_module(module_id: int, current_creator: Creator, db: Session) -> Module:
    module = db.query(Module).get(module_id)
    if not module:
        raise HTTPException(404, "Módulo no encontrado")
    if module.experience.creator_id != current_creator.id:
        raise HTTPException(403, "No tenés permiso sobre este módulo")
    return module
