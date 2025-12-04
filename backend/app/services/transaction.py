from typing import Annotated, List, Optional
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.transacions import Transaction, Position, TransactionType
from app.models.accounts import Account
from app.models.assets import Asset, AssetType
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionReadDetail


class TransactionService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    # def _recalculate_position(self, account_id: int, asset_id: int) -> None:
    #     """
    #     Recalculate Position (total_quantity, average_cost) from all transactions
    #     for a specific (account_id, asset_id) pair.
    #     TODO: 當交易紀錄很多的時候，效能會變差，待優化
    #     """
    #     if not asset_id:
    #         return

    #     # Fetch all transactions for this account and asset, ordered by time
    #     query = select(Transaction).where(
    #         Transaction.account_id == account_id,
    #         Transaction.asset_id == asset_id
    #     ).order_by(Transaction.transaction_time.asc())
        
    #     transactions = self.session.exec(query).all()
        
    #     total_qty = Decimal(0)
    #     total_cost = Decimal(0)
        
    #     for txn in transactions:
    #         qty = txn.quantity or Decimal(0)
    #         price = txn.price_per_unit or Decimal(0)
    #         fee = txn.fee or Decimal(0)
            
    #         if txn.type in [TransactionType.buy, TransactionType.deposit]:
    #             # Increase Quantity and Cost Basis
    #             # Cost Basis = (Qty * Price) + Fee
    #             total_cost += (qty * price) + fee
    #             total_qty += qty
                
    #         elif txn.type in [TransactionType.sell, TransactionType.withdraw]:
    #             # Decrease Quantity. Reduce Cost Basis proportionally.
    #             if total_qty > 0:
    #                 # Calculate current average cost per unit
    #                 avg_cost = total_cost / total_qty
    #                 # Remove proportional cost
    #                 total_cost -= (avg_cost * qty)
                
    #             total_qty -= qty
                
    #         elif txn.type == TransactionType.dividend:
    #             # If dividend has quantity (e.g. stock dividend), treat as buy with provided price (or 0)
    #             if qty > 0:
    #                 total_cost += (qty * price) + fee
    #                 total_qty += qty
        
    #     # Calculate final Average Cost
    #     average_cost = Decimal(0)
    #     if total_qty > 0:
    #         average_cost = total_cost / total_qty
            
    #     # Find existing Position or create new one
    #     position = self.session.exec(
    #         select(Position).where(
    #             Position.account_id == account_id,
    #             Position.asset_id == asset_id
    #         )
    #     ).first()
        
    #     if not position:
    #         if total_qty == 0 and average_cost == 0:
    #             # No position and no quantity, don't create
    #             return
    #         position = Position(account_id=account_id, asset_id=asset_id)
    #         self.session.add(position)
            
    #     position.total_quantity = total_qty
    #     position.average_cost = average_cost
    #     position.last_updated = datetime.now(timezone(timedelta(hours=8)))
        
    #     # If quantity becomes 0 (or very close to 0), maybe keep it to track history or delete? 
    #     # Usually keeping it with 0 qty is fine.
        
    #     self.session.add(position)
    #     self.session.commit()
    #     self.session.refresh(position)

    def _get_cash_asset_id(self, account_id: int) -> Optional[int]:
        """
        Helper: 根據 Account 的幣別找出對應的 Cash Asset ID (例如 USD)
        """
        account = self.session.get(Account, account_id)
        if not account:
            return None
        
        # 尋找 ticker = account.currency 且 type = fiat 的資產
        statement = select(Asset).where(
            Asset.ticker == account.currency,
            Asset.type == AssetType.fiat
        )
        asset = self.session.exec(statement).first()
        return asset.id if asset else None

    def _recalculate_cash_position(self, account_id: int) -> None:
        """
        計算該帳戶的「現金持倉」。
        邏輯：遍歷該帳戶所有交易，根據交易類型計算現金流入/流出。
        """
        cash_asset_id = self._get_cash_asset_id(account_id)
        if not cash_asset_id:
            # 如果系統沒有對應的法幣資產，無法計算現金持倉，直接返回
            return

        # 抓取該帳戶的所有交易 (不管 asset_id 是什麼)
        transactions = self.session.exec(
            select(Transaction)
            .where(Transaction.account_id == account_id)
        ).all()

        total_cash = Decimal(0)

        for txn in transactions:
            qty = txn.quantity or Decimal(0)
            price = txn.price_per_unit or Decimal(0) # 這裡是帳戶幣別計價的金額
            fee = txn.fee or Decimal(0)
            
            # 計算該筆交易的總金額 (不含手續費)
            tx_amount = qty * price
            
            # 判斷現金流方向 (Cash Flow)
            if txn.type == TransactionType.deposit:
                # 入金：現金增加 (qty 即金額)
                total_cash += tx_amount
            
            elif txn.type == TransactionType.withdraw:
                # 出金：現金減少 (qty 即金額)
                total_cash -= tx_amount
                
            elif txn.type == TransactionType.buy:
                # 買入：現金減少 (支付貨款 + 手續費)
                total_cash -= (tx_amount + fee)
                
            elif txn.type == TransactionType.sell:
                # 賣出：現金增加 (收到貨款 - 手續費)
                total_cash += (tx_amount - fee)
                
            elif txn.type == TransactionType.dividend:
                # 股息：現金增加 (收到股息 - 稅費)
                total_cash += (tx_amount - fee)

        # 更新或建立 Cash Position
        self._update_position_record(account_id, cash_asset_id, total_cash, Decimal(1.0))

    def _recalculate_target_asset_position(self, account_id: int, asset_id: int) -> None:
        """
        計算「標的資產」(Stock/Crypto/ETF 等) 的持倉與平均成本。
        """
        if not asset_id:
            return

        transactions = self.session.exec(
            select(Transaction)
            .where(
                Transaction.account_id == account_id,
                Transaction.asset_id == asset_id
            )
            .order_by(Transaction.transaction_time.asc())
        ).all()
        
        total_qty = Decimal(0)
        total_cost = Decimal(0)
        
        for txn in transactions:
            qty = txn.quantity or Decimal(0)
            price = txn.price_per_unit or Decimal(0)
            fee = txn.fee or Decimal(0)
            
            if txn.type in [TransactionType.buy, TransactionType.deposit]:
                # 買入：增加數量，累加成本
                total_cost += (qty * price) + fee
                total_qty += qty
                
            elif txn.type in [TransactionType.sell, TransactionType.withdraw]:
                # 賣出：減少數量，依比例減少成本
                if total_qty > 0:
                    avg_cost = total_cost / total_qty
                    total_cost -= (avg_cost * qty)
                total_qty -= qty
            
            # 註：Dividend 通常不影響持倉數量 (除非是股票股利，這邊暫時假設是現金股利，不影響 Stock Position)

        # 計算最終平均成本
        average_cost = Decimal(0)
        if total_qty > 0:
            average_cost = total_cost / total_qty
            
        # 更新 DB
        self._update_position_record(account_id, asset_id, total_qty, average_cost)

    def _update_position_record(self, account_id: int, asset_id: int, qty: Decimal, avg_cost: Decimal):
        """
        共用的 DB 更新邏輯
        """
        position = self.session.exec(
            select(Position).where(
                Position.account_id == account_id,
                Position.asset_id == asset_id
            )
        ).first()
        
        if not position:
            if qty == 0 and avg_cost == 0:
                return
            position = Position(account_id=account_id, asset_id=asset_id)
            self.session.add(position)
            
        position.total_quantity = qty
        position.average_cost = avg_cost
        position.last_updated = datetime.now(timezone(timedelta(hours=8)))
        
        self.session.add(position)
        self.session.commit()
        self.session.refresh(position)

    def _recalculate_position(self, account_id: int, asset_id: int) -> None:
        """
        Public method to recalculate position for given (account_id, asset_id).
        """
        if asset_id:
            self._recalculate_target_asset_position(account_id, asset_id)
        self._recalculate_cash_position(account_id)
    
    def create_transaction(self, transaction_in: TransactionCreate) -> Transaction:
        # If transaction_time is not provided, use current time with timezone
        if transaction_in.transaction_time is None:
            transaction_in.transaction_time = datetime.now(timezone(timedelta(hours=8)))
            
        db_transaction = Transaction.model_validate(transaction_in)
        self.session.add(db_transaction)
        self.session.commit()
        self.session.refresh(db_transaction)
        
        self._recalculate_position(db_transaction.account_id, db_transaction.asset_id)
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
        self._recalculate_position(transaction.account_id, transaction.asset_id)
            
        return transaction

    def delete_transaction(self, transaction: Transaction) -> None:
        account_id = transaction.account_id
        asset_id = transaction.asset_id
        
        self.session.delete(transaction)
        self.session.commit()
        
        # Recalculate Position
        self._recalculate_position(account_id, asset_id)
            
        return