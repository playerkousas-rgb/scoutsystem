# ScoutSystem 後續開發交接文件

本文件用於下一個新對話開始時，讓開發可以直接延續目前進度。

---

## 目前狀態總結

ScoutSystem 目前已完成：

1. 前端 UI / Flow Prototype 第一版
2. Google Sheet 後端資料表 schema v0.2
3. Google Sheet 初始化及升級 Apps Script helper
4. 圖書館 scout-circulars 方式 B 接入流程
5. 公開行事曆 UI
6. 統一申請頁 UI
7. 成員頁 PT/03 報名表資料中心 UI
8. DBS 專科徽章入口簡化為童軍支部成員頁按鈕

目前仍未正式完成：

1. Apps Script API
2. 前端與 Google Sheet / Apps Script 的真實連接
3. 正式登入 session
4. 逐頁把 localStorage demo data 換成 API data

---

## Repo / 主要檔案

主要 repo：

```text
scoutsystem
```

重要檔案：

```text
app/
components/AuthGate.tsx
lib/troupeStore.ts
google-sheet-schema/Code.gs
google-sheet-schema/GOOGLE_SHEET_SCHEMA.md
google-sheet-schema/csv/*.csv
```

---

## 已完成前端路由

### 公開頁

```text
/
/login
/apply
/register -> redirect /apply?type=parent
/leader/apply -> redirect /apply?type=leader
/calendar
/library
/guide
/ui-map
```

### 需要登入頁

```text
/admin
/leader
/parent
/member
/activities
/library/import
/notices
/badges
/settings
```

---

## 目前身份設計

角色：

```text
super_admin
admin
group_leader
branch_leader
coach
parent
member
```

規則：

1. `super_admin` 不能前台申請，只能在 Google Sheet 初始化。
2. `super_admin` 可建立 `admin`。
3. `admin` 可管理所有支部。
4. `group_leader`, `branch_leader`, `coach` 統一進入領袖頁面。
5. 領袖只能管理相關支部資料。
6. 家長管理子女資料及回覆活動。
7. 成員查看自己資料、支部資料、活動；童軍支部成員可直接前往 DBS。

---

## Google Sheet 分類

### 系統性頁面

設定後可隱藏：

```text
SystemConfig
Roles
Branches
FieldSettings
```

### 資料性頁面

給管理員查看紀錄：

```text
Users
Applications
Members
ParentChildLinks
LibraryBookmarks
Notices
Events
EventReplies
Payments
Notifications
AuditLogs
```

---

## Apps Script 已有 helper

檔案：

```text
google-sheet-schema/Code.gs
```

已存在 functions：

```javascript
setupScoutSystemSheets()
organizeScoutSystemSheets()
showSystemSheets()
hideSystemSheets()
upgradeScoutSystemSchemaV02()
getSheet_(name)
readTable_(name)
appendRow_(name, obj)
auditLog_(userId, action, entity, entityId, beforeObj, afterObj)
```

注意：目前 `Code.gs` 仍主要是初始化 / schema helper，不是正式 API。

---

## Google Sheet schema v0.2 重點

### Members

成員資料已按 PT/03 報名表需要擴充：

```text
memberId
ymNumber
name
nameChinese
nameEnglish
branchId
section
groupName
district
region
rank
hkidMasked
appointmentNo
active
dateOfBirth
age
gender
phone
email
address
emergencyContactName
emergencyContactPhone
emergencyContactRelation
parentGuardianName
parentGuardianPhone
medicalNotes
allergyNotes
additionalInfo
school
className
createdAt
updatedAt
notes
```

設計重點：

1. 必須欄位仍是 `ymNumber`, `name`。
2. 其他欄位由 `FieldSettings` 控制是否啟用 / 必填。
3. `hkidMasked` 不建議一開始收完整身份證號碼。
4. `medicalNotes`, `allergyNotes` 是敏感資料，但活動安全有用，設為可選。
5. 成員頁日後可一鍵帶入 PT/03 報名表資料。

