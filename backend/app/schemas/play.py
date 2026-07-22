from pydantic import BaseModel
from datetime import date, time


class AnswerSubmit(BaseModel):
    question_id: int
    response_text: str | None = None


class RewardSelectionCreate(BaseModel):
    reward_option_id: int
    chosen_date: date
    chosen_time: time
