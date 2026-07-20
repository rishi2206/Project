from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.medicine import (
    MedicineCreate,
    MedicineUpdate,
    MedicineResponse,
)
from app.services import medicine_service
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)


@router.post("/", response_model=MedicineResponse)
def create_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return medicine_service.create_medicine(db, medicine)


@router.get("/", response_model=list[MedicineResponse])
def get_medicines(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return medicine_service.get_all_medicines(db)


@router.get("/{medicine_id}", response_model=MedicineResponse)
def get_medicine(
    medicine_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return medicine_service.get_medicine_by_id(db, medicine_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: UUID,
    medicine: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return medicine_service.update_medicine(
        db,
        medicine_id,
        medicine
    )


@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return medicine_service.delete_medicine(db, medicine_id)