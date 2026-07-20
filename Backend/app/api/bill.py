from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.bill import (
    BillCreate,
    BillUpdate,
    BillResponse
)

from app.services import bill_service

from app.dependencies.auth import get_current_user
from app.dependencies.role import require_role

router = APIRouter(
    prefix="/bills",
    tags=["Bills"]
)


# Create Bill
@router.post("/", response_model=BillResponse)
def create_bill(
    bill: BillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return bill_service.create_bill(db, bill)


# Get All Bills
@router.get("/", response_model=list[BillResponse])
def get_bills(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return bill_service.get_all_bills(db)


# Get Bill By ID
@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return bill_service.get_bill_by_id(
            db,
            bill_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# Bill History
@router.get(
    "/patient/{patient_id}",
    response_model=list[BillResponse]
)
def bill_history(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return bill_service.get_bill_history(
        db,
        patient_id
    )


# Update Bill
@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: UUID,
    bill: BillUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return bill_service.update_bill(
        db,
        bill_id,
        bill
    )


# Delete Bill
@router.delete("/{bill_id}")
def delete_bill(
    bill_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return bill_service.delete_bill(
        db,
        bill_id
    )