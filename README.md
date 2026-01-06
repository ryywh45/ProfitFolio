# ProfitFolio

## Development
0. 裝git, docker
1. git clone, 創自己的branch
2. 
```
docker-compose build
```
3. 
```
docker-compose up
```

## System Architecture（系統整體架構）

### 整體概念

ProfitFolio 採用典型的「前後端分離 + 資料庫」三層架構：

- **Client（使用者瀏覽器）**
  - 使用者透過瀏覽器存取前端單頁應用程式 (SPA)。

- **Frontend（前端 Web 應用）**
  - 技術棧：React + TypeScript + Vite
  - 主要結構：
    - `index.html` / `index.tsx` / `App.tsx`：前端入口與應用根組件
    - `components/*.tsx`：功能頁面與 UI 元件（`Dashboard`, `Accounts`, `Assets`, `Portfolios`, `Transactions`, `Sidebar`, `Header` 等）
    - `services/api.ts`：後端 REST API 呼叫封裝
    - `types.ts` / `constants.ts`：型別與常數定義
  - 與後端互動：
    - 透過 HTTP + JSON 呼叫後端 FastAPI 的 `/api/v1/...` 路由
    - 開發環境 CORS 允許來源：`http://localhost:3000`

- **Backend（後端 API 服務）**
  - 技術棧：FastAPI (Python)
  - 主要結構：
    - `app/main.py`：建立 FastAPI 應用、設定 CORS、中介層與 lifespan，掛載 `api_router`（`/api/v1`）
    - `app/api/v1/api.py` + `app/api/v1/endpoints/*.py`：v1 版 REST API 路由，依功能拆分：
      - `accounts.py`：帳戶相關 API
      - `assets.py`：資產相關 API
      - `dashboard.py`：儀表板/總覽資料 API
      - `portfolios.py`：投資組合 API
      - `transactions.py`：交易紀錄 API
    - `app/models/*.py`：資料庫 ORM 模型（`accounts`, `assets`, `transacions`）
    - `app/schemas/*.py`：Pydantic schema，定義 API 請求/回應的資料結構（`account`, `asset`, `transaction`, `portfolio`, `dashboard`）
    - `app/services/*.py`：商業邏輯層，負責整合多個 model 的操作與計算
    - `app/core/database.py` / `app/core/init_db.py`：
      - `SQLiteDB.create_db_and_tables()`：建立 SQLite 資料表
      - `SQLiteDB.initialize()`：初始化資料或連線設定
  - 基本路由：
    - `GET /`：簡易健康檢查（回傳 "hello world"）
    - `/api/v1/...`：主體商業 API

- **Database（資料庫層）**
  - 使用 **SQLite**
    - 實體檔案：`sqlite_data/test.db`
    - 由 `app/core/database.py` 中的 `SQLiteDB` 管理連線與表結構
  - 後端 `models` 對應 SQLite 資料表，`services` 呼叫 `models` 進行 CRUD，最後由 API 將結果以 JSON 回傳前端。

- **Deployment / Runtime（部署與執行環境）**
  - `backend/Dockerfile.dev`：後端開發用 Docker 映像定義
  - `frontend/Dockerfile.dev`：前端開發用 Docker 映像定義
  - `docker-compose.yml`：編排前端、後端與 SQLite 資料卷，支援一鍵啟動整個開發環境
  - 後端依賴管理：`backend/pyproject.toml`, `backend/requirements.txt`, `backend/uv.lock`
  - 前端依賴管理：`frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`

## todo
1. 支援多幣種
2. 完善前端UX
3. 新增背景排程抓價格

---

## Roadmap

* **自動交易匯入**：整合 Binance, Interactive Brokers (IB) API，實現交易紀錄自動同步。
* **歷史淨值曲線**：基於 `MarketData` 與每日持倉快照，繪製投資組合的歷史淨值走勢 (Equity Curve)。
* **多幣種顯示**：支援切換顯示幣別 (例如：用 TWD 查看所有美股資產)。
* **Docker 化部署**：完善 `docker-compose.yml` 設定，實現一鍵建置開發與生產環境。
