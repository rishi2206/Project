import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.database import Base

class Prescription_items(Base):
    __tablename__ = "prescription_items"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    prescription_id = Column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id")
    )
    medicine_id = Column(
        UUID(as_uuid=True),
        ForeignKey("medicine.id")
    )
    dosage = Column(String(50), nullable=False)
    frequency = Column(String(50),nullable=False)
    duration = Column(String(50),nullable=False)
    quantity = Column(Integer,nullable=False)
    
    
    prescription = relationship("Prescription", back_populates="items")
    medicine = relationship("Medicine", back_populates="prescription_items")