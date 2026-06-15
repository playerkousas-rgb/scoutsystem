# ScoutSystem V3.3 更新說明

> 本次更新解決 6 個問題。分為兩部分：**Apps Script（後端）** 與 **Next.js 前端**。

---

## ✅ 已修正問題對照

| # | 問題 | 修正方式 |
|---|------|----------|
| 1 | 家長審核／申請管理不能批核 | 新建 `ApplicationManagement` 元件，有 **批核 / 拒絕** 按鈕 |
| 2 | 待處理申請顯示 0 | 後端改用 **大小寫不敏感** 讀取 status 欄位（`getFieldCI_`），解決 Sheet 欄位 `Status` vs `status` 不一致 |
| 3 | 控制台卡片名稱只有「家長審核」 | 改為「**家長審核 / 申請管理**」 |
| 4 | 使用者管理看到超管資料 | 非超管**自動隱藏 super_admin 列**與密碼欄位 |
| 5 | 註冊要有密碼 + 私隱彈窗 | 新增 `PrivacyConsent` 彈窗（無敏感資料／僅系統用／存於 Google Drive）；申請頁加入密碼欄 |
| 6 | 支部管理等不能編輯刪除 | `AdminTableView` 全面支援 **新增 / 編輯 / 刪除**，後端新增通用 CRUD（`addRow` / `updateRow` / `deleteRow`） |

---

## 📦 第一部分：Apps Script（後端）

### 檔案
- **`apps-script/Code.gs`**（V3.3）

### 如何同步到你的 Google Sheet
1. 開啟你的 Google Sheet → 「擴充功能」→「Apps Script」
2. **全選刪除**舊有程式碼
3. 打開本workspace 的 `apps-script/Code.gs`，**全部複製貼上**
4. 按 💾 儲存（Ctrl+S）
5. 「部署」→「管理部署」→ 選擇現有部署 →「鉛筆編輯」→ 版本選「**新版本**」→ 部署
   - ⚠️ 務必選「新版本」，否則更改不會生效
   - 存取權限維持「任何人」

### 新增的 API action（已自動註冊在 dispatcher）
| action | 用途 |
|--------|------|
| `getApplications` | 取得申請列表（可帶 `status` 過濾） |
| `rejectApplication` | 拒絕申請 |
| `addRow` | 通用新增（`table`, `idColumn`, `idPrefix`, `fields`） |
| `updateRow` | 通用更新（`table`, `id`, `idColumn`, `fields`） |
| `deleteRow` | 通用刪除（`table`, `id`, `idColumn`） |

### ⚠️ 關於「待處理申請顯示 0」的根本原因
舊版用 `a.status`（全小寫）讀取，若你的 Applications 試算表欄位名是 `Status`、`STATUS` 或 `狀態`，就會讀不到 → 計數永遠 0。
新版改用 `getFieldCI_()`（case-insensitive），無論大小寫都能正確讀取。

**建議同時檢查你的 Applications 試算表：**
- 第一列（標題列）欄位名應為：`applicationId, applicantType, requestedRole, name, email, phone, branchId, ymNumbers, childNames, passwordHash, password, status, approvedBy, approvedAt, createdAt, notes`
- `status` 欄的值應為 `pending` / `approved` / `rejected`

### 🔒 關於 Google Sheet 完全開放的資安建議
你提到 Sheet 目前「完全開放」。建議：
1. Apps Script 部署設為「**任何人**」即可（前端透過 web app URL 存取，**不需要**把試算表設為公開）
2. **試算表共用權限收回為「限制」**，只允許你的 Google 帳戶
3. Apps Script 以「**我**」身份執行（這樣只有你的帳號能讀寫試算表）
4. 這樣家長經由系統存取，但不會直接看到試算表原始連結的資料

---

## 🖥️ 第二部分：Next.js 前端

### 修改的檔案
| 檔案 | 變更 |
|------|------|
| `components/AdminTableView.tsx` | 重寫：支援搜尋、新增、編輯（Modal）、刪除、隱藏密碼、隱藏超管 |
| `components/ApplicationManagement.tsx` | **新增**：家長審核／申請管理專屬頁面（批核／拒絕／篩選／詳情） |
| `components/PrivacyConsent.tsx` | **新增**：私隱聲明彈窗（可重用） |
| `app/admin/page.tsx` | 卡片改名、待審批數字可點擊跳轉 |
| `app/admin/parents/page.tsx` | 改用 `ApplicationManagement` |
| `app/admin/branches/page.tsx` | 加說明（現可編輯刪除） |
| `app/admin/members/page.tsx` | 加說明 |
| `app/admin/events/page.tsx` | 加說明 |
| `app/register/page.tsx` | 加私隱彈窗 |
| `app/apply/page.tsx` | 加私隱彈窗 + 密碼欄 |

### 如何部署前端
1. `git add -A && git commit -m "V3.3: 審核功能、通用CRUD、私隱彈窗"`
2. `git push origin main`
3. Vercel 會自動部署；或手動 `npm run build` 後部署

---

## 🧪 部署後測試清單
- [ ] 管理員登入 → 控制台 → 待審批數字是否正確（不再是 0）
- [ ] 點「家長審核 / 申請管理」→ 能看到申請、能**批核**、能**拒絕**
- [ ] 控制台卡片顯示「家長審核 / 申請管理」
- [ ] 用 admin（非超管）登入 → 使用者管理 → **看不到 super_admin 列**
- [ ] 用 super_admin 登入 → 使用者管理 → 看得到所有列
- [ ] 註冊頁 → 填表 → 按提交 → **彈出私隱聲明** → 同意後才送出
- [ ] 支部管理 → 能**新增、編輯、刪除**支部
- [ ] 成員／活動頁 → 同樣能新增、編輯、刪除
