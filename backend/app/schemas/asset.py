from decimal import Decimal
from typing import Optional

from app.models.assets import AssetType
from sqlmodel import SQLModel


# Shared properties
class AssetBase(SQLModel):
    ticker: str
    name: str
    type: AssetType


# Properties to receive on item creation
class AssetCreate(AssetBase):
    pass


# Properties to return to client
class AssetRead(AssetBase):
    id: int
    current_price: Decimal
    

# Properties to receive on item update
class AssetUpdate(SQLModel):
    ticker: Optional[str] = None
    name: Optional[str] = None
    type: Optional[AssetType] = None
    current_price: Optional[Decimal] = None
