# ScoutSystem 開發進度文件

> **最後更新：2026-06-14 V4.1**
> **用途：新對話接續用，包含所有已完成功能、架構、已知問題、下一步**

---

## 📋 系統概覽

- **前端**：Next.js 14（部署在 Vercel）→ https://scoutsystem.vercel.app/
- **後端**：Google Apps Script + Google Sheet（Google Drive）
- **GS URL**：`https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec`
- **GitHub**：https://github.com/playerkousas-rgb/scoutsystem.git
- **Google Sheet**：`1Pbz6rtrbxiiu7c0MM7Y7FvLa6M35rrjaFGQltxRdjtM`

---

## ✅ 已完成功能

### 1. 登入系統（完善）
- 雙軌登入：**領袖及家長登入**（電郵）/ **成員登入**（YMIS 編號）
- 所有人都需要密碼
- 登入後整頁刷新（`window.location.href`），NavBar 用 `usePathname` 即時更新
- **後門帳號**：`sheep` / `0728`（隱藏的超級管理員，最高權限）
- **系統鎖**：sheep 可鎖定整個系統（除 sheep 外所有人無法登入）

### 2. 申請管理
- 統一申請頁（`/apply`）：家長、領袖、成員、管理員
- 成員用 YMIS 登入，電郵選填
- 成員新增：出生日期、性別、小隊、職級
- 支部直接存中文名稱（小童軍支部 / 幁童軍支部等）
- 私隱聲明彈窗（PrivacyConsent）
- 審批 Modal：批核/拒絕分開按鈕，需 confirm 確認
- 控制台只有純展示預覽（無誤觸按鈕）

### 3. 用戶角色與權限
| 角色 | 登入方式 | 權限 |
|------|----------|------|
| super_admin | 電郵 | 全部 + 系統鎖 |
| admin | 電郵 | 全部管理 |
| group_leader（團長） | 電郵 | 自己支部活動/成員/審批 |
| branch_leader（支部領袖） | 電郵 | 自己支部活動/成員/審批/通告 |
| coach（教練員） | 電郵 | 自己支部活動/成員（不能審批） |
| parent（家長） | 電郵 | 子女資料、報名 |
| member（成員） | YMIS | 個人資料、有興趣標記 |

### 4. 成員 ↔ 家長連結
- 家長審批時：Users 表寫入 `childYmNumbers`
- 成員審批時：反向搜尋家長，自動設定 Members 表的 `parentUserId`
- 成員登入時：`getDashboardData` 帶出緊急聯絡人（家長姓名+電話）
- 年齡自動計算

### 5. 報名系統（V4.1 新增 — 後端持久化）
- **EventReplies 工作表**：資料存 Google Sheet，換裝置不消失
- 成員/家長按 ❤️ = 有興趣（`type=interested`）
- 家長/成員按 💰 = 已報名（`type=registered`）
- **領袖/管理員**：活動頁可展開「報名名單」→ 看有興趣+已報名、標記付費、取消報名
- **管理員/超管**：能看到所有支部的所有報名
- 成員/家長控制台顯示自己的報名活動

### 6. 通告系統（Announcements）
- 支部領袖按 = 發給自己支部成員+家長
- 管理員按 = 發給全旅
- 用戶登入後橫幅彈出未讀通告（輪詢方案）
- 可點 ✕ 關閉（sessionStorage 記錄）

### 7. 通用 CRUD
- 任何資料表都能新增/編輯/刪除（AdminTableView）
- 搜尋、Modal 編輯
- 使用者管理：非超管隱藏 super_admin 列、密碼欄位隱藏

### 8. 支部名稱中文化
- 所有頁面統一顯示「XX支部」（小童軍支部、幼童軍支部等）
- 舊資料 b1-b5 自動轉換

---

## 🗂️ Google Sheet 工作表結構

