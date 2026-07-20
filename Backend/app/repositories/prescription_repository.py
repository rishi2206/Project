from sqlalchemy.orm import Session

from app.models.prescription import Prescription


def get_all(db: Session):
    return db.query(Prescription).all()


def get_by_id(db: Session, prescription_id):
    return db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()


def create(db: Session, prescription: Prescription):
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription


def update(db: Session, prescription: Prescription):
    db.commit()
    db.refresh(prescription)
    return prescription


def delete(db: Session, prescription: Prescription):
    db.delete(prescription)
    db.commit()
    return {"message": "Prescription deleted successfully"}