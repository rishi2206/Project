from pydantic import BaseModel, EmailStr
from uuid import UUID


class PatientCreate(BaseModel):
    # Optional: a receptionist can register a walk-in patient who has no
    # login account yet. If the patient later registers/logs in, an
    # admin can link the two via PatientUpdate/linking their user_id.
    user_id: UUID | None = None
    name: str
    Gender: str
    Age: int
    Phone_number: str
    email: EmailStr
    blood_group: str | None = None
    emergency_contact: str | None = None


class PatientUpdate(BaseModel):
    user_id: UUID | None = None
    name: str | None = None
    Gender: str | None = None
    Age: int | None = None
    Phone_number: str | None = None
    email: EmailStr | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None


class PatientResponse(BaseModel):
    id: UUID
    user_id: UUID | None = None
    name: str
    Gender: str
    Age: int
    Phone_number: str
    email: EmailStr
    blood_group: str | None = None
    emergency_contact: str | None = None

    class Config:
        from_attributes = True
