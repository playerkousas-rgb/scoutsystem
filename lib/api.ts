import { TROOP_REGISTRY } from './troops';
export const api = {
  getGsUrl: () => {
    if (typeof window !== 'undefined') {
      const troopId = localStorage.getItem('current_troop_id');
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
  getTroopInfo: () => api.callGS('getTroopBasicInfo'),
  getTroopActiveCards: () => api.callGS('getTroopActiveCards'),
  installTroopPlugin: (plugin: any) => api.callGS('installTroopPlugin', { plugin }),
  getCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }),
  getDashboardData: (payload: any) => api.callGS('getDashboardData', payload),
};
