from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db, SessionLocal

from app.api import auth
from app.api import users
from app.api import patients
from app.api import medicine
from app.api import prescriptions
from app.api import bill
from app.api import roles
from app.api.doctors import router as doctor_router
from app.api.appointments import router as appointment_router
from app.api.departments import router as department_router

from app.models.users import Users
from app.models.roles import Role
from app.models.patients import Patient
from app.models.doctors import Doctor
from app.models.medical_history import Medical_history
from app.models.appointments import Appointment
from app.models.prescriptions import Prescription
from app.models.bill import Bill

app = FastAPI(title="Hospital Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(patients.router)
app.include_router(doctor_router)
app.include_router(appointment_router)
app.include_router(department_router)
app.include_router(medicine.router)
app.include_router(prescriptions.router)
app.include_router(bill.router)
app.include_router(roles.router)



DEFAULT_ROLES = ["Admin", "Doctor", "Receptionist"]


@app.on_event("startup")
def seed_default_roles():
    """
    The app has no admin UI to create roles, and registration requires
    a valid role_id. Rather than requiring a manual pgAdmin insert every
    time the database is recreated, make sure the three roles this app
    understands (used by require_role() checks throughout the API)
    exist as soon as the API boots. This only INSERTs rows that are
    missing - it never overwrites existing data.
    """
    db: Session = SessionLocal()
    try:
        existing = {r.name for r in db.query(Role).all()}
        for role_name in DEFAULT_ROLES:
            if role_name not in existing:
                db.add(Role(name=role_name))
        db.commit()
    except Exception as exc:
        # Most likely cause: `alembic upgrade head` hasn't been run yet,
        # so the tables don't exist. Don't crash the whole app over it -
        # just log it clearly so it's obvious what to do next.
        print(
            "WARNING: could not seed default roles on startup "
            f"(did you run 'alembic upgrade head'?): {exc}"
        )
        db.rollback()
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}
