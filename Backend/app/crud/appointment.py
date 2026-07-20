from sqlalchemy.orm import Session
from app.repositories import appointment_repository


def get_appointment_by_id(db: Session, appointment_id):
    return appointment_repository.get_by_id(db, appointment_id)


def get_all_appointments(db: Session):
    return appointment_repository.get_all(db)


def create_appointment(db: Session, appointment):
    return appointment_repository.create(db, appointment)


def update_appointment(db: Session, appointment):
    return appointment_repository.update(db, appointment)


def delete_appointment(db: Session, appointment):
    return appointment_repository.delete(db, appointment)