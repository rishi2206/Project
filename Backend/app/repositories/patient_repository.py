from sqlalchemy.orm import Session
from app.models.patients import Patient


def get_by_id(db: Session, patient_id):
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_all(db: Session):
    return db.query(Patient).all()


def create(db: Session, patient: Patient):
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def update(db: Session, patient: Patient):
    db.commit()
    db.refresh(patient)
    return patient


def delete(db: Session, patient: Patient):
    db.delete(patient)
    db.commit()