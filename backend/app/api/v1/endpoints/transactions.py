from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException

from app.services.transaction import TransactionService
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate, TransactionReadDetail

router = APIRouter()

ServiceDep = Annotated[TransactionService, Depends()]

@router.post("/", response_model=TransactionRead)
def create_transaction(transaction_service: ServiceDep, transaction_in: TransactionCreate):
    """
    Create a new transaction.
    """
    return transaction_service.create_transaction(transaction_in=transaction_in)


@router.get("/", response_model=List[TransactionReadDetail])
def read_transactions(
    transaction_service: ServiceDep,
    account_id: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    """
    Retrieve transactions with details.
    """
    return transaction_service.get_transactions(offset=offset, limit=limit, account_id=account_id)


@router.get("/{transaction_id}", response_model=TransactionReadDetail)
def read_transaction_by_id(transaction_service: ServiceDep, transaction_id: int):
    """
    Get a specific transaction by ID with details.
    """
    transaction = transaction_service.get_transaction_detail(transaction_id=transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction_by_id(transaction_service: ServiceDep, transaction_id: int, transaction_in: TransactionUpdate):
    """
    Update a transaction.
    """
    transaction = transaction_service.get_transaction(transaction_id=transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction_service.update_transaction(transaction=transaction, transaction_in=transaction_in)


@router.delete("/{transaction_id}")
def delete_transaction_by_id(transaction_service: ServiceDep, transaction_id: int):
    """
    Delete a transaction.
    """
    transaction = transaction_service.get_transaction(transaction_id=transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction_service.delete_transaction(transaction=transaction)
    return {"ok": True}
