from sqlalchemy.orm import Session

from app.models.bill import Bill


def get_all(db: Session):
    return db.query(Bill).all()


def get_by_id(db: Session, bill_id):
    return db.query(Bill).filter(
        Bill.id == bill_id
    ).first()


def get_by_patient(db: Session, patient_id):
    return db.query(Bill).filter(
        Bill.patient_id == patient_id
    ).all()


def create(db: Session, bill: Bill):
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


def update(db: Session, bill: Bill):
    db.commit()
    db.refresh(bill)
    return bill


def delete(db: Session, bill: Bill):
    db.delete(bill)
    db.commit()
    return {
        "message": "Bill deleted successfully"
    }