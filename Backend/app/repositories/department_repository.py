from sqlalchemy.orm import Session
from app.models.departments import Department


def get_by_id(db: Session, department_id):
    return db.query(Department).filter(Department.id == department_id).first()


def get_all(db: Session):
    return db.query(Department).all()


def create(db: Session, department_data):
    department = Department(
        name=department_data.name,
        description=department_data.description
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


def update(db: Session, department):
    db.commit()
    db.refresh(department)
    return department


def delete(db: Session, department):
    db.delete(department)
    db.commit()