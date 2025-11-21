```
backend/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env                  # 暫時沒用到
└── app/
    ├── __init__.py
    ├── main.py           # 程式入口
    ├── core/
    │   ├── __init__.py
    │   ├── config.py     # 讀取 .env
    │   └── database.py   # 初始化 SQLModel Session
    ├── models/           # 資料庫模型 (Table Schema)
    │   ├── __init__.py
    │   ├── asset.py      # 例如：定義 Asset Table
    │   └── transaction.py
    ├── schemas/          # API 請求/回應模型 (Pydantic)
    │   ├── __init__.py
    │   └── asset.py      # 例如：AssetCreate, AssetRead
    ├── services/         # 商業邏輯
    │   ├── __init__.py
    │   ├── asset_service.py      # 處理資產計算、邏輯
    │   └── finance_calculator.py # 純計算邏輯 (XIRR 等)
    └── api/              # 路由層 (Routes)
        ├── __init__.py
        └── v1/
            ├── __init__.py
            ├── api.py    # 匯總所有 router
            └── endpoints/
                ├── __init__.py
                └── assets.py # 定義 GET /assets, POST /assets 等等
```
