# ProfitFolio

ProfitFolio 是一個web-based的個人投資組合追蹤系統。

本系統允許使用者手動紀錄金融交易，並透過 API 自動抓取即時價格，以計算並視覺化呈現投資組合的即時價值與損益。系統支援多重投資組合（例如：真實持倉 vs. 虛擬投資），以及每個組合下的多重帳戶管理。

## Features

### M1: 多層級資產管理
* [ ] **多投資組合 (Portfolio) 管理**：
    * 支援建立多個獨立的投資組合（例如：「真實持倉」、「虛擬策略A」）。
    * 可設定組合類型（真實 / 虛擬）。
* [ ] **多帳戶 (Account) 管理**：
    * 在每個投資組合下，可建立多個帳戶（例如：「Binance」、「Firstrade」）。
    * 所有資產和交易紀錄都歸屬於特定帳戶。

### M2: 交易與持倉
* [ ] **手動交易紀錄 (Transaction)**：
    * 支援手動輸入「買入 (Buy)」與「賣出 (Sell)」的交易紀錄。
    * 紀錄欄位包含：交易時間、標的、數量、成交單價、手續費。
* [ ] **自動持倉計算 (Position)**：
    * 系統根據「交易紀錄」自動即時計算每個帳戶中各資產的「目前總數量」與「平均持有成本」。

### M3: 數據與分析
* [ ] **即時價格整合 (Price API)**：
    * 後端定時任務 (Scheduled Job) 會自動抓取所有已持倉「資產 (Asset)」的最新價格。
    * *(API 來源：例如 CoinGecko, Yahoo Finance)*
* [ ] **即時儀表板 (Dashboard)**：
    * 計算並顯示每個「投資組合」及「帳戶」的即時總價值。
    * 計算並顯示每筆「持倉 (Position)」的未實現損益 (Unrealized P&L)。
* [ ] **損益報表 (P&L Report)**：
    * 當「賣出」交易發生時，系統計算並紀錄該筆交易的「已實現損益 (Realized P&L)」。
* [ ] **資產配置視覺化**：
    * 提供圓餅圖，顯示資產類別（例如：加密貨幣、ETF、股票）的佔比。

### M4: 基礎設定
* [ ] **資產標的 (Asset) 管理**：
    * 使用者可自定義要追蹤的資產標的（例如：BTC, VT, 0050）。
* [ ] **資產類別 (AssetType) 管理**：
    * 使用者可自定義資產的分類（例如：加密貨幣、美股ETF、台股）。
* [ ] **使用者系統 (User)**：
    * (初期可簡化為單一使用者，但資料庫已規劃)

---

## Tech Stack

* **後端 (Backend):**
    * **Framework:** FastAPI (Python 3.13)
    * **Database:** PostgreSQL
    * **ORM / DB Toolkit:** SQLModel
    * **API:** RESTful API
* **前端 (Frontend):**
    * **Framework:** Vue.js (v3)
    * **Build Tool:** Vite
    * **State Management:** Pinia
    * **API Client:** Axios
    * **UI Library:** (待定, 例如 Element Plus 或 Vuetify)
    * **Charts:** ECharts 或 Chart.js
* **資料庫 (Database):**
    * PostgreSQL 18

---

## Roadmap

* **自動交易匯入**：整合 Binance, Interactive Brokers (IB) API，實現交易紀錄自動同步。
* **歷史績效圖表**：紀錄每日的投資組合總價值，並繪製歷史績F效曲線。
* **股息/利息紀錄**：新增「股息 (Dividend)」交易類型，納入投報率計算。
* **Docker 化**：使用 `docker-compose.yml` 將 FastAPI, Vue (Nginx) 和 Postgres 打包，實現一鍵部署。

(test)
