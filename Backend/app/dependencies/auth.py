from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.db.database import get_db
from app.core.security import decode_access_token
from app.crud import user

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token"
        )
    try:
        payload = decode_access_token(token)

        user_id = UUID(payload.get("sub"))

        if user_id is None:
            raise credentials_exception

        user_obj = user.get_user_by_id(
            db,
            user_id
        )

        if not user_obj:
            raise credentials_exception

        return user_obj

    except JWTError:
        raise credentials_exception