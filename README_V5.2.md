# ScoutSystem V5.2 完整修復同步包

## ⚠️ 重要更新說明
這個版本修正了 V5.1 中過度簡化導致功能缺失的問題。
1. **Code.gs**: 恢復了原本 1445 行的所有功能（包括申請管理、圖書館、通告等），並額外注入了報名連通的新 API。
2. **連通性**: 現在「報名」與「行事曆」已完成數據閉環。

## 部署步驟
1. **Google Apps Script**: 
   - 使用 `v5.2/Code.gs` 替換現有代碼。
   - 請檢查檔案末尾的 `handleRequest_` 是否包含 `getPersonalizedCalendar` 等新 case。
2. **前端**: 覆蓋 `lib/` 與 `components/` 目錄。
