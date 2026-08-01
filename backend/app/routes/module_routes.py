from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.creator import Creator
from app.models.module import Module
from app.models.question import Question
from app.models.answer import Answer
from app.models.reward_option import RewardOption
from app.schemas.module import ModuleCreate, ModuleUpdate
from app.services.auth_service import get_current_creator
from app.services.ownership import get_owned_experience, get_owned_module
from app.services.uploads import purge_orphaned_images

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
        custom_reward_unlock_points=data.custom_reward_unlock_points,
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
    if "custom_reward_unlock_points" in fields:
        module.custom_reward_unlock_points = fields["custom_reward_unlock_points"]

    orphaned_image_ids = set()

    if data.questions is not None:
        existing_by_id = {q.id: q for q in module.questions}
        incoming_ids = {q.id for q in data.questions if q.id is not None}

        for existing in list(module.questions):
            if existing.id in incoming_ids:
                continue
            if existing.image_id is not None:
                orphaned_image_ids.add(existing.image_id)
            db.delete(existing)
        db.flush()

        for q in data.questions:
            if q.id is not None and q.id in existing_by_id:
                row = existing_by_id[q.id]
                if row.image_id is not None and row.image_id != q.image_id:
                    orphaned_image_ids.add(row.image_id)
                row.prompt = q.prompt
                row.input_type = q.input_type
                row.points = q.points
                row.options = q.options
                row.repeatable = q.repeatable
                row.image_id = q.image_id
            else:
                db.add(
                    Question(
                        module_id=module.id,
                        prompt=q.prompt,
                        input_type=q.input_type,
                        points=q.points,
                        options=q.options,
                        repeatable=q.repeatable,
                        image_id=q.image_id,
                    )
                )

    if data.reward_options is not None:
        existing_by_id = {r.id: r for r in module.reward_options}
        incoming_ids = {r.id for r in data.reward_options if r.id is not None}

        for existing in list(module.reward_options):
            if existing.id in incoming_ids:
                continue
            db.delete(existing)
        db.flush()

        for r in data.reward_options:
            if r.id is not None and r.id in existing_by_id:
                row = existing_by_id[r.id]
                row.label = r.label
                row.description = r.description
                row.icon = r.icon
                row.unlock_points = r.unlock_points
                row.requires_datetime = r.requires_datetime
                row.one_per_player = r.one_per_player
            else:
                db.add(
                    RewardOption(
                        module_id=module.id,
                        label=r.label,
                        description=r.description,
                        icon=r.icon,
                        unlock_points=r.unlock_points,
                        requires_datetime=r.requires_datetime,
                        one_per_player=r.one_per_player,
                    )
                )

    db.commit()
    purge_orphaned_images(db, orphaned_image_ids)
    return {"id": module.id, "type": module.type, "order_index": module.order_index}


@router.delete("/modules/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    module = get_owned_module(module_id, current_creator, db)

    question_image_ids = {
        row[0]
        for row in db.query(Question.image_id)
        .filter(Question.module_id == module.id, Question.image_id.isnot(None))
        .all()
    }
    answer_image_ids = {
        row[0]
        for row in db.query(Answer.response_image_id)
        .join(Question, Answer.question_id == Question.id)
        .filter(Question.module_id == module.id, Answer.response_image_id.isnot(None))
        .all()
    }

    try:
        db.delete(module)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            409,
            "No se puede borrar: ya hay jugadores que respondieron o eligieron recompensas en este módulo",
        )

    purge_orphaned_images(db, question_image_ids | answer_image_ids)
    return {"deleted": True}
