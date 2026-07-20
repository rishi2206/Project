from uuid import UUID
from decimal import Decimal
from datetime import date, datetime

from pydantic import BaseModel


class BillCreate(BaseModel):
    appointment_id: UUID
    patient_id: UUID
    doctor_id: UUID
    consultation_fee: Decimal = 0
    medicine_fee: Decimal = 0
    other_charges: Decimal = 0
    payment_status: str
    bill_date: date


class BillUpdate(BaseModel):
    consultation_fee: Decimal | None = None
    medicine_fee: Decimal | None = None
    other_charges: Decimal | None = None
    payment_status: str | None = None


class BillResponse(BaseModel):
    id: UUID
    appointment_id: UUID
    patient_id: UUID
    doctor_id: UUID
    consultation_fee: Decimal
    medicine_fee: Decimal
    other_charges: Decimal
    total_amount: Decimal
    payment_status: str
    bill_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True