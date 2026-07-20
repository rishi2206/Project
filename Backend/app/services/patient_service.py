from sqlalchemy.orm import Session

from app.schemas.patient import PatientCreate, PatientUpdate
from app.models.patients import Patient
from app.crud import patient


def get_all_patients(db: Session):
    return patient.get_all_patients(db)


def get_patient_by_id(db: Session, patient_id):
    patient_obj = patient.get_patient_by_id(db, patient_id)

    if not patient_obj:
        raise ValueError("Patient not found")

    return patient_obj


def create_patient(db: Session, patient_data: PatientCreate):
    patient_obj = Patient(**patient_data.model_dump())
    return patient.create_patient(db, patient_obj)


def update_patient(db: Session, patient_id, patient_data: PatientUpdate):
    patient_obj = patient.get_patient_by_id(db, patient_id)

    if not patient_obj:
        raise ValueError("Patient not found")

    update_data = patient_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(patient_obj, key, value)

    return patient.update_patient(db, patient_obj)


def delete_patient(db: Session, patient_id):
    patient_obj = patient.get_patient_by_id(db, patient_id)

    if not patient_obj:
        raise ValueError("Patient not found")

    patient.delete_patient(db, patient_obj)

    return {
        "message": "Patient deleted successfully"
    }