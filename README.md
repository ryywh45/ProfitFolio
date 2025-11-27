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

## Roadmap

### Phase 1: 專案基建 (Infrastructure Initialization)
> **目標**：確保前後端環境可運行，資料庫可連線。

- [x] **`feat/01-project-init`**
    - [x] **System**: 建立 Git Repo，設定 `.gitignore`。
    - [x] **Backend**: 初始化 FastAPI 專案結構 (`app/main.py`, `app/core/config.py`)。
    - [x] **Frontend**: 把ai提前設計好的東西貼上來。
    - [x] **Docker**: 設定 `docker-compose.yml`。
- [x] **`feat/02-db-connection`**
    - [x] **Backend**: 設定 `SQLModel` 連線字串與 Engine。
    - [x] **DB**: 確認可成功連線並寫入資料。

### Phase 2: 資產標的管理 (Asset Management)
> **目標**：建立可被交易的「物品」（如 BTC, Stock）。

- [X] **`feat/03-asset-crud`**
    - [x] **DB**: 定義 `Asset` Model (table: `assets`)，包含 `type` Check Constraint。
    - [x] **Backend**: 實作 `CRUD` for Assets API。
    <!-- - [ ] **Data**: 撰寫腳本預設寫入：USD, TWD, BTC, ETH, AAPL, TSLA, VTI, VOO。 -->
    - [x] **Frontend**: Assets頁面微調、接API，可新增Asset。
    > 缺少幣別，需要新增資料表欄位
    - [x] **DB**: model新增currency欄位
    - [x] **backend**: API, schema相應修改
    - [x] **frontend**: table新增欄位, 接API
    > 前端幣別選擇待完成，目前只有USD,TWD

### Phase 3: 帳戶與投資組合 (Structure)
> **目標**：建立資金的「容器」與邏輯視圖。

- [ ] **`feat/04-account-manage`**
    - [x] **DB**: 定義 `Account` Model (table: `accounts`)。
    - [x] **Backend**: 實作 `CRUD` for Accounts API。
    - [x] **Frontend**: Accounts頁面微調、接API，可CRUD Account，刪除要二次確認。
    > 目前Accounts頁面還沒有"目前餘額"，要等Transaction功能及Positons表完成  
    > 完成後進行以下動作:
    - [ ] **Backend**: 實作`GET /api/v1/Account`回傳Accounts頁面整個table的資料，目前餘額欄位查Position表。
    - [ ] **Frontend**: 改接新的API`GET /api/v1/Account`

---
### (以下內容未完成)
---

- [ ] **`feat/07-portfolio-core`**
    - [x] **DB**: 定義 `Portfolio` Model (table: `portfolios`)。
    - [x] **Backend**: 實作 `CRUD` for Portfolios API。
    - [ ] **Frontend**: 製作「投資組合管理頁」，可新增/編輯組合 (如 "退休規劃")。
- [ ] **`feat/08-portfolio-relation`**
    - [x] **DB**: 定義 `PortfolioAccount` Link Model (table: `portfolio_accounts`)。
    - [x] **Backend**: 實作 API：將 Account 加入/移出 Portfolio。
    - [ ] **Frontend**: 在投資組合頁面增加「關聯帳戶」的 UI 操作 (多選或開關)。

### Phase 4: 交易與持倉核心 (Transactions & Positions)
> **目標**：系統核心邏輯。交易產生流水，流水驅動庫存變化。

- [ ] **`feat/09-transaction-log`**
    - [ ] **DB**: 定義 `Transaction` Model (table: `transactions`)。
    - [ ] **Backend**: 實作 `POST /transactions` API (記帳)。
    - [ ] **Frontend**: 製作「新增交易 Dialog」，表單包含：日期、帳戶、資產、類型(Buy/Sell)、數量、價格。
- [ ] **`feat/10-position-calculation`**
    - [ ] **DB**: 定義 `Position` Model (table: `positions`)。
    - [ ] **Backend Logic**: 實作 Signal 或 Service function，在 Transaction 寫入時自動更新 Position (加減數量、計算平均成本)。
    - [ ] **Backend API**: 實作 `GET /accounts/{id}/positions` (查詢某帳戶持倉)。
    - [ ] **Frontend**: 在帳戶詳情頁顯示「當前持倉列表」。

### Phase 5: 市場數據與儀表板 (Analytics)
> **目標**：讓數據「活」起來，計算市值與損益。