### Events

```text
eventId
title
scope
branchId
date
endDate
location
gatherTime
gatherLocation
dismissTime
dismissLocation
quota
fee
paymentRequired
paymentInstructions
description
source
sourceRefId
status
createdBy
createdAt
updatedAt
notes
```

### EventReplies

```text
replyId
eventId
memberId
parentUserId
status
note
respondedAt
responseByUserId
responseSource
updatedAt
```

`responseSource` 建議值：

```text
parent
leader_override
admin_override
system
```

### Payments

簡化付款狀態，不接付款平台：

```text
paymentId
eventId
memberId
parentUserId
amount
status
method
checkedBy
checkedAt
updatedAt
notes
```

`status` 建議值：

```text
unpaid
paid
not_required
```

---

## 圖書館接入設計

外部圖書館：

```text
https://scout-circulars.vercel.app/
```

ScoutSystem 的 `/library` 不顯示全港全部最新通告，而是顯示：

```text
領袖已按本旅需要標記的通告
```

外部圖書館作用：

```text
按日期顯示最新全港童軍通告
```

ScoutSystem 圖書館作用：

```text
按本旅需要、支部、對象、狀態整理已標記通告
```

接入方式：

1. 在 scout-circulars 每張通告加入「加入 ScoutSystem」按鈕。
2. 使用者先在 scout-circulars 設定自己的 ScoutSystem 網址。
3. 按鈕跳到：

```text
{ScoutSystem網址}/library/import?title=...&sourceSite=...&region=...&date=...&attachmentUrl=...&deadline=...&audience=...&fee=...
```

4. `/library/import` 需要領袖 / 後台登入。
5. 領袖確認後寫入 `LibraryBookmarks`。

目前 scout-circulars repo 已加入相關前端按鈕設計。

---

## 公開行事曆設計

頁面：

```text
/calendar
```

用途：

```text
純粹公開查看哪一天有活動
```

不處理：

```text
報名
付款
回覆
提醒
行政流程
```

第一版使用 ScoutSystem 內建行事曆，不先接 Google Calendar / Teamup。

未來可考慮：

1. Google Calendar：適合 Apps Script 同步及加入個人日曆。
2. Teamup：適合漂亮公開多分類行事曆。
3. 目前先以 ScoutSystem 內建日曆為主。

---

## 統一申請頁

頁面：

```text
/apply
```

取代：

```text
/register
/leader/apply
```

舊頁已 redirect：

```text
/register -> /apply?type=parent
/leader/apply -> /apply?type=leader
```

申請類型：

```text
家長帳戶
領袖 / 教練員帳戶
成員帳戶
```

目的：

1. 手機使用更簡單。
2. 前後台都統一使用 `Applications`。
3. 批核紀錄集中。

---

## 成員頁 PT/03 設計

頁面：

```text
/member
```

新增區塊：

```text
PT/03 報名表資料庫
```

目標：

```text
日後成員 / 家長只需維護一次個人資料，活動 / 訓練班報名時可一鍵帶入 PT/03 資料。
```

PT/03 來源：

```text
https://www.scout.org.hk/uploads/tc/forms/18537/pt03.pdf
```

後續建議：

1. Phase 1：保存 PT/03 需要資料。
2. Phase 2：活動報名時一鍵產生報名資料預覽。
3. Phase 3：產生 HTML / Print view。
4. Phase 4：如需要才研究 PDF 自動填表。

---

## DBS 專科徽章報考

簡化設計：

1. 不做複雜整合。
2. 只在 `/member` 中，童軍支部成員顯示：

```text
🎖️ 專科徽章報考 DBS
```

3. 按鈕直接跳轉：

```text
https://dbs-teal-iota.vercel.app/
```

條件：

```text
branch.section === '童軍'
```

---

## 活動 / 回覆 / 付款規則

已確認：

