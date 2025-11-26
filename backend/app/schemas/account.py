from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# Shared properties
class AccountBase(SQLModel):
    name: str
    currency: str = "USD"


# Properties to receive on item creation
class AccountCreate(AccountBase):
    pass


# Properties to return to client
class AccountRead(AccountBase):
    id: int
    created_at: datetime


# Properties to receive on item update
class AccountUpdate(SQLModel):
    name: Optional[str] = None
    currency: Optional[str] = None
