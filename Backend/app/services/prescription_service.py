from sqlalchemy.orm import Session

from app.schemas.prescriptions import PrescriptionCreate, PrescriptionUpdate
from app.crud import prescriptions


def get_all_prescriptions(db: Session):
    return prescriptions.get_all_prescriptions(db)


def get_prescription_by_id(db: Session, prescription_id):
    prescription_obj = prescriptions.get_prescription_by_id(db, prescription_id)

    if not prescription_obj:
        raise ValueError("Prescription not found")

    return prescription_obj


def create_prescription(db: Session, prescription_data: PrescriptionCreate):
    return prescriptions.create_prescription(db, prescription_data)


def update_prescription(db: Session, prescription_id, prescription_data: PrescriptionUpdate):
    prescription_obj = prescriptions.get_prescription_by_id(db, prescription_id)

    if not prescription_obj:
        raise ValueError("Prescription not found")

    if prescription_data.patient_id is not None:
        prescription_obj.patient_id = prescription_data.patient_id

    if prescription_data.doctor_id is not None:
        prescription_obj.doctor_id = prescription_data.doctor_id

    if prescription_data.appointment_id is not None:
        prescription_obj.appointment_id = prescription_data.appointment_id

    if prescription_data.instructions is not None:
        prescription_obj.instructions = prescription_data.instructions

    return prescriptions.update_prescription(db, prescription_obj)


def delete_prescription(db: Session, prescription_id):
    prescription_obj = prescriptions.get_prescription_by_id(db, prescription_id)

    if not prescription_obj:
        raise ValueError("Prescription not found")

    return prescriptions.delete_prescription(db, prescription_obj)