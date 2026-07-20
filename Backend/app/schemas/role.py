from uuid import UUID
from pydantic import BaseModel

class RoleCreate(BaseModel):
    name: str
    
class RoleResponse(BaseModel):
    id: UUID
    name: str
    
    class Config:
        from_attributes = True