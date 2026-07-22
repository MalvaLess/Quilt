from pydantic import BaseModel, EmailStr


class CreatorCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None


class CreatorLogin(BaseModel):
    email: EmailStr
    password: str


class CreatorOut(BaseModel):
    id: int
    email: EmailStr
    display_name: str | None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
