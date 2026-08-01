from pydantic import BaseModel


class QuestionCreate(BaseModel):
    id: int | None = None
    prompt: str
    input_type: str = "text"
    points: int = 15
    options: list[str] | None = None
    repeatable: bool = False
    image_id: int | None = None


class RewardOptionCreate(BaseModel):
    id: int | None = None
    label: str
    description: str | None = None
    icon: str | None = None
    order_index: int = 0
    unlock_points: int | None = None
    requires_datetime: bool = False
    one_per_player: bool = False


class ModuleCreate(BaseModel):
    type: str
    order_index: int = 0
    questions: list[QuestionCreate] = []
    reward_options: list[RewardOptionCreate] = []
    custom_reward_limit: int | None = None
    custom_reward_unlock_points: int | None = None


class ModuleUpdate(BaseModel):
    order_index: int | None = None
    questions: list[QuestionCreate] | None = None
    reward_options: list[RewardOptionCreate] | None = None
    custom_reward_limit: int | None = None
    custom_reward_unlock_points: int | None = None
