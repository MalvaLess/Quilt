from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.creator import Creator
from app.models.module import Module
from app.models.question import Question
from app.models.answer import Answer
from app.models.reward_option import RewardOption
from app.models.reward_selection import RewardSelection
from app.schemas.module import ModuleCreate, ModuleUpdate
from app.services.auth_service import get_current_creator
from app.services.ownership import get_owned_experience, get_owned_module

router = APIRouter(prefix="/api", tags=["modules"])


@router.post("/experiences/{experience_id}/modules")
def create_module(
    experience_id: int,
    data: ModuleCreate,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    get_owned_experience(experience_id, current_creator, db)

    module = Module(
        experience_id=experience_id,
        type=data.type,
        order_index=data.order_index,
        custom_reward_limit=data.custom_reward_limit,
    )
    db.add(module)
    db.commit()
    db.refresh(module)

    for q in data.questions:
        db.add(Question(module_id=module.id, **q.model_dump()))

    for r in data.reward_options:
        db.add(RewardOption(module_id=module.id, **r.model_dump()))

    db.commit()
    return {"id": module.id, "type": module.type, "order_index": module.order_index}


@router.put("/modules/{module_id}")
def update_module(
    module_id: int,
    data: ModuleUpdate,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    module = get_owned_module(module_id, current_creator, db)
    fields = data.model_dump(exclude_unset=True)

    if "order_index" in fields:
        module.order_index = fields["order_index"]
    if "custom_reward_limit" in fields:
        module.custom_reward_limit = fields["custom_reward_limit"]

    if data.questions is not None:
        has_answers = (
            db.query(Answer)
            .join(Question)
            .filter(Question.module_id == module.id)
            .first()
        )
        if has_answers:
            raise HTTPException(
                409,
                "No se pueden editar las preguntas: ya hay jugadores que respondieron este módulo",
            )
        for q in list(module.questions):
            db.delete(q)
        db.flush()
        for q in data.questions:
            db.add(Question(module_id=module.id, **q.model_dump()))

    if data.reward_options is not None:
        has_selections = (
            db.query(RewardSelection)
            .join(RewardOption)
            .filter(RewardOption.module_id == module.id)
            .first()
        )
        if has_selections:
            raise HTTPException(
                409,
                "No se pueden editar las recompensas: ya hay jugadores que eligieron una",
            )
        for r in list(module.reward_options):
            db.delete(r)
        db.flush()
        for r in data.reward_options:
            db.add(RewardOption(module_id=module.id, **r.model_dump()))

    db.commit()
    return {"id": module.id, "type": module.type, "order_index": module.order_index}


@router.delete("/modules/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    module = get_owned_module(module_id, current_creator, db)
    try:
        db.delete(module)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            409,
            "No se puede borrar: ya hay jugadores que respondieron o eligieron recompensas en este módulo",
        )
    return {"deleted": True}
