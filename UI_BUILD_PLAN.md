# 旅團管理與協作系統 UI 建構計劃

## 目前策略

第 1 步先完成 UI / Flow Prototype，讓使用者可直接看畫面討論，確定流程、欄位、權限與文案。

第 2 步才開始逐 Part 加入 Google Sheet 與 Apps Script，避免後端先行後反覆重工。

---

## 現有 UI 路由

| 路由 | 用途 | 狀態 |
|---|---|---|
| `/` | 首頁與系統入口 | 已完成 UI |
| `/login` | Demo 登入 / 身份切換 | 已完成 UI |
| `/register` | 家長自行註冊 | 已完成 UI |
| `/parent` | 家長入口 | 已完成 UI |
| `/admin` | 管理後台 | 已完成 UI |
| `/guide` | MVP 說明 | 已完成 UI |
| `/ui-map` | UI 地圖與驗收檢視 | 已完成 UI |

---

## 管理端 UI 範圍

### 權限視角

- 旅長：全旅資料
- 團長：所屬支部
- 領袖：所屬支部

### 後台分頁

1. 總覽
   - 未來活動數
   - 成員數
   - 待回覆數
   - 待審家長數

2. 活動管理
   - 3 步驟新增活動
   - 選擇支部
   - 選擇目標成員
   - 發布活動
   - 報名統計

3. 成員資料庫
   - 成員列表
   - 新增成員
   - 顯示支部、小隊、成員編號、家長綁定狀態

4. 家長審核
   - 顯示家長註冊申請
   - 顯示綁定成員
   - 核准家長帳號

---

## 家長端 UI 範圍

1. 家長註冊
   - 家長姓名
   - 登入電郵
   - 子女成員編號，多個可用逗號、空格、換行

2. 家長入口
   - 顯示已綁定子女
   - 跨支部顯示
   - 顯示未來活動
   - 回覆出席 / 不出席
   - 顯示通知佇列數

---

## Google Sheet / Apps Script 接入建議順序

### Part 1：資料表設計

建議 Sheet tabs：

- `Branches`
- `Users`
- `Members`
- `ParentLinks` 或直接在 `Members` 存 `parentUserId`
- `Events`
- `EventReplies`
- `Notifications`
- `AuditLogs`

### Part 2：API Adapter

先把目前 `lib/troupeStore.ts` 的 localStorage 操作拆成 API 介面，例如：

- `getCurrentUser()`
- `getDashboard()`
- `getMembers()`
- `createEvent()`
- `submitParentReply()`
- `registerParent()`
- `approveParent()`

UI 不直接知道資料來自 localStorage 或 Apps Script。

### Part 3：登入與家長審核

- 家長註冊寫入 Google Sheet
- 後台審核更新狀態
- Demo 登入逐步替換為正式登入或 token-based session

### Part 4：活動與回覆

- 管理端新增活動寫入 `Events`
- 自動產生 `EventReplies`
- 家長回覆更新 `EventReplies`

### Part 5：通知佇列

- 發布活動產生 `Notifications`
- 初版只記錄佇列
- 後續再接 Email / WhatsApp / SMS

---

## UI 確認後再做的項目

- 欄位名稱最終確認
- 狀態文字最終確認
- 是否需要繁中 / 英文雙語
- 是否需要列印或匯出 Excel
- 是否需要活動相片、附件、付款狀態
- 是否需要家長二次確認或修改截止日期
