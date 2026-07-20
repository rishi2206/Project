from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.bill import BillCreate, BillUpdate
from app.crud import bill
from app.repositories import bill_repository
from app.models.prescription_items import Prescription_items
from app.models.medicine import Medicine


def get_all_bills(db: Session):
    return bill.get_all_bills(db)


def get_bill_by_id(db: Session, bill_id):
    bill_obj = bill.get_bill_by_id(db, bill_id)

    if not bill_obj:
        raise ValueError("Bill not found")

    return bill_obj


def get_bill_history(db: Session, patient_id):
    return bill_repository.get_by_patient(db, patient_id)


def create_bill(db: Session, bill_data: BillCreate):

    medicine_fee = (
        db.query(
            func.sum(
                Medicine.price * Prescription_items.quantity
            )
        )
        .join(
            Prescription_items,
            Medicine.id == Prescription_items.medicine_id
        )
        .first()[0]
    )

    if medicine_fee is None:
        medicine_fee = 0

    bill_data.medicine_fee = medicine_fee

    return bill.create_bill(db, bill_data)


def update_bill(
    db: Session,
    bill_id,
    bill_data: BillUpdate
):
    bill_obj = bill.get_bill_by_id(db, bill_id)

    if not bill_obj:
        raise ValueError("Bill not found")

    if bill_data.consultation_fee is not None:
        bill_obj.consultation_fee = bill_data.consultation_fee

    if bill_data.other_charges is not None:
        bill_obj.other_charges = bill_data.other_charges

    if bill_data.payment_status is not None:
        bill_obj.payment_status = bill_data.payment_status

    if bill_data.bill_date is not None:
        bill_obj.bill_date = bill_data.bill_date

    bill_obj.total_amount = (
        bill_obj.consultation_fee
        + bill_obj.medicine_fee
        + bill_obj.other_charges
    )

    return bill.update_bill(db, bill_obj)


def delete_bill(db: Session, bill_id):
    bill_obj = bill.get_bill_by_id(db, bill_id)

    if not bill_obj:
        raise ValueError("Bill not found")

    return bill.delete_bill(db, bill_obj)