/**
 * ScoutSystem - 終極 API 轉駁器 (V11.6 - 包含所有連通功能)
 */

// 請根據你的實際部署網址調整
const GS_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
const ROUTER_URL = 'https://troop-router.vercel.app/api/registry';

export async function callGS(action: string, payload: any = {}) {
  const response = await fetch(`${GS_URL}?action=${action}`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, action }),
  });
  return response.json();
}

export const api = {
  // --- 1. 帳號與基礎 ---
  login: (id: string, pw: string) => callGS('login', { identifier: id, password: pw }),
  getTroopInfo: () => callGS('getTroopBasicInfo'),
  getBootstrap: () => callGS('getPublicBootstrapData'),

  // --- 2. 活動與報名系統 (核心連通) ---
  getCalendar: (userId: string) => callGS('getPersonalizedCalendar', { userId }),
  getDashboardData: (payload: any) => callGS('getDashboardData', payload),
  setEventReply: (payload: any) => callGS('setEventReply', payload),
  
  // 修正：補回 EventRegistrationManager 需要的 getEventReport
  getEventReport: (eventId: string, branchId?: string) => 
    callGS('getEventLeaderReport', { eventId, branchId }),
  
  setReplyPaid: (payload: any) => callGS('setReplyPaid', payload),

  // --- 3. 轉駁器與市集 ---
  getMarketRegistry: async () => {
    const res = await fetch(ROUTER_URL);
    return res.json();
  },
  installPlugin: (plugin: any) => callGS('installTroopPlugin', { plugin }),
  getLocalCards: () => callGS('getTroopActiveCards'),

  // --- 4. 申請管理 (審核功能) ---
  getApplications: (payload: any) => callGS('getApplications', payload),
  approveApplication: (payload: any) => callGS('approveApplication', payload),
  rejectApplication: (payload: any) => callGS('rejectApplication', payload),

  // --- 5. 通用 CRUD (表格編輯) ---
  getTableData: (table: string) => callGS('getTableData', { table }),
  addRow: (table: string, data: any) => callGS('addRow', { table, data }),
  updateRow: (table: string, id: string, data: any) => callGS('updateRow', { table, id, data }),
  deleteRow: (table: string, id: string) => callGS('deleteRow', { table, id }),
};
