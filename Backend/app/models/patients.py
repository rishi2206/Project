import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.database import Base


class Patient(Base):
    __tablename__="patients"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id")
    )
    name = Column(String(50), nullable=False)
    Gender = Column(String(20), nullable=False)
    Age = Column(Integer, nullable=False)
    Phone_number = Column(String(15),unique=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    blood_group = Column(String(5), nullable=True)
    emergency_contact = Column(String(15), nullable=True)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    users = relationship("Users", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    medical_history = relationship("Medical_history",back_populates="patient")
    prescription = relationship("Prescription", back_populates="patient")
    bills = relationship("Bill", back_populates="patient") 