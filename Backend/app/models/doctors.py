import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey,DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.database import Base


class Doctor(Base):
    __tablename__="doctors"
    
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
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    Phone_number = Column(String(15),unique=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    years_of_experience=Column(Integer, nullable=False)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    users =relationship("Users",back_populates="doctor")
    appointment =relationship("Appointment",back_populates="doctor")
    medical_history = relationship("Medical_history", back_populates="doctor")
    prescription = relationship("Prescription", back_populates="doctor")
    bill = relationship("Bill", back_populates="doctor")