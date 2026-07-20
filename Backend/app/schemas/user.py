from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_id: UUID


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role_id: UUID | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    role_id: UUID
    is_active: bool

    class Config:
        from_attributes = True


class CurrentUserResponse(BaseModel):
    """Returned by GET /auth/me so the frontend knows who is logged in,
    which role they have, and (if applicable) their linked doctor/patient
    profile id - all without ever touching localStorage."""
    id: UUID
    username: str
    email: EmailStr
    role_id: UUID
    role_name: str
    is_active: bool
    doctor_id: UUID | None = None
    patient_id: UUID | None = None

    class Config:
        from_attributes = True
