from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class PrescriptionCreate(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    appointment_id: UUID
    instructions: str | None = None


class PrescriptionUpdate(BaseModel):
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    appointment_id: UUID | None = None
    instructions: str | None = None


class PrescriptionResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    appointment_id: UUID
    instructions: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True