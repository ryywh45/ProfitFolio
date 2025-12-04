from sqlmodel import Session, select
from app.models.assets import Asset, AssetType

# 假設所有法幣的基準價都是對 USD，所以 currency 填 "USD"
INITIAL_ASSETS = [
    {"ticker": "USD", "name": "US Dollar", "type": AssetType.fiat, "currency": "USD", "current_price": 1.0},
    # {"ticker": "TWD", "name": "New Taiwan Dollar", "type": AssetType.fiat, "currency": "USD", "current_price": 0.03125}, # 預設匯率
    # {"ticker": "JPY", "name": "Japanese Yen", "type": AssetType.fiat, "currency": "USD", "current_price": 0.0067},
    # {"ticker": "EUR", "name": "Euro", "type": AssetType.fiat, "currency": "USD", "current_price": 1.05},
]

def init_fiat_assets(session: Session):
    for asset_data in INITIAL_ASSETS:
        # 1. 檢查是否存在 (用 Ticker 當唯一識別)
        asset = session.exec(select(Asset).where(Asset.ticker == asset_data["ticker"])).first()
        
        # 2. 如果不存在，才新增
        if not asset:
            asset = Asset(**asset_data) # 使用解包語法建立物件
            session.add(asset)
            print(f"✅ Created default asset: {asset_data['name']}")
    
    # 3. 提交變更
    session.commit()