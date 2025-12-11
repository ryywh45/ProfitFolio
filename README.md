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
