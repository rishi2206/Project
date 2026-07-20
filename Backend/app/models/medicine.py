import uuid
from sqlalchemy import Column, String, Integer, Date, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

from app.db.database import Base

class Medicine(Base):
    __tablename__ = "medicine"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    medicine_name = Column(String(100), nullable=False)
    description = Column(Text,nullable=True)
    stock = Column(Integer,nullable=False)
    expiry_date = Column(Date, nullable=False)
    manufacture = Column(String, nullable=False)
    price = Column(Numeric(10,2), nullable=False)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    prescription_items = relationship("Prescription_items", back_populates="medicine")