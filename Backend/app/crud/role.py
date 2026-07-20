from sqlalchemy.orm import Session
from app.repositories import role_repository


def get_role_by_id(db: Session, role_id):
    return role_repository.get_by_id(db, role_id)


def get_all_roles(db: Session):
    return role_repository.get_all(db)