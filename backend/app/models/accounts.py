from datetime import datetime, timedelta, timezone
from sqlmodel import SQLModel, Field


class Account(SQLModel, table=True):
    __tablename__ = "accounts"
    
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    currency: str = Field(default="USD", max_length=10, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone(timedelta(hours=8))))

# class Portfolio(SQLModel, table=True):
#     __tablename__ = "portfolios"
    
#     id: int | None = Field(default=None, primary_key=True)
#     name: str = Field(max_length=100, nullable=False)
#     description: str | None = Field(default=None)
#     created_at: datetime = Field(default_factory=lambda: datetime.now())

# class PortfolioAccount(SQLModel, table=True):
#     __tablename__ = "portfolio_accounts"
    
#     portfolio_id: int = Field(foreign_key="portfolios.id", primary_key=True, ondelete="CASCADE")
#     account_id: int = Field(foreign_key="accounts.id", primary_key=True, ondelete="CASCADE")
