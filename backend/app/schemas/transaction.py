from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel

from app.models.transacions import TransactionType


# Shared properties
class TransactionBase(SQLModel):
    account_id: int
    asset_id: Optional[int] = None
    type: TransactionType
    quantity: Optional[Decimal] = None
    price_per_unit: Optional[Decimal] = None
    fee: Decimal = Decimal(0)
    transaction_time: Optional[datetime] = None
    notes: Optional[str] = None


# Properties to receive on item creation
class TransactionCreate(TransactionBase):
    pass


# Properties to return to client
class TransactionRead(TransactionBase):
    id: int
    transaction_time: datetime

class TransactionReadDetail(TransactionRead):
    account_name: str
    asset_name: Optional[str] = None


# Properties to receive on item update
class TransactionUpdate(SQLModel):
    account_id: Optional[int] = None
    asset_id: Optional[int] = None
    type: Optional[TransactionType] = None
    quantity: Optional[Decimal] = None
    price_per_unit: Optional[Decimal] = None
    fee: Optional[Decimal] = None
    transaction_time: Optional[datetime] = None
    notes: Optional[str] = None