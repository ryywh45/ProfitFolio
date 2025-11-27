from datetime import datetime
from typing import Optional, List

from sqlmodel import SQLModel
from app.schemas.account import AccountRead

# Shared properties
class PortfolioBase(SQLModel):
    name: str
    description: Optional[str] = None


# Properties to receive on item creation
class PortfolioCreate(PortfolioBase):
    account_ids: Optional[List[int]] = []


# Properties to return to client
class PortfolioRead(PortfolioBase):
    id: int
    created_at: datetime
    accounts: List[AccountRead] = []


# Properties to receive on item update
class PortfolioUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    account_ids: Optional[List[int]] = None
