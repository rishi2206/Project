from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.prescriptions import (
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionResponse,
)
from app.services import prescription_service
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


@router.post("/", response_model=PrescriptionResponse)
def create_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return prescription_service.create_prescription(
        db,
        prescription
    )


@router.get("/", response_model=list[PrescriptionResponse])
def get_prescriptions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return prescription_service.get_all_prescriptions(db)


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return prescription_service.get_prescription_by_id(
            db,
            prescription_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: UUID,
    prescription: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return prescription_service.update_prescription(
        db,
        prescription_id,
        prescription
    )


@router.delete("/{prescription_id}")
def delete_prescription(
    prescription_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return prescription_service.delete_prescription(
        db,
        prescription_id
    )