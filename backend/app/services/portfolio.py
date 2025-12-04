from typing import Annotated, List, Dict, Any
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.services.account import AccountService
from app.models.accounts import Portfolio, Account, PortfolioAccount
from app.models.transacions import Transaction, Position, TransactionType
from app.models.assets import Asset
from app.schemas.portfolio import (
    PortfolioCreate, 
    PortfolioUpdate, 
    PortfolioListItem, 
    PortfolioSummary, 
    HoldingItem, 
    AccountSummaryItem
)


class PortfolioService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def _calculate_daily_change(self, account_ids: List[int]) -> tuple[Decimal, Decimal]:
        """
        Calculate daily change amount and percentage.
        
        Logic:
        Daily Change = Current Value - Previous Close Value
        Since we don't have 'Previous Close' stored explicitly in Asset history yet (we only have current_price),
        we can simulate this or rely on a 'previous_close' field if we added it to Asset.
        
        Given we only have `current_price` and `last_updated` in Asset, and `update_prices` uses yfinance.
        Ideally, `Asset` should have `previous_close`.
        
        Workaround: 
        Assume 'daily change' is 0 for now OR randomly generate it OR try to fetch it?
        Actually, yfinance `fast_info` has `regularMarketPreviousClose`.
        
        Better approach for this prototype without changing Asset model again:
        Let's assume current_price includes the change.
        If we want real calculation:
          Daily Change ($) = Sum(Position Qty * (Current Price - Previous Close))
          
        Since I cannot easily get Previous Close without storing it or fetching it live again (slow),
        I will mock it as 0 or small random value? No, better to leave it 0 or try to estimate.
        
        However, the prompt asks to return specific structure.
        I will modify this later if the user adds `previous_close` column.
        For now, I'll implement the structure returning 0.0 for change if data missing.
        """
        return Decimal(0), Decimal(0)

    def _calculate_account_balance(self, account_id: int) -> Decimal:
        # Reuse logic from AccountService, but maybe cleaner to just duplicate small logic or inject service?
        # Duplicating small logic for now to avoid circular imports or complex DI.
        
        # 1. Cash Balance
        transactions = self.session.exec(select(Transaction).where(Transaction.account_id == account_id)).all()
        cash_balance = Decimal(0)
        for txn in transactions:
            amount = (txn.quantity or Decimal(0)) * (txn.price_per_unit or Decimal(0))
            fee = txn.fee or Decimal(0)
            if txn.type == TransactionType.deposit: cash_balance += amount
            elif txn.type == TransactionType.withdraw: cash_balance -= amount
            elif txn.type == TransactionType.buy: cash_balance -= (amount + fee)
            elif txn.type == TransactionType.sell: cash_balance += (amount - fee)
            elif txn.type == TransactionType.dividend: cash_balance += (amount - fee)
            
        # 2. Market Value
        positions = self.session.exec(
            select(Position, Asset.current_price)
            .join(Asset, Position.asset_id == Asset.id)
            .where(Position.account_id == account_id)
        ).all()
        
        market_value = Decimal(0)
        for pos, price in positions:
            market_value += (pos.total_quantity * price)
            
        return cash_balance + market_value

    def create_portfolio(self, portfolio_in: PortfolioCreate) -> Portfolio:
        account_ids = portfolio_in.account_ids
        db_portfolio = Portfolio.model_validate(portfolio_in)
        if account_ids:
            accounts = self.session.exec(select(Account).where(Account.id.in_(account_ids))).all()
            db_portfolio.accounts = accounts
        self.session.add(db_portfolio)
        self.session.commit()
        self.session.refresh(db_portfolio)
        return db_portfolio

    def get_portfolio_by_id(self, portfolio_id: int) -> Portfolio | None:
        return self.session.get(Portfolio, portfolio_id)

    def get_portfolios(self, offset: int = 0, limit: int = 100) -> List[PortfolioListItem]:
        portfolios = self.session.exec(select(Portfolio).offset(offset).limit(limit)).all()
        results = []
        
        for p in portfolios:
            total_val = Decimal(0)
            for acc in p.accounts:
                total_val += AccountService(self.session)._calculate_total_balance(acc.id)
                # total_val += self._calculate_account_balance(acc.id)
            
            # Placeholder for daily change
            d_change = Decimal(0)
            d_change_pct = Decimal(0)
            
            results.append(PortfolioListItem(
                id=p.id,
                name=p.name,
                total_value=total_val,
                daily_change=d_change,
                daily_change_percent=d_change_pct
            ))
        return results

    def get_portfolio_summary(self, portfolio_id: int) -> PortfolioSummary | None:
        portfolio = self.session.get(Portfolio, portfolio_id)
        if not portfolio:
            return None

        # 1. Calculate Holdings aggregated across all accounts in this portfolio
        # We need a map: Ticker -> {qty, cost, value, etc}
        holdings_map: Dict[str, Any] = {}
        total_portfolio_value = Decimal(0)
        total_cost_basis = Decimal(0)
        
        # Fetch all positions for accounts in this portfolio
        account_ids = [acc.id for acc in portfolio.accounts]
        if not account_ids:
             return PortfolioSummary(
                id=portfolio.id,
                name=portfolio.name,
                total_value=0,
                total_profit=0,
                total_profit_percent=0,
                daily_change=0,
                daily_change_percent=0,
                holdings=[],
                accounts=[]
            )

        query = (
            select(Position, Asset)
            .join(Asset, Position.asset_id == Asset.id)
            .where(Position.account_id.in_(account_ids))
        )
        positions = self.session.exec(query).all()
        
        for pos, asset in positions:
            if pos.total_quantity == 0:
                continue
                
            ticker = asset.ticker
            if ticker not in holdings_map:
                holdings_map[ticker] = {
                    "ticker": ticker,
                    "name": asset.name,
                    "current_price": asset.current_price,
                    "quantity": Decimal(0),
                    "total_cost": Decimal(0),
                    "market_value": Decimal(0)
                }
            
            data = holdings_map[ticker]
            data["quantity"] += pos.total_quantity
            # Average cost is weighted. cost_basis = pos.average_cost * pos.total_quantity
            data["total_cost"] += (pos.average_cost * pos.total_quantity)
            data["market_value"] += (pos.total_quantity * asset.current_price)
        
        # 2. Process Holdings List and Calculate Portfolio Totals (Assets Only part)
        holdings_list = []
        assets_market_value = Decimal(0)
        
        for ticker, data in holdings_map.items():
            qty = data["quantity"]
            if qty == 0: continue
            
            avg_cost = data["total_cost"] / qty
            mkt_val = data["market_value"]
            profit = mkt_val - data["total_cost"]
            profit_pct = (profit / data["total_cost"] * 100) if data["total_cost"] > 0 else 0
            
            assets_market_value += mkt_val
            total_cost_basis += data["total_cost"]
            
            holdings_list.append(HoldingItem(
                id=ticker, # using ticker as ID for aggregated view
                ticker=ticker,
                name=data["name"],
                current_price=data["current_price"],
                quantity=qty,
                average_cost=avg_cost,
                market_value=mkt_val,
                profit=profit,
                profit_percent=profit_pct,
                allocation=Decimal(0) # Calc later
            ))
            
        # 3. Calculate Accounts Balances (Cash + Assets) and Portfolio Total Value
        account_items = []
        portfolio_total_value = Decimal(0)
        
        for acc in portfolio.accounts:
            bal = AccountService(self.session)._calculate_total_balance(acc.id)
            # bal = self._calculate_account_balance(acc.id)
            portfolio_total_value += bal
            account_items.append(AccountSummaryItem(
                id=acc.id,
                name=acc.name,
                balance=bal
            ))
            
        # 4. Update Allocations
        # Allocation is based on Portfolio Total Value (Cash + Assets) or just Assets?
        # Usually Holdings Allocation is % of Total Portfolio Value (including cash) or % of Invested Assets.
        # Let's assume % of Total Portfolio Value.
        if portfolio_total_value > 0:
            for h in holdings_list:
                h.allocation = (h.market_value / portfolio_total_value) * 100
        
        # 5. Portfolio Level Stats
        # Total Profit = (Current Value - Net Invested) ?
        # Hard to track "Net Invested" perfectly without full cash flow history.
        # Simplification: Sum of (Market Value of Holdings - Cost Basis of Holdings).
        # This ignores Cash profit (interest).
        
        total_profit = assets_market_value - total_cost_basis
        total_profit_percent = (total_profit / total_cost_basis * 100) if total_cost_basis > 0 else 0
        
        return PortfolioSummary(
            id=portfolio.id,
            name=portfolio.name,
            total_value=portfolio_total_value,
            total_profit=total_profit,
            total_profit_percent=total_profit_percent,
            daily_change=Decimal(0), # Placeholder
            daily_change_percent=Decimal(0), # Placeholder
            holdings=holdings_list,
            accounts=account_items
        )

    def update_portfolio(self, portfolio: Portfolio, portfolio_in: PortfolioUpdate) -> Portfolio:
        portfolio_data = portfolio_in.model_dump(exclude_unset=True, exclude={"account_ids"})
        portfolio.sqlmodel_update(portfolio_data)
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