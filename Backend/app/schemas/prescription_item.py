from uuid import UUID

from pydantic import BaseModel


class PrescriptionItemCreate(BaseModel):
    prescription_id: UUID
    medicine_id: UUID
    dosage: str
    frequency: str
    duration: str
    quantity: int


class PrescriptionItemUpdate(BaseModel):
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    quantity: int | None = None


class PrescriptionItemResponse(BaseModel):
    id: UUID
    prescription_id: UUID
    medicine_id: UUID
    dosage: str
    frequency: str
    duration: str
    quantity: int

    class Config:
        from_attributes = True