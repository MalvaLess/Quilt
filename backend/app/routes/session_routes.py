from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, selectinload
from app.database import get_db
from app.models.answer import Answer
from app.models.creator import Creator
from app.models.player import Player
from app.models.experience import Experience
from app.models.reward_selection import RewardSelection
from app.models.uploaded_image import UploadedImage
from app.services.auth_service import get_current_creator
from app.services.uploads import delete_image_file, image_url

router = APIRouter(prefix="/api", tags=["players"])


def reward_label(selection) -> str:
    if selection.reward_option_id is not None:
        return selection.reward_option.label
    return selection.custom_reward.label


def get_owned_player(player_id: int, current_creator: Creator, db: Session) -> Player:
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(404, "Jugador no encontrado")
    if player.experience.creator_id != current_creator.id:
        raise HTTPException(403, "No tenés permiso sobre este jugador")
    return player


def _delete_answer(db: Session, player: Player, answer: Answer) -> None:
    if answer.response_image_id:
        image = db.query(UploadedImage).get(answer.response_image_id)
        if image:
            if image.stored_filename:
                delete_image_file(image.stored_filename)
            db.delete(image)
    player.total_points = max(0, player.total_points - (answer.points_awarded or 0))
    db.delete(answer)


@router.get("/experiences/{experience_id}/players")
def list_players(
    experience_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    experience = db.query(Experience).get(experience_id)
    if not experience:
        raise HTTPException(404, "Experiencia no encontrada")
    if experience.creator_id != current_creator.id:
        raise HTTPException(403, "No tenés permiso sobre esta experiencia")

    experience = (
        db.query(Experience)
        .options(
            selectinload(Experience.players).selectinload(Player.answers).joinedload(Answer.question),
            selectinload(Experience.players).selectinload(Player.answers).joinedload(Answer.response_image),
            selectinload(Experience.players).selectinload(Player.reward_selections).joinedload(RewardSelection.reward_option),
            selectinload(Experience.players).selectinload(Player.reward_selections).joinedload(RewardSelection.custom_reward),
        )
        .filter(Experience.id == experience.id)
        .first()
    )

    return [
        {
            "id": p.id,
            "name": p.name,
            "total_points": p.total_points,
            "answers": [
                {
                    "id": a.id,
                    "prompt": a.question.prompt,
                    "response": a.response_text,
                    "response_image_id": a.response_image_id,
                    "response_image_url": image_url(a.response_image),
                    "points_awarded": a.points_awarded,
                    "skipped": a.skipped,
                    "answered_at": a.answered_at,
                }
                for a in p.answers
                if not a.skipped
            ],
            "reward_chosen": reward_label(p.reward_selections[-1])
            if p.reward_selections
            else None,
        }
        for p in experience.players
    ]


@router.get("/players/{player_id}")
def get_player_detail(
    player_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    player = get_owned_player(player_id, current_creator, db)
    player = (
        db.query(Player)
        .options(
            selectinload(Player.answers).joinedload(Answer.question),
            selectinload(Player.answers).joinedload(Answer.response_image),
            selectinload(Player.reward_selections).joinedload(RewardSelection.reward_option),
            selectinload(Player.reward_selections).joinedload(RewardSelection.custom_reward),
        )
        .filter(Player.id == player.id)
        .first()
    )

    return {
        "id": player.id,
        "name": player.name,
        "total_points": player.total_points,
        "answers": [
            {
                "id": a.id,
                "prompt": a.question.prompt,
                "response": a.response_text,
                "response_image_id": a.response_image_id,
                "response_image_url": image_url(a.response_image),
                "points_awarded": a.points_awarded,
                "skipped": a.skipped,
                "answered_at": a.answered_at,
            }
            for a in player.answers
            if not a.skipped
        ],
        "reward_selections": [
            {
                "label": reward_label(rs),
                "date": rs.chosen_date,
                "time": rs.chosen_time,
            }
            for rs in player.reward_selections
        ],
    }


@router.delete("/players/{player_id}/answers/{answer_id}")
def delete_answer(
    player_id: int,
    answer_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    player = get_owned_player(player_id, current_creator, db)
    answer = db.query(Answer).get(answer_id)
    if not answer or answer.player_id != player.id:
        raise HTTPException(404, "Respuesta no encontrada")

    _delete_answer(db, player, answer)
    db.commit()
    return {"deleted": True, "total_points": player.total_points}


@router.delete("/players/{player_id}/answers")
def delete_all_answers(
    player_id: int,
    db: Session = Depends(get_db),
    current_creator: Creator = Depends(get_current_creator),
):
    player = get_owned_player(player_id, current_creator, db)
    for answer in list(player.answers):
        if answer.skipped:
            continue
        _delete_answer(db, player, answer)

    db.commit()
    return {"deleted": True, "total_points": player.total_points}
