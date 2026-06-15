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
    if (!url) return { success: false, error: "未選旅團" };
    const response = await fetch(`${url}?action=${action}`, { method: 'POST', body: JSON.stringify({ ...payload, action }) });
    return response.json();
  },
  login: (id: string, pw: string) => api.callGS('login', { identifier: id, password: pw }),
  getTroopBasicInfo: () => api.callGS('getTroopBasicInfo'),
  getTroopInfo: () => api.callGS('getTroopBasicInfo'),
  getPersonalizedCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }),
  getCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }),
  getDashboardData: (payload: any) => api.callGS('getDashboardData', payload),
  setEventReply: (payload: any) => api.callGS('setEventReply', payload),
  getEventLeaderReport: (eventId: string, branchId?: string) => api.callGS('getEventLeaderReport', { eventId, branchId }),
  getEventReport: (eventId: string, branchId?: string) => api.callGS('getEventLeaderReport', { eventId, branchId }),
  getMarketRegistry: () => fetch('https://troop-router.vercel.app/api/registry').then(res => res.json()),
  installTroopPlugin: (plugin: any) => api.callGS('installTroopPlugin', { plugin }),
  installPlugin: (p: any) => api.callGS('installTroopPlugin', { plugin: p }),
  getTroopActiveCards: () => api.callGS('getTroopActiveCards'),
  getApplications: (payload: any) => api.callGS('getApplications', payload),
  approveApplication: (payload: any) => api.callGS('approveApplication', payload),
  rejectApplication: (payload: any) => api.callGS('rejectApplication', payload),
  getTableData: (table: string) => api.callGS('getTableData', { table }),
  addRow: (table: string, data: any) => api.callGS('addRow', { table, data }),
  updateRow: (table: string, id: string, data: any) => api.callGS('updateRow', { table, id, data }),
  deleteRow: (table: string, id: string) => api.callGS('deleteRow', { table, id }),
};
