from uuid import UUID
from sqlalchemy.orm import Session
from app.models.users import Users

def get_by_email(db: Session, email: str) -> Users | None:
    return db.query(Users).filter(Users.email == email).first()


def get_by_id(db: Session, user_id: UUID) -> Users | None:
    return db.query(Users).filter(Users.id == user_id).first()


def get_all(db: Session) -> list[Users]:
    return db.query(Users).all()


def create(db: Session, user: Users) -> Users:
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        return


def update(db: Session, user: Users) -> Users:
    try:
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        return


def delete(db: Session, user: Users) -> None:
    try:
        db.delete(user)
        db.commit()
    except Exception:
        db.rollback()
        return