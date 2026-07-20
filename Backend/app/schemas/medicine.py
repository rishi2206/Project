from pydantic import BaseModel
from uuid import UUID
from decimal import Decimal
from datetime import date, datetime


class MedicineCreate(BaseModel):
    medicine_name: str
    description: str | None = None
    stock: int
    expiry_date: date
    manufacture: str
    price: Decimal


class MedicineUpdate(BaseModel):
    medicine_name: str | None = None
    description: str | None = None
    stock: int | None = None
    expiry_date: date | None = None
    manufacture: str | None = None
    price: Decimal | None = None


class MedicineResponse(BaseModel):
    id: UUID
    medicine_name: str
    description: str | None
    stock: int
    expiry_date: date
    manufacture: str
    price: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True