from sqlalchemy.orm import Session
from app.models.doctors import Doctor


def get_by_id(db: Session, doctor_id):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def get_all(db: Session):
    return db.query(Doctor).all()


def create(db: Session, doctor_data):
    doctor = Doctor(
        user_id=doctor_data.user_id,
        name=doctor_data.name,
        specialization=doctor_data.specialization,
        Phone_number=doctor_data.phone_number,
        email=doctor_data.email,
        department=doctor_data.department,
        years_of_experience=doctor_data.years_of_experience
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return doctor


def update(db: Session, doctor):
    db.commit()
    db.refresh(doctor)
    return doctor


def delete(db: Session, doctor):
    db.delete(doctor)
    db.commit()