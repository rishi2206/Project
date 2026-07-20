from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class DoctorCreate(BaseModel):
    name: str
    specialization: str
    phone_number: str
    email: str
    department: str
    years_of_experience: int
    user_id: UUID


class DoctorResponse(BaseModel):
    id: UUID
    name: str
    specialization: str
    phone_number: str
    email: str
    department: str
    years_of_experience: int
    created_at: datetime

    class Config:
        from_attributes = True