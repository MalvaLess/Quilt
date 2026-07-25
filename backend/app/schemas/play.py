from pydantic import BaseModel, model_validator
from datetime import date, time


class AnswerSubmit(BaseModel):
    question_id: int
    response_text: str | None = None


class SkipQuestion(BaseModel):
    question_id: int


class CustomRewardCreate(BaseModel):
    label: str
    description: str | None = None
    icon: str | None = None


class RewardSelectionCreate(BaseModel):
    reward_option_id: int | None = None
    custom_reward_id: int | None = None
    chosen_date: date | None = None
    chosen_time: time | None = None

    @model_validator(mode="after")
    def check_exactly_one_reward(self):
        if bool(self.reward_option_id) == bool(self.custom_reward_id):
            raise ValueError(
                "Se debe indicar exactamente una de reward_option_id o custom_reward_id"
            )
        return self