1. 活動一定要逐個成員回覆。
2. 由家長回覆。
3. 同一家長可以同頁處理多個子女，但仍要逐個子女選擇。
4. 領袖可以代家長修改回覆。
5. 付款暫時由領袖確認。
6. 不需要上傳付款證明。
7. 不接付款平台。
8. 團長 / 領袖可在活動名單用 tick 格快速標記已付款。
9. 不處理半費、豁免、多子女優惠。
10. 活動可以列印點名紙。

點名紙資料由前端組合：

```text
Events
EventReplies
Members
Payments
```

不需要新增 Attendance Sheet。

---

## 下一步建議：開始 Apps Script Part 1

下一個對話建議從這裡開始。

### Part 1：公開讀取 API

先做只讀 API，不涉及登入及私隱。

Apps Script actions：

```text
getPublicBootstrapData
getPublicCalendarItems
getPublicLibraryBookmarks
```

讀取：

```text
SystemConfig
Branches
Events
LibraryBookmarks
```

### Part 1 目的

1. 測試 Apps Script Web App 部署 URL。
2. 測試 Vercel 前端 fetch Apps Script。
3. 讓 `/calendar` 從 Sheet 讀公開活動。
4. 讓 `/library` 從 Sheet 讀本旅已標記通告。
5. 不碰登入、不碰密碼、不碰成員私隱。

---

## 之後 API 接入順序

### Part 2：登入

```text
login
validateSession
logout
```

Sheets：

```text
Users
AuditLogs
```

### Part 3：申請 / 批核

```text
submitApplication
listPendingApplications
approveApplication
rejectApplication
```

Sheets：

```text
Applications
Users
ParentChildLinks
AuditLogs
```

### Part 4：圖書館收藏

```text
upsertLibraryBookmark
listLibraryBookmarks
updateLibraryBookmark
```

Sheets：

```text
LibraryBookmarks
AuditLogs
```

### Part 5：成員 / 家長

```text
listMembers
createMember
updateMember
listParentChildren
linkParentChild
```

Sheets：

```text
Members
ParentChildLinks
Users
AuditLogs
```

### Part 6：活動 / 回覆 / 付款

```text
createEvent
publishEvent
listEvents
listEventReplies
submitEventReply
leaderOverrideReply
updatePaymentStatus
getEventAttendancePrintData
```

Sheets：

```text
Events
EventReplies
Payments
Members
ParentChildLinks
AuditLogs
```

---

## 下一個對話可直接使用的開場文字

```text
我們要開始 ScoutSystem Apps Script Part 1。

目前狀態：
- 前端 repo 是 scoutsystem
- Google Sheet 已用 google-sheet-schema/Code.gs 建好
- 已完成 schema v0.2
- 系統性頁面：SystemConfig, Roles, Branches, FieldSettings
- 資料性頁面：Users, Applications, Members, ParentChildLinks, LibraryBookmarks, Notices, Events, EventReplies, Payments, Notifications, AuditLogs
- 前端目前仍用 localStorage demo data

請先實作 Apps Script 公開讀取 API：
1. getPublicBootstrapData
2. getPublicCalendarItems
3. getPublicLibraryBookmarks

要求：
- 先只讀資料，不做登入
- 不讀 Members / Users / Payments 等私隱資料
- 回傳 JSON
- 支援 doGet / doPost action
- 前端先接 /calendar 和 /library
```

---

## 注意事項

1. 不要一次接全部功能。
2. 先從公開讀取 API 開始。
3. 不要讓領袖直接處理 Google Sheet。
4. 前端應逐頁由 localStorage 換成 Apps Script API。
5. 所有寫入操作之後都要寫 `AuditLogs`。
6. `super_admin` 只由 Sheet 初始化，不可前台申請。
7. `Branches`, `Roles`, `FieldSettings`, `SystemConfig` 是系統性頁面，可隱藏。
8. 成員資料未來要支援 PT/03 一鍵報名資料帶入。
9. DBS 報考只保留成員頁直接跳轉。
10. 行事曆是公開查看用途，不處理行政流程。
