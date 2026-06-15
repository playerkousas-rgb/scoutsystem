/**
 * ScoutSystem - 核心 API 轉駁器 (V11.7 完整版)
 */

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
  // --- 帳號與權限 ---
  login: (id: string, pw: string) => callGS('login', { identifier: id, password: pw }),
  getTroopInfo: () => callGS('getTroopBasicInfo'),
  getBootstrap: () => callGS('getPublicBootstrapData'),

  // --- 活動與報名核心 ---
  getCalendar: (userId: string) => callGS('getPersonalizedCalendar', { userId }),
  getDashboardData: (payload: any) => callGS('getDashboardData', payload),
  setEventReply: (payload: any) => callGS('setEventReply', payload),
  getEventReport: (eventId: string, branchId?: string) => callGS('getEventLeaderReport', { eventId, branchId }),
  setReplyPaid: (payload: any) => callGS('setReplyPaid', payload),

  // --- 轉駁器市集 ---
  getMarketRegistry: async () => {
    const res = await fetch(ROUTER_URL);
    return res.json();
  },
  installPlugin: (plugin: any) => callGS('installTroopPlugin', { plugin }),
  getLocalCards: () => callGS('getTroopActiveCards'),

  // --- 審批管理 ---
  getApplications: (payload: any) => callGS('getApplications', payload),
  approveApplication: (payload: any) => callGS('approveApplication', payload),
  rejectApplication: (payload: any) => callGS('rejectApplication', payload),

  // --- 通用 CRUD ---
  getTableData: (table: string) => callGS('getTableData', { table }),
  addRow: (table: string, data: any) => callGS('addRow', { table, data }),
  updateRow: (table: string, id: string, data: any) => callGS('updateRow', { table, id, data }),
  deleteRow: (table: string, id: string) => callGS('deleteRow', { table, id }),
};
