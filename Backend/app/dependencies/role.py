from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from starlette.status import HTTP_403_FORBIDDEN

def require_role(*roles):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.role.name not in roles:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )

        return current_user

    return role_checker