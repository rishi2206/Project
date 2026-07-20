from uuid import UUID
from sqlalchemy.orm import Session
from app.models.users import Users
from app.repositories import user_repository


def get_user_by_email(db: Session, email: str):
    return user_repository.get_by_email(db, email)


def get_user_by_id(db: Session, user_id: UUID):
    return user_repository.get_by_id(db, user_id)


def get_all_users(db: Session):
    return user_repository.get_all(db)


def create_user(db: Session, user: Users):
    return user_repository.create(db, user)


def update_user(db: Session, user: Users):
    return user_repository.update(db, user)


def delete_user(db: Session, user: Users):
    return user_repository.delete(db, user)