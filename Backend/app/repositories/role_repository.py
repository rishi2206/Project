from sqlalchemy.orm import Session
from app.models.roles import Role


def get_by_id(db: Session, role_id):
    return db.query(Role).filter(Role.id == role_id).first()


def get_all(db: Session):
    return db.query(Role).all()
