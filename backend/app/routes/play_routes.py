import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.models.experience import Experience
from app.models.question import Question
from app.models.answer import Answer
from app.models.reward_option import RewardOption
from app.models.custom_reward import CustomReward
from app.models.reward_selection import RewardSelection
from app.schemas.play import AnswerSubmit, CustomRewardCreate, RewardSelectionCreate, SkipQuestion
from app.services.scoring import award_points, has_unlocked_rewards
from app.services.uploads import image_url

router = APIRouter(prefix="/api/play", tags=["play"])


@router.get("/e/{experience_slug}")
def get_experience_info(experience_slug: str, db: Session = Depends(get_db)):
    experience = db.query(Experience).filter(Experience.slug == experience_slug).first()
    if not experience:
        raise HTTPException(404, "Experiencia no encontrada")
    return {
        "id": experience.id,
        "title": experience.title,
        "description": experience.description,
        "theme_color": experience.theme_color,
    }


def get_player_or_404(token: str, db: Session) -> Player:
    player = db.query(Player).filter(Player.token == token).first()
    if not player:
        raise HTTPException(404, "Jugador no encontrado")
    return player


@router.post("/start/{experience_slug}")
def start_or_resume(
    experience_slug: str, player_name: str, db: Session = Depends(get_db)
):
    experience = db.query(Experience).filter(Experience.slug == experience_slug).first()
    if not experience:
        raise HTTPException(404, "Experiencia no encontrada")

    player = (
        db.query(Player)
        .filter(
            Player.experience_id == experience.id,
            Player.name == player_name,
        )
        .first()
    )

    if player:
        return {"token": player.token, "experience_id": experience.id, "resumed": True}

    player = Player(
        experience_id=experience.id, name=player_name, token=uuid.uuid4().hex
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return {"token": player.token, "experience_id": experience.id, "resumed": False}


@router.get("/{token}")
def get_next_module(token: str, db: Session = Depends(get_db)):
    player = get_player_or_404(token, db)
    answered_ids = {a.question_id for a in player.answers}
    skipped_ids = {a.question_id for a in player.answers if a.skipped}

    threshold = player.experience.reward_threshold

    for module in player.experience.modules:
        if module.type == "question":
            for q in module.questions:
                if q.id in skipped_ids:
                    continue
                if q.repeatable or q.id not in answered_ids:
                    return {
                        "module_type": "question",
                        "question_id": q.id,
                        "prompt": q.prompt,
                        "input_type": q.input_type,
                        "options": q.options,
                        "image_url": image_url(q.image),
                        "total_points": player.total_points,
                        "reward_threshold": threshold,
                        "rewards_unlocked": has_unlocked_rewards(
                            player.total_points, threshold
                        ),
                    }

    return {
        "module_type": "done",
        "total_points": player.total_points,
        "reward_threshold": threshold,
        "rewards_unlocked": has_unlocked_rewards(player.total_points, threshold),
    }


def get_question_or_404(question_id: int, db: Session) -> Question:
    question = db.query(Question).get(question_id)
    if not question:
        raise HTTPException(404, "Pregunta no encontrada")
    return question


def ensure_answerable(question: Question, player: Player, db: Session) -> None:
    if question.repeatable:
        return
    already = (
        db.query(Answer)
        .filter(Answer.player_id == player.id, Answer.question_id == question.id)
        .first()
    )
    if already:
        raise HTTPException(400, "Esta pregunta ya fue respondida o salteada")


@router.post("/{token}/answers")
def submit_answer(token: str, data: AnswerSubmit, db: Session = Depends(get_db)):
    player = get_player_or_404(token, db)
    question = get_question_or_404(data.question_id, db)
    ensure_answerable(question, player, db)

    points = award_points(question.points)
    db.add(
        Answer(
            player_id=player.id,
            question_id=question.id,
            response_text=data.response_text,
            points_awarded=points,
        )
    )
    player.total_points += points
    db.commit()

    threshold = player.experience.reward_threshold
    return {
        "points_awarded": points,
        "total_points": player.total_points,
        "reward_threshold": threshold,
        "rewards_unlocked": has_unlocked_rewards(player.total_points, threshold),
    }


@router.post("/{token}/skip")
def skip_question(token: str, data: SkipQuestion, db: Session = Depends(get_db)):
    player = get_player_or_404(token, db)
    question = get_question_or_404(data.question_id, db)
    ensure_answerable(question, player, db)

    db.add(
        Answer(
            player_id=player.id,
            question_id=question.id,
            response_text=None,
            points_awarded=0,
            skipped=True,
        )
    )
    db.commit()

    threshold = player.experience.reward_threshold
    return {
        "total_points": player.total_points,
        "reward_threshold": threshold,
        "rewards_unlocked": has_unlocked_rewards(player.total_points, threshold),
    }


def get_reward_module(player: Player, db: Session):
    reward_module = next(
        (m for m in player.experience.modules if m.type == "reward_picker"), None
    )
    if not reward_module:
        raise HTTPException(404, "Sin recompensas configuradas")
    return reward_module


@router.get("/{token}/rewards")
def get_rewards(token: str, db: Session = Depends(get_db)):
    player = get_player_or_404(token, db)
    if not has_unlocked_rewards(player.total_points, player.experience.reward_threshold):
        raise HTTPException(403, "Todavía no se desbloquearon las recompensas")
    reward_module = get_reward_module(player, db)

    my_custom_rewards = (
        db.query(CustomReward)
        .filter(CustomReward.module_id == reward_module.id, CustomReward.player_id == player.id)
        .all()
    )
    limit = reward_module.custom_reward_limit or 0

    return {
        "options": [
            {
                "id": r.id,
                "label": r.label,
                "description": r.description,
                "icon": r.icon,
                "requires_datetime": r.requires_datetime,
            }
            for r in reward_module.reward_options
            if r.unlock_points is None or player.total_points >= r.unlock_points
        ],
        "custom": {
            "enabled": limit > 0,
            "limit": limit,
            "remaining": max(0, limit - len(my_custom_rewards)),
            "created": [
                {
                    "id": c.id,
                    "label": c.label,
                    "description": c.description,
                    "icon": c.icon,
                }
                for c in my_custom_rewards
            ],
        },
    }


@router.post("/{token}/custom-rewards")
def create_custom_reward(
    token: str, data: CustomRewardCreate, db: Session = Depends(get_db)
):
    player = get_player_or_404(token, db)
    if not has_unlocked_rewards(player.total_points, player.experience.reward_threshold):
        raise HTTPException(403, "Todavía no se desbloquearon las recompensas")
    reward_module = get_reward_module(player, db)

    limit = reward_module.custom_reward_limit or 0
    if limit <= 0:
        raise HTTPException(403, "Esta experiencia no permite recompensas construibles")

    existing = (
        db.query(CustomReward)
        .filter(CustomReward.module_id == reward_module.id, CustomReward.player_id == player.id)
        .count()
    )
    if existing >= limit:
        raise HTTPException(400, f"Ya creaste el máximo de {limit} recompensa(s) propia(s)")

    custom_reward = CustomReward(
        player_id=player.id,
        module_id=reward_module.id,
        label=data.label,
        description=data.description,
        icon=data.icon,
    )
    db.add(custom_reward)
    db.commit()
    db.refresh(custom_reward)
    return {
        "id": custom_reward.id,
        "label": custom_reward.label,
        "description": custom_reward.description,
        "icon": custom_reward.icon,
    }


@router.post("/{token}/reward-selection")
def select_reward(
    token: str, data: RewardSelectionCreate, db: Session = Depends(get_db)
):
    player = get_player_or_404(token, db)

    if data.reward_option_id is not None:
        reward_option = db.query(RewardOption).get(data.reward_option_id)
        if not reward_option:
            raise HTTPException(404, "Recompensa no encontrada")
        label = reward_option.label
    else:
        custom_reward = db.query(CustomReward).get(data.custom_reward_id)
        if not custom_reward or custom_reward.player_id != player.id:
            raise HTTPException(404, "Recompensa no encontrada")
        label = custom_reward.label

    db.add(
        RewardSelection(
            player_id=player.id,
            reward_option_id=data.reward_option_id,
            custom_reward_id=data.custom_reward_id,
            chosen_date=data.chosen_date,
            chosen_time=data.chosen_time,
        )
    )
    db.commit()
    return {"confirmed": True, "reward": label}
