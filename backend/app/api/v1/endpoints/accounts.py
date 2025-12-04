from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException

from app.services.account import AccountService
from app.schemas.account import AccountCreate, AccountRead, AccountUpdate

router = APIRouter()

ServiceDep = Annotated[AccountService, Depends()]

@router.post("/", response_model=AccountRead)
def create_account(account_service: ServiceDep, account_in: AccountCreate):
    """
    Create a new account.
    """
    return account_service.create_account(account_in=account_in)


@router.get("/", response_model=list[AccountRead])
def read_accounts(
    account_service: ServiceDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    """
    Retrieve accounts with total balance.
    """
    return account_service.get_accounts(offset=offset, limit=limit)


@router.get("/{account_id}", response_model=AccountRead)
def read_account_by_id(account_service: ServiceDep, account_id: int):
    """
    Get a specific account by ID with total balance.
    """
    account = account_service.get_account_by_id(account_id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.patch("/{account_id}", response_model=AccountRead)
def update_account_by_id(account_service: ServiceDep, account_id: int, account_in: AccountUpdate):
    """
    Update an account.
    """
    # Fetch raw model for update
    account = account_service.get_account_model(account_id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account_service.update_account(db_account=account, account_in=account_in)


@router.delete("/{account_id}")
def delete_account_by_id(account_service: ServiceDep, account_id: int):
    """
    Delete an account.
    """
    # Fetch raw model for deletion
    account = account_service.get_account_model(account_id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account_service.delete_account(db_account=account)
    return {"ok": True}