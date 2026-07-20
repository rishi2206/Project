from sqlalchemy.orm import Session
from app.repositories import doctor_repository


def get_doctor_by_id(db: Session, doctor_id):
    return doctor_repository.get_by_id(db, doctor_id)


def get_all_doctors(db: Session):
    return doctor_repository.get_all(db)


def create_doctor(db: Session, doctor):
    return doctor_repository.create(db, doctor)


def update_doctor(db: Session, doctor):
    return doctor_repository.update(db, doctor)


def delete_doctor(db: Session, doctor):
    return doctor_repository.delete(db, doctor)