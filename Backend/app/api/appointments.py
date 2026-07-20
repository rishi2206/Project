from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.services import appointment_service
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)


# Create Appointment
@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Receptionist"))
):
    return appointment_service.create_appointment(db, appointment)


# Get all Appointments
@router.get("/", response_model=list[AppointmentResponse])
def get_appointments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return appointment_service.get_all_appointments(db)


# Get Appointment by ID
@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    appointment = appointment_service.get_appointment_by_id(db, appointment_id)

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return appointment


# Update Appointment
@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: UUID,
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Receptionist"))
):
    existing_appointment = appointment_service.get_appointment_by_id(db, appointment_id)

    if not existing_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    existing_appointment.patient_id = appointment.patient_id
    existing_appointment.doctor_id = appointment.doctor_id
    existing_appointment.appointment_date = appointment.appointment_date
    existing_appointment.appointment_time = appointment.appointment_time
    existing_appointment.notes = appointment.notes

    return appointment_service.update_appointment(db, existing_appointment)


# Delete Appointment
@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Receptionist"))
):
    appointment = appointment_service.get_appointment_by_id(db, appointment_id)

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment_service.delete_appointment(db, appointment)

    return {"message": "Appointment deleted successfully"}