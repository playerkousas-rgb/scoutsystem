import { TROOP_REGISTRY } from './troops';
export const api = {
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
    const response = await fetch(`${url}?action=${action}`, { method: 'POST', body: JSON.stringify({ ...payload, action }) });
    return response.json();
  },
  login: (id: string, pw: string) => api.callGS('login', { identifier: id, password: pw }),
  getTroopInfo: () => api.callGS('getTroopBasicInfo'),
  getCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }),
  getDashboardData: (payload: any) => api.callGS('getDashboardData', payload),
  setEventReply: (payload: any) => api.callGS('setEventReply', payload),
  getEventReport: (eventId: string, branchId?: string) => api.callGS('getEventLeaderReport', { eventId, branchId }),
  getMarketRegistry: () => fetch('https://troop-router.vercel.app/api/registry').then(res => res.json()),
  installPlugin: (plugin: any) => api.callGS('installTroopPlugin', { plugin }),
  getTroopCards: () => api.callGS('getTroopActiveCards'),
  getApplications: (payload: any) => api.callGS('getApplications', payload),
  getTableData: (table: string) => api.callGS('getTableData', { table }),
  addRow: (table: string, data: any) => api.callGS('addRow', { table, data }),
  updateRow: (table: string, id: string, data: any) => api.callGS('updateRow', { table, id, data }),
  deleteRow: (table: string, id: string) => api.callGS('deleteRow', { table, id }),
};
