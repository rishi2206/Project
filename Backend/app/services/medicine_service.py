from sqlalchemy.orm import Session

from app.schemas.medicine import MedicineCreate, MedicineUpdate
from app.crud import medicine


def get_all_medicines(db: Session):
    return medicine.get_all_medicines(db)


def get_medicine_by_id(db: Session, medicine_id):
    medicine_obj = medicine.get_medicine_by_id(db, medicine_id)

    if not medicine_obj:
        raise ValueError("Medicine not found")

    return medicine_obj


def create_medicine(db: Session, medicine_data: MedicineCreate):
    return medicine.create_medicine(db, medicine_data)


def update_medicine(db: Session, medicine_id, medicine_data: MedicineUpdate):
    medicine_obj = medicine.get_medicine_by_id(db, medicine_id)

    if not medicine_obj:
        raise ValueError("Medicine not found")

    if medicine_data.medicine_name is not None:
        medicine_obj.medicine_name = medicine_data.medicine_name

    if medicine_data.description is not None:
        medicine_obj.description = medicine_data.description

    if medicine_data.stock is not None:
        medicine_obj.stock = medicine_data.stock

    if medicine_data.expiry_date is not None:
        medicine_obj.expiry_date = medicine_data.expiry_date

    if medicine_data.manufacture is not None:
        medicine_obj.manufacture = medicine_data.manufacture

    if medicine_data.price is not None:
        medicine_obj.price = medicine_data.price

    return medicine.update_medicine(db, medicine_obj)


def delete_medicine(db: Session, medicine_id):
    medicine_obj = medicine.get_medicine_by_id(db, medicine_id)

    if not medicine_obj:
        raise ValueError("Medicine not found")

    return medicine.delete_medicine(db, medicine_obj)