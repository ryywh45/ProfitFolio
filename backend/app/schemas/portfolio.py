from datetime import datetime
from typing import Optional, List
from decimal import Decimal

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

class PortfolioListItem(SQLModel):
    id: int
    name: str
    total_value: Decimal
    daily_change: Decimal
    daily_change_percent: Decimal

class HoldingItem(SQLModel):
    id: str # combination of account_id and asset_id or just a unique string
    ticker: str
    name: str
    current_price: Decimal
    quantity: Decimal
    average_cost: Decimal
    market_value: Decimal
    profit: Decimal
    profit_percent: Decimal
    allocation: Decimal

class AccountSummaryItem(SQLModel):
    id: int
    name: str
    type: str = "Brokerage Account" # Simplified, add type if model supports
    balance: Decimal

class PortfolioSummary(SQLModel):
    id: int
    name: str
    total_value: Decimal
    total_profit: Decimal
    total_profit_percent: Decimal
    daily_change: Decimal
    daily_change_percent: Decimal
    holdings: List[HoldingItem]
    accounts: List[AccountSummaryItem]

# Properties to receive on item update
class PortfolioUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    account_ids: Optional[List[int]] = None