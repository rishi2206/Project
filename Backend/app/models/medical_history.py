import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.database import Base

class Medical_history(Base):
    __tablename__ = "medical_history"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id"),
    )
    doctor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("doctors.id"),
    )
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    visit_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    patient = relationship("Patient",back_populates="medical_history")
    doctor = relationship("Doctor", back_populates="medical_history")