from datetime import datetime, timedelta, timezone
from decimal import Decimal
from enum import Enum
from sqlmodel import SQLModel, Field, UniqueConstraint


class TransactionType(str, Enum):
    buy = "buy"
    sell = "sell"
    deposit = "deposit"
    withdraw = "withdraw"
    dividend = "dividend"

class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    
    id: int | None = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="accounts.id", nullable=False, ondelete="CASCADE")
    # Asset 設為 RESTRICT (防止誤刪資產導致交易紀錄消失)
    asset_id: int = Field(foreign_key="assets.id", nullable=True, ondelete="RESTRICT")
    
    type: TransactionType = Field(nullable=False)
    quantity: Decimal = Field(max_digits=20, decimal_places=10, nullable=True)
    price_per_unit: Decimal = Field(max_digits=20, decimal_places=10, nullable=True)
    fee: Decimal = Field(default=0, max_digits=20, decimal_places=10)
    transaction_time: datetime = Field(default_factory=lambda: datetime.now(timezone(timedelta(hours=8))))
    notes: str | None = Field(default=None)

class Position(SQLModel, table=True):
    __tablename__ = "positions"
    
    __table_args__ = (
        UniqueConstraint("account_id", "asset_id", name="unique_account_asset_position"),
    )

    id: int | None = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="accounts.id", nullable=False, ondelete="CASCADE")
    asset_id: int = Field(foreign_key="assets.id", nullable=False, ondelete="CASCADE")
    
    total_quantity: Decimal = Field(default=0, max_digits=20, decimal_places=10)
    average_cost: Decimal = Field(default=0, max_digits=20, decimal_places=10)
    last_updated: datetime = Field(default_factory=lambda: datetime.now())
