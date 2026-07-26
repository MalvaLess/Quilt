from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.creator import Creator
from app.models.player import Player
from app.models.experience import Experience
from app.services.auth_service import get_current_creator
from app.services.uploads import image_url

router = APIRouter(prefix="/api", tags=["players"])


def reward_label(selection) -> str:
    if selection.reward_option_id is not None:
        return selection.reward_option.label
    return selection.custom_reward.label


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
    player = db.query(Player).get(player_id)
    if not player:
        raise HTTPException(404, "Jugador no encontrado")
    if player.experience.creator_id != current_creator.id:
        raise HTTPException(403, "No tenés permiso sobre este jugador")

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
