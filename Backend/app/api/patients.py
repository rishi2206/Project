from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services import patient_service
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin","Receptionist"))
):
    return patient_service.create_patient(db, patient)


@router.get("/", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return patient_service.get_all_patients(db)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        return patient_service.get_patient_by_id(db, patient_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: UUID,
    patient: PatientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin","Receptionist"))
):
    try:
        return patient_service.update_patient(db, patient_id, patient)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    try:
        return patient_service.delete_patient(db, patient_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))