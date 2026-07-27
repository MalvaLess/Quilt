from pydantic import BaseModel, EmailStr, Field


class CreatorCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
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
    reactivated: bool = False


class AccountUpdate(BaseModel):
    display_name: str | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class AccountDelete(BaseModel):
    password: str
