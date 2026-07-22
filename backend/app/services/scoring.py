def award_points(question_points: int) -> int:
    # cualquier respuesta suma los puntos completos de la pregunta
    return question_points


def has_unlocked_rewards(total_points: int, threshold: int = 60) -> bool:
    return total_points >= threshold
