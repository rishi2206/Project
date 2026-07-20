from sqlalchemy.orm import Session
from app.models.patients import Patient
from app.repositories import patient_repository


def get_patient_by_id(db: Session, patient_id):
    return patient_repository.get_by_id(db, patient_id)


def get_all_patients(db: Session):
    return patient_repository.get_all(db)


def create_patient(db: Session, patient: Patient):
    return patient_repository.create(db, patient)


def update_patient(db: Session, patient: Patient):
    return patient_repository.update(db, patient)


def delete_patient(db: Session, patient: Patient):
    return patient_repository.delete(db, patient)