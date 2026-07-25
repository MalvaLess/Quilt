from pydantic import BaseModel


class ExperienceCreate(BaseModel):
    title: str
    slug: str
    theme_color: str | None = None
    description: str | None = None
    reward_threshold: int = 60


class ExperienceUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    theme_color: str | None = None
    description: str | None = None
    status: str | None = None
    reward_threshold: int | None = None


class ExperienceOut(BaseModel):
    id: int
    title: str
    slug: str
    theme_color: str | None
    description: str | None
    status: str
    reward_threshold: int

    class Config:
        from_attributes = True
