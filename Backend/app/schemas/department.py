from pydantic import BaseModel
from uuid import UUID


class DepartmentCreate(BaseModel):
    name: str
    description: str


class DepartmentResponse(BaseModel):
    id: UUID
    name: str
    description: str

    class Config:
        from_attributes = True