# ScoutSystem V5.1 同步說明

## 更新內容
1. **GS 核心 (Code.gs)**:
   - 支援 `getEventLeaderReport` (領袖名單報表)
   - 支援 `getPersonalizedCalendar` (個人化行事曆標籤)
   - 支援 `targetId` 邏輯，區分報名者與操作者（家長代報名）
   - 強度強化：JSON 輸出防 CORS 報錯

2. **前端 API (lib/api.ts)**:
   - 增加對應 GS 新 Action 的封裝

3. **名單管理組件 (components/EventRegistrationManager.tsx)**:
   - 領袖專用，顯示已報名/未填寫名單，支持標記付款與匯出 CSV

4. **報名按鈕組件 (components/EventReplyButton.tsx)**:
   - 支援家長選取子女報名
   - 支援 18 歲年齡判斷

## 部署步驟
1. **Google Apps Script**:
   - 開啟 Apps Script 編輯器，將 `Code.gs` 內容全選替換，點擊「部署」->「管理部署」->「編輯」->「新增版本」並部署。
2. **GitHub/Local**:
   - 將 `lib/` 與 `components/` 目錄下的檔案覆蓋至你的專案對應位置。
   - 在需要的地方引入 `EventRegistrationManager` 與 `EventReplyButton`。
