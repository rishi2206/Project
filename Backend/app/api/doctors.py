from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.doctor import DoctorCreate, DoctorResponse
from app.services import doctor_service
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


# Create Doctor
@router.post("/", response_model=DoctorResponse)
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return doctor_service.create_doctor(db, doctor)


# Get all Doctors
@router.get("/", response_model=list[DoctorResponse])
def get_doctors(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return doctor_service.get_all_doctors(db)


# Get Doctor by ID
@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    doctor = doctor_service.get_doctor_by_id(db, doctor_id)

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor


# Update Doctor
@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: UUID,
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    existing_doctor = doctor_service.get_doctor_by_id(db, doctor_id)

    if not existing_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    existing_doctor.user_id = doctor.user_id
    existing_doctor.name = doctor.name
    existing_doctor.specialization = doctor.specialization
    existing_doctor.Phone_number = doctor.phone_number
    existing_doctor.email = doctor.email
    existing_doctor.department = doctor.department
    existing_doctor.years_of_experience = doctor.years_of_experience

    return doctor_service.update_doctor(db, existing_doctor)


# Delete Doctor
@router.delete("/{doctor_id}")
def delete_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    doctor = doctor_service.get_doctor_by_id(db, doctor_id)

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor_service.delete_doctor(db, doctor)

    return {"message": "Doctor deleted successfully"}
