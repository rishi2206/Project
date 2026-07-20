from pydantic import BaseModel
from uuid import UUID
from datetime import date, time, datetime


class AppointmentCreate(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    appointment_date: date
    appointment_time: time
    notes: str | None = None


class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    appointment_date: date
    appointment_time: time
    status: str
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True