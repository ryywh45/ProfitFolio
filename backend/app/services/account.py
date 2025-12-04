from typing import Annotated
from decimal import Decimal
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.accounts import Account
from app.models.transacions import Transaction, Position, TransactionType
from app.models.assets import Asset
from app.schemas.account import AccountCreate, AccountUpdate, AccountRead


class AccountService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def _calculate_total_balance(self, account_id: int) -> Decimal:
        """
        Calculate the total Net Worth of an account based on current positions.
        
        Formula: Sum(Position.total_quantity * Asset.current_price)
        
        Note: 
        Since 'Cash' is now treated as a Position (AssetType.fiat), 
        this loop automatically includes the cash balance value.
        """
        
        # 1. 查詢該帳戶的所有持倉 (包含現金在內)，並 Join Asset 表取得最新價格
        query = (
            select(Position, Asset)
            .join(Asset, Position.asset_id == Asset.id)
            .where(Position.account_id == account_id)
        )
        
        results = self.session.exec(query).all()
        
        total_value = Decimal(0)
        
        for position, asset in results:
            # 安全防護：確保 quantity 和 price 不是 None
            qty = position.total_quantity or Decimal(0)
            current_price = asset.current_price or Decimal(0)
            
            # 計算市值
            # Case A (股票/幣): 10 股 * 150 USD = 1500 USD
            # Case B (現金): 32000 TWD * 0.03125 (TWD匯率) = 1000 USD
            market_value = qty * current_price
            
            total_value += market_value
            
        return total_value

    def create_account(self, account_in: AccountCreate) -> Account:
        db_account = Account.model_validate(account_in)
        self.session.add(db_account)
        self.session.commit()
        self.session.refresh(db_account)
        return db_account

    def get_account_by_id(self, account_id: int) -> AccountRead | None:
        account = self.session.get(Account, account_id)
        if not account:
            return None
        
        total_balance = self._calculate_total_balance(account.id)
        
        # Convert to Read schema
        account_read = AccountRead.model_validate(account)
        account_read.total_balance = total_balance
        return account_read

    def get_accounts(self, offset: int = 0, limit: int = 100) -> list[AccountRead]:
        accounts = self.session.exec(select(Account).offset(offset).limit(limit)).all()
        
        results = []
        for account in accounts:
            total_balance = self._calculate_total_balance(account.id)
            account_read = AccountRead.model_validate(account)
            account_read.total_balance = total_balance
            results.append(account_read)
            
        return results

    def get_account_model(self, account_id: int) -> Account | None:
        """Helper to get raw DB model for internal use"""
        return self.session.get(Account, account_id)

    def update_account(self, db_account: Account, account_in: AccountUpdate) -> Account:
        account_data = account_in.model_dump(exclude_unset=True)
        db_account.sqlmodel_update(account_data)
        self.session.add(db_account)
        self.session.commit()
        self.session.refresh(db_account)
        return db_account

    def delete_account(self, db_account: Account) -> None:
        self.session.delete(db_account)
        self.session.commit()
        return
