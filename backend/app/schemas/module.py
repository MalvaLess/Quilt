from pydantic import BaseModel


class QuestionCreate(BaseModel):
    prompt: str
    input_type: str = "text"
    points: int = 15
    options: list[str] | None = None


class RewardOptionCreate(BaseModel):
    label: str
    description: str | None = None
    icon: str | None = None
    order_index: int = 0


class ModuleCreate(BaseModel):
    type: str
    order_index: int = 0
    questions: list[QuestionCreate] = []
    reward_options: list[RewardOptionCreate] = []
