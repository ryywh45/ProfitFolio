from typing import Annotated, List, Dict
from decimal import Decimal
from fastapi import Depends
from sqlmodel import Session, select, func

from app.core.database import SQLiteDB
from app.models.assets import Asset, AssetType
from app.models.accounts import Account
from app.models.transacions import Position, Transaction, TransactionType
from app.schemas.dashboard import DashboardStatsResponse, AssetAllocationItem
from app.services.account import AccountService


class DashboardService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def get_stats(self) -> DashboardStatsResponse:
        # 1. Calculate Total Net Worth (Cash + Assets) across all accounts
        accounts = self.session.exec(select(Account)).all()
        account_service = AccountService(self.session)
        
        total_net_worth = Decimal(0)
        for acc in accounts:
            total_net_worth += account_service._calculate_total_balance(acc.id)
            
        # 2. Calculate Allocation by Asset Type (Crypto, Stock, ETF, Fiat, etc.)
        # We iterate all positions and sum market value by asset.type
        
        # Join Position -> Asset
        query = select(Position, Asset).join(Asset, Position.asset_id == Asset.id)
        positions_assets = self.session.exec(query).all()
        
        allocation_map: Dict[str, Decimal] = {}
        total_assets_value = Decimal(0)
        
        # Also track individual asset performance for "Top Performer"
        best_performer_name = None
        best_performer_change_pct = -float('inf')
        
        # Track total cost basis for Total Profit calculation
        total_cost_basis = Decimal(0)
        
        for pos, asset in positions_assets:
            market_value = pos.total_quantity * asset.current_price
            cost_basis = pos.total_quantity * pos.average_cost
            
            total_assets_value += market_value
            total_cost_basis += cost_basis
            
            # Group by Type
            asset_type = asset.type.value # Enum value
            allocation_map[asset_type] = allocation_map.get(asset_type, Decimal(0)) + market_value
            
            # Check performance (Profit %)
            if cost_basis > 0:
                profit = market_value - cost_basis
                profit_pct = float(profit / cost_basis * 100)
                if profit_pct > best_performer_change_pct:
                    best_performer_change_pct = profit_pct
                    best_performer_name = asset.name
        
        # Add Cash Balance to Allocation if significant?
        # Usually "Cash" is a separate category. 
        # We need to calculate total cash across all accounts.
        # total_cash = Decimal(0)
        # for acc in accounts:
        #      # Re-calculate cash only (this is inefficient re-calculation but reusing logic is safer)
        #      # Ideally _calculate_total_balance should return (cash, assets) tuple.
        #      # I will just quick-calc cash here.
        #     txns = self.session.exec(select(Transaction).where(Transaction.account_id == acc.id)).all()
        #     acc_cash = Decimal(0)
        #     for t in txns:
        #         amt = (t.quantity or 0) * (t.price_per_unit or 0)
        #         fee = t.fee or 0
        #         if t.type == TransactionType.deposit: acc_cash += amt
        #         elif t.type == TransactionType.withdraw: acc_cash -= amt
        #         elif t.type == TransactionType.buy: acc_cash -= (amt + fee)
        #         elif t.type == TransactionType.sell: acc_cash += (amt - fee)
        #         elif t.type == TransactionType.dividend: acc_cash += (amt - fee)
        #     total_cash += acc_cash
            
        # if total_cash > 0:
        #     allocation_map['Cash'] = allocation_map.get('Cash', Decimal(0)) + total_cash
        #     # Net worth check: net_worth should match total_assets + total_cash
        #     # total_net_worth is already calculated correctly above using same logic.

        # Build Allocation List
        allocation_list = []
        if total_net_worth > 0:
            for label, value in allocation_map.items():
                pct = float(value / total_net_worth * 100)
                allocation_list.append(AssetAllocationItem(label=label, value=value, percentage=pct))
        
        # 3. Total Profit
        # Total Profit = (Total Assets Value - Total Cost Basis)
        # This ignores Cash profit.
        total_profit = total_assets_value - total_cost_basis
        
        # 4. Changes 24h (Placeholder as we don't have history)
        net_worth_change_24h = 0.0
        total_profit_change_24h = 0.0
        top_performer_change = best_performer_change_pct if best_performer_name else None
        
        return DashboardStatsResponse(
            net_worth=total_net_worth,
            net_worth_change_24h=net_worth_change_24h,
            total_profit=total_profit,
            total_profit_change_24h=total_profit_change_24h,
            top_performer_name=best_performer_name,
            top_performer_change=top_performer_change,
            allocation=allocation_list
        )
