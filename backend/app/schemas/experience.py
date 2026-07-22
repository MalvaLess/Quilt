from pydantic import BaseModel


class ExperienceCreate(BaseModel):
    title: str
    slug: str
    theme_color: str | None = None
    description: str | None = None


class ExperienceOut(BaseModel):
    id: int
    title: str
    slug: str
    theme_color: str | None
    description: str | None
    status: str

    class Config:
        from_attributes = True
