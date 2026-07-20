from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, CurrentUserResponse
from app.services import auth_service
from app.dependencies.auth import get_current_user
from app.models.users import Users

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        return auth_service.register_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    try:
        return auth_service.login_user(db, login_data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# The frontend calls this right after login (and on page load, while a
# token is present) to find out who is logged in, what role they have,
# and which doctor/patient profile (if any) belongs to them.
@router.get("/me", response_model=CurrentUserResponse)
def get_me(current_user: Users = Depends(get_current_user)):
    return CurrentUserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role_id=current_user.role_id,
        role_name=current_user.role.name if current_user.role else "",
        is_active=current_user.is_active,
        doctor_id=current_user.doctor.id if current_user.doctor else None,
        patient_id=current_user.patient.id if current_user.patient else None,
    )
