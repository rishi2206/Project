from sqlalchemy.orm import Session

from app.models.prescription_items import Prescription_items
from app.schemas.prescription_item import PrescriptionItemCreate, PrescriptionItemUpdate
from app.repositories import prescription_item_repository


def get_all_prescription_items(db: Session):
    return prescription_item_repository.get_all(db)


def get_prescription_item_by_id(db: Session, item_id):
    return prescription_item_repository.get_by_id(db, item_id)


def get_items_by_prescription(db: Session, prescription_id):
    return prescription_item_repository.get_by_prescription(db, prescription_id)


def create_prescription_item(db: Session, item_data: PrescriptionItemCreate):
    item_obj = Prescription_items(
        prescription_id=item_data.prescription_id,
        medicine_id=item_data.medicine_id,
        dosage=item_data.dosage,
        frequency=item_data.frequency,
        duration=item_data.duration,
        quantity=item_data.quantity,
    )
    return prescription_item_repository.create(db, item_obj)


def update_prescription_item(db: Session, item_obj: Prescription_items):
    return prescription_item_repository.update(db, item_obj)


def delete_prescription_item(db: Session, item_obj: Prescription_items):
    return prescription_item_repository.delete(db, item_obj)