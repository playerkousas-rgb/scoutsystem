# 旅團管理與協作系統 UI MVP

這是第一階段 UI / Flow Prototype，用於先在 GitHub 和 Vercel 上部署查看畫面，之後再逐 Part 接入 Google Sheet 和 Apps Script。

## Routes

- `/` 首頁
- `/login` Demo 登入 / 身份切換
- `/register` 家長註冊
- `/parent` 家長入口
- `/admin` 管理後台
- `/ui-map` UI 地圖
- `/guide` MVP 說明

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

目前資料使用 browser localStorage 模擬，未接 Google Sheet / Apps Script。
