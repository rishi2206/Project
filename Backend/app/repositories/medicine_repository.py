from sqlalchemy.orm import Session

from app.models.medicine import Medicine


def get_all(db: Session):
    return db.query(Medicine).all()


def get_by_id(db: Session, medicine_id):
    return db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()


def create(db: Session, medicine: Medicine):
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


def update(db: Session, medicine: Medicine):
    db.commit()
    db.refresh(medicine)
    return medicine


def delete(db: Session, medicine: Medicine):
    db.delete(medicine)
    db.commit()
    return {"message": "Medicine deleted successfully"}