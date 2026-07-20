from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.role import RoleResponse
from app.crud import role

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


# Public on purpose: the registration page needs this list before the
# person has an account/token yet.
@router.get("/", response_model=list[RoleResponse])
def get_roles(db: Session = Depends(get_db)):
    return role.get_all_roles(db)


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: UUID, db: Session = Depends(get_db)):
    role_obj = role.get_role_by_id(db, role_id)

    if not role_obj:
        raise HTTPException(status_code=404, detail="Role not found")

    return role_obj
