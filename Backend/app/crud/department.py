from sqlalchemy.orm import Session
from app.repositories import department_repository


def get_department_by_id(db: Session, department_id):
    return department_repository.get_by_id(db, department_id)


def get_all_departments(db: Session):
    return department_repository.get_all(db)


def create_department(db: Session, department):
    return department_repository.create(db, department)


def update_department(db: Session, department):
    return department_repository.update(db, department)


def delete_department(db: Session, department):
    return department_repository.delete(db, department)