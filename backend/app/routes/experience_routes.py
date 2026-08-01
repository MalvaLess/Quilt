from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
from app.database import get_db
from app.models.answer import Answer
from app.models.creator import Creator
from app.models.experience import Experience
from app.models.module import Module
from app.models.player import Player
from app.models.question import Question
from app.schemas.experience import ExperienceCreate, ExperienceOut, ExperienceUpdate
from app.services.auth_service import get_current_creator
from app.services.ownership import get_owned_experience
from app.services.uploads import image_url, purge_orphaned_images

router = APIRouter(prefix="/api/experiences", tags=["experiences"])


@router.post("/", response_model=ExperienceOut)
def create_experience(
    data: ExperienceCreate,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    exp = Experience(**data.model_dump(), creator_id=current_creator.id)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.get("/mine", response_model=list[ExperienceOut])
def list_my_experiences(
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    return db.query(Experience).filter(Experience.creator_id == current_creator.id).all()


@router.get("/{experience_id}", response_model=ExperienceOut)
def get_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    return get_owned_experience(experience_id, current_creator, db)


@router.get("/{experience_id}/full")
def get_experience_full(
    experience_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    owned = get_owned_experience(experience_id, current_creator, db)
    exp = (
        db.query(Experience)
        .options(
            selectinload(Experience.modules).selectinload(Module.questions).joinedload(Question.image),
            selectinload(Experience.modules).selectinload(Module.reward_options),
        )
        .filter(Experience.id == owned.id)
        .first()
    )
    return {
        "id": exp.id,
        "title": exp.title,
        "slug": exp.slug,
        "theme_color": exp.theme_color,
        "description": exp.description,
        "welcome_message": exp.welcome_message,
        "status": exp.status,
        "reward_threshold": exp.reward_threshold,
        "spend_points_on_claim": exp.spend_points_on_claim,
        "modules": [
            {
                "id": m.id,
                "type": m.type,
                "order_index": m.order_index,
                "custom_reward_limit": m.custom_reward_limit,
                "questions": [
                    {
                        "id": q.id,
                        "prompt": q.prompt,
                        "points": q.points,
                        "repeatable": q.repeatable,
                        "input_type": q.input_type,
                        "options": q.options,
                        "image_id": q.image_id,
                        "image_url": image_url(q.image),
                    }
                    for q in m.questions
                ],
                "reward_options": [
                    {
                        "id": r.id,
                        "label": r.label,
                        "description": r.description,
                        "icon": r.icon,
                        "unlock_points": r.unlock_points,
                        "requires_datetime": r.requires_datetime,
                        "one_per_player": r.one_per_player,
                    }
                    for r in m.reward_options
                ],
            }
            for m in exp.modules
        ],
    }


@router.patch("/{experience_id}", response_model=ExperienceOut)
def update_experience(
    experience_id: int,
    data: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    exp = get_owned_experience(experience_id, current_creator, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{experience_id}")
def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    exp = get_owned_experience(experience_id, current_creator, db)

    question_image_ids = {
        row[0]
        for row in db.query(Question.image_id)
        .join(Module, Question.module_id == Module.id)
        .filter(Module.experience_id == exp.id, Question.image_id.isnot(None))
        .all()
    }
    answer_image_ids = {
        row[0]
        for row in db.query(Answer.response_image_id)
        .join(Player, Answer.player_id == Player.id)
        .filter(Player.experience_id == exp.id, Answer.response_image_id.isnot(None))
        .all()
    }

    db.delete(exp)
    db.commit()

    purge_orphaned_images(db, question_image_ids | answer_image_ids)
    return {"deleted": True}
