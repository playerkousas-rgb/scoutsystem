# ScoutSystem Portal V10.1 轉駁器對接版

## 🛠️ 已完成連通
- **Router 對接**: 已指向 `https://troop-router.vercel.app/api/registry`。
- **動態市集**: `app/market/page.tsx` 可以讀取 Router 上的元件。
- **本地安裝**: 點擊安裝後，元件資訊會存入各旅團自己的 Google Sheet。
- **自動傳參**: `CardItem.tsx` 在跳轉 Tier 3 時會自動補上 `?t=旅團代碼`。

## 部署建議
1. 將 `v10.1/Code.gs` 覆蓋至各旅團的 Apps Script 並發布。
2. 更新 Portal 前端代碼。
3. 在各旅團的 Google Sheet `SystemConfig` 中，確保有 `troop_name` 和 `troop_id` (即 t 參數的值) 的設定。
