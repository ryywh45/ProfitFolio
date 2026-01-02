from datetime import datetime, timedelta, timezone
from decimal import Decimal
from enum import Enum
from sqlmodel import SQLModel, Field, UniqueConstraint, Index


class AssetType(str, Enum):
    crypto = "crypto"
    stock = "stock"
    etf = "etf"
    fiat = "fiat"

class Asset(SQLModel, table=True):
    __tablename__ = "assets"
    
    id: int | None = Field(default=None, primary_key=True)
    ticker: str = Field(max_length=20, unique=True, nullable=False)
    name: str = Field(max_length=100, nullable=False)
    type: AssetType = Field(nullable=False)
    currency: str = Field(default="USD", max_length=10, nullable=False)
    
    current_price: Decimal = Field(default=0, max_digits=20, decimal_places=10)
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone(timedelta(hours=8))))

class MarketData(SQLModel, table=True):
    __tablename__ = "market_data"
    
    __table_args__ = (
        UniqueConstraint("asset_id", "timestamp", name="unique_asset_time_market_data"),
        Index("idx_market_data_asset_time", "asset_id", "timestamp"),
    )

    id: int | None = Field(default=None, primary_key=True)
    asset_id: int = Field(foreign_key="assets.id", nullable=False, ondelete="CASCADE")
    price: Decimal = Field(max_digits=20, decimal_places=10, nullable=False)
    timestamp: datetime = Field(nullable=False)