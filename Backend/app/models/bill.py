import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.database import Base

class Bill(Base):
    __tablename__ = "bill"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    appointment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id"),
        nullable=False
    )
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id"),
    )
    doctor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("doctors.id"),
    )
    consultation_fee = Column(Numeric(10,2),default=0)
    medicine_fee = Column(Numeric(10,2),default=0)
    other_charges = Column(Numeric(10,2),default=0)
    total_amount = Column(Numeric(10,2),nullable=False)
    payment_status = Column(String(20),nullable=False)
    bill_date = Column(Date,nullable=False)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    appointment = relationship("Appointment", back_populates="bill")
    patient = relationship("Patient", back_populates="bills")
    doctor = relationship("Doctor", back_populates="bill")