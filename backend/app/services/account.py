from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.accounts import Account
from app.schemas.account import AccountCreate, AccountUpdate


class AccountService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def create_account(self, account_in: AccountCreate) -> Account:
        db_account = Account.model_validate(account_in)
        self.session.add(db_account)
        self.session.commit()
        self.session.refresh(db_account)
        return db_account

    def get_account_by_id(self, account_id: int) -> Account | None:
        return self.session.get(Account, account_id)

    def get_accounts(self, offset: int = 0, limit: int = 100) -> list[Account]:
        accounts = self.session.exec(select(Account).offset(offset).limit(limit)).all()
        return accounts

    def update_account(self, account: Account, account_in: AccountUpdate) -> Account:
        account_data = account_in.model_dump(exclude_unset=True)
        account.sqlmodel_update(account_data)
        self.session.add(account)
        self.session.commit()
        self.session.refresh(account)
        return account

    def delete_account(self, account: Account) -> None:
        self.session.delete(account)
        self.session.commit()
        return
