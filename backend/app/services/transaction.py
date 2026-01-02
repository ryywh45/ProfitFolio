from typing import Annotated, List, Any
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.transacions import Transaction, Position, TransactionType
from app.models.accounts import Account
from app.models.assets import Asset
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionReadDetail


class TransactionService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def _recalculate_position(self, account_id: int, asset_id: int) -> None:
        """
        Recalculate Position (total_quantity, average_cost) from all transactions
        for a specific (account_id, asset_id) pair.
        TODO: 當交易紀錄很多的時候，效能會變差，待優化
        """
        if not asset_id:
            return

        # Fetch all transactions for this account and asset, ordered by time
        query = select(Transaction).where(
            Transaction.account_id == account_id,
            Transaction.asset_id == asset_id
        ).order_by(Transaction.transaction_time.asc())
        
        transactions = self.session.exec(query).all()
        
        total_qty = Decimal(0)
        total_cost = Decimal(0)
        
        for txn in transactions:
            qty = txn.quantity or Decimal(0)
            price = txn.price_per_unit or Decimal(0)
            fee = txn.fee or Decimal(0)
            
            if txn.type in [TransactionType.buy, TransactionType.deposit]:
                # Increase Quantity and Cost Basis
                # Cost Basis = (Qty * Price) + Fee
                total_cost += (qty * price) + fee
                total_qty += qty
                
            elif txn.type in [TransactionType.sell, TransactionType.withdraw]:
                # Decrease Quantity. Reduce Cost Basis proportionally.
                if total_qty > 0:
                    # Calculate current average cost per unit
                    avg_cost = total_cost / total_qty
                    # Remove proportional cost
                    total_cost -= (avg_cost * qty)
                
                total_qty -= qty
                
            elif txn.type == TransactionType.dividend:
                # If dividend has quantity (e.g. stock dividend), treat as buy with provided price (or 0)
                if qty > 0:
                    total_cost += (qty * price) + fee
                    total_qty += qty
        
        # Calculate final Average Cost
        average_cost = Decimal(0)
        if total_qty > 0:
            average_cost = total_cost / total_qty
            
        # Find existing Position or create new one
        position = self.session.exec(
            select(Position).where(
                Position.account_id == account_id,
                Position.asset_id == asset_id
            )
        ).first()
        
        if not position:
            if total_qty == 0 and average_cost == 0:
                # No position and no quantity, don't create
                return
            position = Position(account_id=account_id, asset_id=asset_id)
            self.session.add(position)
            
        position.total_quantity = total_qty
        position.average_cost = average_cost
        position.last_updated = datetime.now(timezone(timedelta(hours=8)))
        
        # If quantity becomes 0 (or very close to 0), maybe keep it to track history or delete? 
        # Usually keeping it with 0 qty is fine.
        
        self.session.add(position)
        self.session.commit()
        self.session.refresh(position)

    def create_transaction(self, transaction_in: TransactionCreate) -> Transaction:
        # 1. 建立並儲存交易紀錄
        db_transaction = Transaction.model_validate(transaction_in)
        self.session.add(db_transaction)
        
        # 2. 處理 Position (持倉) 邏輯
        # 只有 Buy/Sell/Deposit/Withdraw 會影響庫存，這裡以 Buy/Sell 為主範例
        if transaction_in.asset_id:
            # 搜尋該帳戶是否已有該資產的持倉
            statement = select(Position).where(
                Position.account_id == transaction_in.account_id,
                Position.asset_id == transaction_in.asset_id
            )
            position = self.session.exec(statement).first()

            # 如果沒有持倉，則建立一個新的
            if not position:
                position = Position(
                    account_id=transaction_in.account_id,
                    asset_id=transaction_in.asset_id,
                    total_quantity=0,
                    average_cost=0
                )

            # --- 計算邏輯 ---
            qty = transaction_in.quantity or Decimal(0)
            price = transaction_in.price_per_unit or Decimal(0)
            fee = transaction_in.fee or Decimal(0)

            if transaction_in.type == TransactionType.buy:
                # 買入：增加數量，重新計算平均成本 (加權平均)
                # 新總成本 = (舊數量 * 舊均價) + (新數量 * 新價格) + 手續費
                old_total_cost = position.total_quantity * position.average_cost
                new_cost_basis = (qty * price) + fee
                
                new_total_qty = position.total_quantity + qty
                
                if new_total_qty > 0:
                    position.average_cost = (old_total_cost + new_cost_basis) / new_total_qty
                position.total_quantity = new_total_qty

            elif transaction_in.type == TransactionType.sell:
                # 賣出：減少數量，平均成本通常不變 (除非你計算已實現損益，這裡先保持簡單)
                position.total_quantity -= qty
                # 若賣光了，確保數量不為負，且均價可歸零或保留
                if position.total_quantity <= 0:
                    position.total_quantity = 0
                    position.average_cost = 0

            # 3. 更新 Position
            self.session.add(position)
        
        # 4. 提交所有變更 (Transaction + Position)
        self.session.commit()
        self.session.refresh(db_transaction)
        return db_transaction

    def get_transaction(self, transaction_id: int) -> Transaction | None:
        """Get raw transaction model by ID (for internal use: update/delete)"""
        return self.session.get(Transaction, transaction_id)

    def get_transaction_detail(self, transaction_id: int) -> TransactionReadDetail | None:
        """Get transaction with details (account name, asset name)"""
        query = (
            select(Transaction, Account.name, Asset.name)
            .join(Account, Transaction.account_id == Account.id)
            .outerjoin(Asset, Transaction.asset_id == Asset.id)
            .where(Transaction.id == transaction_id)
        )
        result = self.session.exec(query).first()
        
        if not result:
            return None
            
        txn, acc_name, ass_name = result
        txn_dict = txn.model_dump()
        txn_dict['account_name'] = acc_name
        txn_dict['asset_name'] = ass_name
        return TransactionReadDetail(**txn_dict)

    def get_transactions(self, offset: int = 0, limit: int = 100, account_id: int | None = None) -> List[TransactionReadDetail]:
        query = (
            select(Transaction, Account.name, Asset.name)
            .join(Account, Transaction.account_id == Account.id)
            .outerjoin(Asset, Transaction.asset_id == Asset.id)
        )
        
        if account_id:
            query = query.where(Transaction.account_id == account_id)
        
        # Order by transaction_time desc by default
        query = query.order_by(Transaction.transaction_time.desc()).offset(offset).limit(limit)
        
        results = self.session.exec(query).all()
        
        transactions_detail = []
        for txn, acc_name, ass_name in results:
            txn_dict = txn.model_dump()
            txn_dict['account_name'] = acc_name
            txn_dict['asset_name'] = ass_name
            transactions_detail.append(TransactionReadDetail(**txn_dict))
            
        return transactions_detail

    def update_transaction(self, transaction: Transaction, transaction_in: TransactionUpdate) -> Transaction:
        # Capture old IDs before update
        old_account_id = transaction.account_id
        old_asset_id = transaction.asset_id
        
        transaction_data = transaction_in.model_dump(exclude_unset=True)
        transaction.sqlmodel_update(transaction_data)
        self.session.add(transaction)
        self.session.commit()
        self.session.refresh(transaction)
        
        # Recalculate for old (account, asset) if it existed and was different
        if old_asset_id and (old_account_id != transaction.account_id or old_asset_id != transaction.asset_id):
             self._recalculate_position(old_account_id, old_asset_id)
             
        # Recalculate for new (account, asset)
        if transaction.asset_id:
            self._recalculate_position(transaction.account_id, transaction.asset_id)
            
        return transaction

    def delete_transaction(self, transaction: Transaction) -> None:
        account_id = transaction.account_id
        asset_id = transaction.asset_id
        
        self.session.delete(transaction)
        self.session.commit()
        
        # Recalculate Position
        if asset_id:
            self._recalculate_position(account_id, asset_id)
            
        return