| 工作表 | 用途 | 主要欄位 |
|--------|------|----------|
| Users | 帳號 | userId, name, email, phone, role, branchId, passwordHash, ymNumber, childYmNumbers, active, approved |
| Members | 成員 | id, ymNumber, name, branchId, phone, email, dateOfBirth, gender, patrol, rank, parentUserId, active |
| Applications | 申請 | applicationId, applicantType, requestedRole, name, email, phone, branchId, ymNumbers, childNames, dateOfBirth, gender, patrol, rank, passwordHash, status |
| Events | 活動 | eventId, title, date, scope, branchId, location, quota, fee, description, status |
| EventReplies | 報名（V4.1） | replyId, eventId, userId, userName, role, branchId, type, paid, cancelled |
| Announcements | 通告 | announcementId, senderId, senderName, title, message, scope, branchId, status |
| LibraryBookmarks | 圖書館 | bookmarkId, title, circularKey, sourceUrl, attachmentUrl, status |
| SystemConfig | 系統設定 | key, value（含 `system_locked`） |
| Branches | 支部 | branchId, name, shortName, section |
| FieldSettings | 欄位設定 | key, label, required, enabled |
| Notifications | 通知 | parentUserId, eventId, memberId, status |

---

## 📁 前端檔案結構（重點）

```
app/
├── layout.tsx              # NavBar + AnnouncementBanner + usePathname
├── login/page.tsx          # 雙軌登入（領袖及家長 / 成員）
├── apply/page.tsx          # 統一申請頁
├── admin/page.tsx          # 管理員控制台 + SystemLockPanel
├── admin/parents/page.tsx  # 申請管理（團長+支部領袖+管理員可進）
├── admin/members/page.tsx  # 成員資料（領袖+教練+管理員可進）
├── admin/events/page.tsx   # 活動管理
├── leader/page.tsx         # 領袖控制台 + AnnouncementManager
├── member/page.tsx         # 成員控制台
├── parent/page.tsx         # 家長控制台
├── activities/page.tsx     # 公開活動 + EventReplyButton

components/
├── AuthGate.tsx            # 登入權限檢查
├── ApplicationManagement.tsx # 審批 Modal
├── AdminTableView.tsx      # 通用 CRUD 表格
├── AnnouncementBanner.tsx  # 通告橫幅
├── AnnouncementManager.tsx # 發送通告
├── SystemLockPanel.tsx     # 系統鎖（僅 sheep 可見）
├── EventReplyButton.tsx    # 報名按鈕 + 名單
├── useEventReplies.ts      # 報名 Hook
├── PrivacyConsent.tsx      # 私隱聲明

lib/
├── branches.ts             # 支部名稱對照
├── troupeStore.ts          # mock data（已棄用，AuthGate 不再依賴）
├── api.ts                  # API client（部分頁面用）
```

---

## 📌 已知問題 / 待改善

1. **報名名單刷新**：領袖標記付費/取消後需手動刷新
2. **即時性**：通告和報名非即時（輪詢方案，需刷新頁面）
3. **行事曆**：已連接真實 Events 表，非 mock
4. **管理者一直用舊版**：需確認每次部署 GS 新版本
5. **舊資料 b1-b5**：branchName() 能自動轉換，但建議逐步更新為中文名稱

---

## 🚀 部署步驟（給用戶的）

### GS 部署
1. Google Sheet → 擴充功能 → Apps Script
2. 全選刪除 → 貼上 Code.gs → Ctrl+S
3. 部署 → 管理部署 → 編輯 → **版本選「新增版本」** → 部署

### 前端部署
```bash
git add -A && git commit -m "版本說明" && git push
```
Vercel 自動部署

---

## 🔑 重要憑證

- **後門帳號**：sheep / 0728
- **後門 email**：skwddbs@gmail.com / 0728
- **系統鎖密碼**：0728

---

## 📊 GS API 完整列表

| Action | 用途 |
|--------|------|
| ping | 測試連線 |
| login | 登入（含後門+系統鎖檢查） |
| registerParent | 家長註冊 |
| applyLeader | 領袖/成員/管理員申請 |
| getDashboardData | 控制台資料（含家長連結） |
| getTableData | 讀取任意表 |
| addRow / updateRow / deleteRow | 通用 CRUD |
| approveApplication / rejectApplication | 審批 |
| getApplications / getPendingApplications | 申請列表 |
| addAnnouncement / getAnnouncements / deleteAnnouncement | 通告 |
| toggleSystemLock / getSystemStatus | 系統鎖 |
| setEventReply / cancelEventReply / getEventReplies / setReplyPaid | 報名 |
| getPublicCalendarItems / getPublicLibraryBookmarks | 公開活動 |
| addLibraryBookmark / updateLibraryBookmark / deleteLibraryBookmark | 圖書館 |
| fixApplicationsSheet | 維修工具（修復欄位錯位） |
