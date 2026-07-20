from sqlalchemy.orm import Session
from app.models.appointments import Appointment


def get_by_id(db: Session, appointment_id):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def get_all(db: Session):
    return db.query(Appointment).all()


def create(db: Session, appointment_data):
    appointment = Appointment(
        patient_id=appointment_data.patient_id,
        doctor_id=appointment_data.doctor_id,
        appointment_date=appointment_data.appointment_date,
        appointment_time=appointment_data.appointment_time,
        notes=appointment_data.notes,
        status="Scheduled"
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


def update(db: Session, appointment):
    db.commit()
    db.refresh(appointment)
    return appointment


def delete(db: Session, appointment):
    db.delete(appointment)
    db.commit()