def award_points(question_points: int) -> int:
    # cualquier respuesta suma los puntos completos de la pregunta
    return question_points


def has_unlocked_rewards(total_points: int, threshold: int = 60) -> bool:
    return total_points >= threshold


def reward_effective_threshold(reward_option, global_threshold: int) -> int:
    # unlock_points propio del reward pisa el threshold global; global es solo fallback
    return (
        reward_option.unlock_points
        if reward_option.unlock_points is not None
        else global_threshold
    )


def any_reward_available(total_points: int, reward_module, global_threshold: int) -> bool:
    for r in reward_module.reward_options:
        if total_points >= reward_effective_threshold(r, global_threshold):
            return True
    if reward_module.custom_reward_limit and total_points >= global_threshold:
        return True
    return False
