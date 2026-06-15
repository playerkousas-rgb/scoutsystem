import { TROOP_REGISTRY } from './troops';

const ROUTER_URL = 'https://troop-router.vercel.app/api/registry';

export const api = {
  // 基礎工具
  getGsUrl: () => {
    if (typeof window !== 'undefined') {
      const troopId = localStorage.getItem('current_troop_id') || 'SKW_999';
      return TROOP_REGISTRY[troopId]?.apiBase || '';
    }
    return '';
  },

  async callGS(action: string, payload: any = {}) {
    const url = this.getGsUrl();
    if (!url) return { success: false, error: "未選擇旅團" };
    const response = await fetch(`${url}?action=${action}`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, action }),
    });
    return response.json();
  },

  // 1. 帳號與權限
  login: (id: string, pw: string) => api.callGS('login', { identifier: id, password: pw }),
  getTroopBasicInfo: () => api.callGS('getTroopBasicInfo'),
  getTroopInfo: () => api.callGS('getTroopBasicInfo'), // 別名相容
  getBootstrap: () => api.callGS('getPublicBootstrapData'),

  // 2. 活動與報名核心 (修正：補回 setEventReply 與所有報錯函數)
  getPersonalizedCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }),
  getCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }), // 別名
  setEventReply: (payload: any) => api.callGS('setEventReply', payload),
  getEventLeaderReport: (eventId: string, branchId?: string) => api.callGS('getEventLeaderReport', { eventId, branchId }),
  getEventReport: (eventId: string, branchId?: string) => api.callGS('getEventLeaderReport', { eventId, branchId }), // 別名
  getDashboardData: (payload: any) => api.callGS('getDashboardData', payload),

  // 3. 市集與外掛
  getMarketRegistry: () => fetch(ROUTER_URL).then(res => res.json()),
  installTroopPlugin: (plugin: any) => api.callGS('installTroopPlugin', { plugin }),
  installPlugin: (plugin: any) => api.callGS('installTroopPlugin', { plugin }), // 別名
  getTroopActiveCards: () => api.callGS('getTroopActiveCards'),
  getTroopCards: () => api.callGS('getTroopActiveCards'), // 別名

  // 4. 行政審核
  getApplications: (payload: any) => api.callGS('getApplications', payload),
  approveApplication: (payload: any) => api.callGS('approveApplication', payload),
  rejectApplication: (payload: any) => api.callGS('rejectApplication', payload),

  // 5. 通用 CRUD (表格編輯)
  getTableData: (table: string) => api.callGS('getTableData', { table }),
  addRow: (table: string, data: any) => api.callGS('addRow', { table, data }),
  updateRow: (table: string, id: string, data: any) => api.callGS('updateRow', { table, id, data }),
  deleteRow: (table: string, id: string) => api.callGS('deleteRow', { table, id }),
};
