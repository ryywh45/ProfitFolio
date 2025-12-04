from sqlmodel import SQLModel
from decimal import Decimal
from typing import List

class AssetAllocationItem(SQLModel):
    label: str  # e.g., "Crypto", "Stock" or "BTC", "AAPL"
    value: Decimal
    percentage: float

class DashboardStatsResponse(SQLModel):
    net_worth: Decimal
    net_worth_change_24h: float # 漲跌幅 %
    
    total_profit: Decimal
    total_profit_change_24h: float
    
    top_performer_name: str | None
    top_performer_change: float | None
    
    allocation: List[AssetAllocationItem]