- [ ] **`feat/11-market-data-schema`**
    - [ ] **DB**: 定義 `MarketData` Model (table: `market_data`)。
    - [ ] **Backend**: 實作外部 API Client (CoinGecko / Yahoo Finance)。
    - [ ] **Backend**: 實作 Background Task (或排程)，更新 `market_data` 並同步更新 `assets.current_price` (Cache)。
- [ ] **`feat/12-dashboard-calculation`**
    - [ ] **Backend**: 實作 `GET /dashboard/summary` API。
        * 邏輯：Portfolio -> Accounts -> Positions * Current Price = Net Worth。
    - [ ] **Frontend**: 首頁儀表板 (Dashboard) 實作。
    - [ ] **Frontend**: 整合 `Chart.js` 或 `ApexCharts` 顯示資產分佈圓餅圖。

## Features

### M1: 彈性資產架構 (Flexible Asset Management)
* [ ] **多重投資組合 (Portfolio) 視圖**：
    * 支援建立多個邏輯投資組合（例如：「淨資產總覽」、「退休規劃」、「高風險實驗」）。
    * 投資組合僅作為「標籤」或「濾鏡」，用於聚合不同帳戶的資產表現。
* [ ] **獨立帳戶 (Account) 管理**：
    * 帳戶代表真實世界的資金託管地（例如：「Binance」、「玉山銀行」、「Metamask」）。
    * **多對多關聯**：支援將同一個帳戶納入多個不同的投資組合中（例如：「Binance」帳戶可同時算入「淨資產」與「加密貨幣組合」）。

### M2: 交易與持倉 (Transactions & Positions)
* [ ] **手動交易紀錄**：
    * 支援多種交易類型：買入 (Buy)、賣出 (Sell)、入金 (Deposit)、出金 (Withdraw)、股息 (Dividend)。
    * 紀錄欄位包含：交易時間、關聯帳戶、標的、數量、成交單價、手續費。
* [ ] **即時持倉計算**：
    * 系統根據交易流水，自動計算每個帳戶對應每個資產的「目前庫存 (Quantity)」與「平均成本 (Average Cost)」。

### M3: 數據與分析 (Data & Analytics)
* [ ] **混合式市場數據架構**：
    * **即時快取 (Cache)**：資產表內建最新價格欄位，確保首頁儀表板載入速度極快。
    * **歷史時序 (Time-Series)**：獨立的 `MarketData` 表紀錄歷史價格，用於繪製走勢圖與回測。
* [ ] **即時價格整合**：
    * 後端排程 (Scheduled Job) 自動從外部 API (如 CoinGecko, Yahoo Finance) 更新價格。
* [ ] **即時儀表板**：
    * 計算並顯示指定「投資組合」的總市值與損益。
    * 支援跨帳戶的資產聚合分析。

### M4: 基礎設定 (Configuration)
* [ ] **資產標的 (Asset) 管理**：
    * 管理要追蹤的金融商品（Ticker, Name）。
    * 支援多種資產類型：Crypto, Stock, ETF, Fiat (法幣)。
* [ ] **使用者系統**：
    * 包含使用者註冊、登入與 JWT 認證機制。

---

## Tech Stack

* **後端 (Backend):**
    * **Framework:** FastAPI (Python 3.13)
    * **Database:** PostgreSQL
    * **ORM / DB Toolkit:** SQLModel (Pydantic + SQLAlchemy)
    * **Environment:** Docker & Docker Compose
* **前端 (Frontend):**
   * **Framework**: React
   * **Language**: TypeScript
   * **Build Tool**: Vite
   * **UI Framework**: Tailwind CSS
   * **State Management**: React Hooks
   * **Charting**: Recharts
   * **API Client**: Fetch API (Native)
* **資料庫 (Database):**
    * SQLite

---

## Roadmap

* **自動交易匯入**：整合 Binance, Interactive Brokers (IB) API，實現交易紀錄自動同步。
* **歷史淨值曲線**：基於 `MarketData` 與每日持倉快照，繪製投資組合的歷史淨值走勢 (Equity Curve)。
* **多幣種顯示**：支援切換顯示幣別 (例如：用 TWD 查看所有美股資產)。
* **Docker 化部署**：完善 `docker-compose.yml` 設定，實現一鍵建置開發與生產環境。