from sqlalchemy.orm import Session
from app.models.prescriptions import Prescription
from app.repositories import prescription_repository


def get_prescription_by_id(db: Session, prescription_id):
    return prescription_repository.get_by_id(db, prescription_id)


def get_all_prescriptions(db: Session):
    return prescription_repository.get_all(db)


def create_prescription(db: Session, prescription: Prescription):
    return prescription_repository.create(db, prescription)


def update_prescription(db: Session, prescription: Prescription):
    return prescription_repository.update(db, prescription)


def delete_prescription(db: Session, prescription: Prescription):
    return prescription_repository.delete(db, prescription)