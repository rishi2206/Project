from uuid import UUID

from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserUpdate,UserResponse,UserCreate
from app.services import user_service
from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Create user
@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return user_service.create_user(db, user)

#get all users
@router.get("/",response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    return user_service.get_all_users(db)

#get users by id
@router.get("/{user_id}",response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        return user_service.get_user_by_id(db,user_id)
    except ValueError as e:
        raise HTTPException(status_code=404,detail=str(e))
    

#Update user
@router.put("/{user_id}",response_model=UserResponse)
def update_user(
    user_id: UUID,
    user: UserUpdate,
    db: Session=Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    return user_service.update_user(db,user_id,user)


#delete user
@router.delete("/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Admin"))
):
    return user_service.delete_user(db,user_id)