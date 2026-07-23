from sqlalchemy.orm import Session

from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate
from app.repositories import medicine_repository


def get_all_medicines(db: Session):
    return medicine_repository.get_all(db)


def get_medicine_by_id(db: Session, medicine_id):
    return medicine_repository.get_by_id(db, medicine_id)


def create_medicine(db: Session, medicine_data: MedicineCreate):
    medicine_obj = Medicine(
        medicine_name=medicine_data.medicine_name,
        description=medicine_data.description,
        stock=medicine_data.stock,
        expiry_date=medicine_data.expiry_date,
        manufacture=medicine_data.manufacture,
        price=medicine_data.price,
        unit=medicine_data.unit,
    )
    return medicine_repository.create(db, medicine_obj)


def update_medicine(db: Session, medicine_obj: Medicine):
    return medicine_repository.update(db, medicine_obj)


def delete_medicine(db: Session, medicine_obj: Medicine):
    return medicine_repository.delete(db, medicine_obj)