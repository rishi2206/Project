from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin
from app.models.users import Users
from fastapi import HTTPException, status

from app.crud import user,role
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

def register_user(db: Session, user_data: UserCreate):
    
    existing_user: Users | None = user.get_user_by_email(
        db,
        user_data.email
    )
    
    if existing_user:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email already exists"
    )
            
    existing_role = role.get_role_by_id(
        db,
        user_data.role_id
    )
    
    if not existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
            )
            
    hashed_password = hash_password(
        user_data.password
    )
    
    new_user = Users(
        username = user_data.username,
        email = user_data.email,
        hashed_password = hashed_password,
        role_id = user_data.role_id
    )
    
    created_user = user.create_user(
        db,
        new_user
    )

    token = create_access_token(
        {
            "sub": str(created_user.id)
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(created_user.id),
            "username": created_user.username,
            "email": created_user.email,
            "role": existing_role.name.lower()
        }
    }
    

def login_user(db:Session , login_data:UserLogin):
    
    user_obj = user.get_user_by_email(
        db,
        login_data.email
    )
    
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
            )
    
    if not verify_password(
        login_data.password,
        user_obj.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
            )
    
    token = create_access_token(
        {
            "sub": str(user_obj.id)
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user_obj.id),
            "username": user_obj.username,
            "email": user_obj.email,
            "role": user_obj.role.name.lower()
        }
    }