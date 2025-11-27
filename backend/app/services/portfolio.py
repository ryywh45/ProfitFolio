from typing import Annotated, List
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.accounts import Portfolio, Account
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate


class PortfolioService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def create_portfolio(self, portfolio_in: PortfolioCreate) -> Portfolio:
        # Extract account_ids
        account_ids = portfolio_in.account_ids
        
        # Create Portfolio instance
        db_portfolio = Portfolio.model_validate(portfolio_in)
        
        # Handle relationships
        if account_ids:
            accounts = self.session.exec(select(Account).where(Account.id.in_(account_ids))).all()
            db_portfolio.accounts = accounts
            
        self.session.add(db_portfolio)
        self.session.commit()
        self.session.refresh(db_portfolio)
        return db_portfolio

    def get_portfolio_by_id(self, portfolio_id: int) -> Portfolio | None:
        return self.session.get(Portfolio, portfolio_id)

    def get_portfolios(self, offset: int = 0, limit: int = 100) -> List[Portfolio]:
        portfolios = self.session.exec(select(Portfolio).offset(offset).limit(limit)).all()
        return portfolios

    def update_portfolio(self, portfolio: Portfolio, portfolio_in: PortfolioUpdate) -> Portfolio:
        # Handle basic fields
        portfolio_data = portfolio_in.model_dump(exclude_unset=True, exclude={"account_ids"})
        portfolio.sqlmodel_update(portfolio_data)
        
        # Handle relationships if provided
        if portfolio_in.account_ids is not None:
            accounts = self.session.exec(select(Account).where(Account.id.in_(portfolio_in.account_ids))).all()
            portfolio.accounts = accounts
            
        self.session.add(portfolio)
        self.session.commit()
        self.session.refresh(portfolio)
        return portfolio

    def delete_portfolio(self, portfolio: Portfolio) -> None:
        self.session.delete(portfolio)
        self.session.commit()
        return
