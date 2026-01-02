from typing import List
from sqlmodel import SQLModel, Field, Relationship

# 注意：這裡需要處理循環引用的 import 問題，通常在 models/__init__.py 統一匯出
# 或是使用字串 "Account" 進行延遲參照

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    
    # 建立與 Account 的關聯
    accounts: List["Account"] = Relationship(back_populates="user")