from sqlalchemy.orm import Session

from app.models.prescription_items import Prescription_items


def get_all(db: Session):
    return db.query(Prescription_items).all()


def get_by_id(db: Session, item_id):
    return db.query(Prescription_items).filter(
        Prescription_items.id == item_id
    ).first()


def get_by_prescription(db: Session, prescription_id):
    return db.query(Prescription_items).filter(
        Prescription_items.prescription_id == prescription_id
    ).all()


def create(db: Session, item: Prescription_items):
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update(db: Session, item: Prescription_items):
    db.commit()
    db.refresh(item)
    return item


def delete(db: Session, item: Prescription_items):
    db.delete(item)
    db.commit()
    return {"message": "Prescription item deleted successfully"}