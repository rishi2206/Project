from sqlalchemy.orm import Session

from app.schemas.bill import BillCreate
from app.models.bill import Bill
from app.repositories import bill_repository


def get_all_bills(db: Session):
    return bill_repository.get_all(db)


def get_bill_by_id(db: Session, bill_id):
    return bill_repository.get_by_id(db, bill_id)


def create_bill(db: Session, bill_data: BillCreate):
    total_amount = (
        bill_data.consultation_fee
        + bill_data.medicine_fee
        + bill_data.other_charges
    )

    bill = Bill(
        appointment_id=bill_data.appointment_id,
        patient_id=bill_data.patient_id,
        doctor_id=bill_data.doctor_id,
        consultation_fee=bill_data.consultation_fee,
        medicine_fee=bill_data.medicine_fee,
        other_charges=bill_data.other_charges,
        total_amount=total_amount,
        payment_status=bill_data.payment_status,
        bill_date=bill_data.bill_date
    )

    return bill_repository.create(db, bill)


def update_bill(db: Session, bill: Bill):
    bill.total_amount = (
        bill.consultation_fee
        + bill.medicine_fee
        + bill.other_charges
    )

    return bill_repository.update(db, bill)


def delete_bill(db: Session, bill: Bill):
    return bill_repository.delete(db, bill)