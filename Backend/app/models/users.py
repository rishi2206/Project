import uuid
from sqlalchemy import Column, String, Integer, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Users(Base):
    __tablename__="users"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
        default=uuid.uuid4,
        index=True
    )
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.id")
    )
    is_active = Column(Boolean, nullable=False, default=True)
    created_at =  Column(
        DateTime,
        default=datetime.utcnow
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    role = relationship("Role",back_populates="users")
    doctor = relationship("Doctor",back_populates="users",uselist=False)
    patient = relationship("Patient", back_populates="users", uselist=False)    