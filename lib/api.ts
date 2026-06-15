import { TROOP_REGISTRY } from './troops';

const ROUTER_URL = 'https://troop-router.vercel.app/api/registry';

export const api = {
  // 動態獲取當前旅團的 GS URL (從 localStorage 讀取)
  getGsUrl: () => {
    if (typeof window !== 'undefined') {
      const troopId = localStorage.getItem('current_troop_id') || 'SKW_999';
      return TROOP_REGISTRY[troopId]?.apiBase || '';
    }
    return '';
  },

  async callGS(action: string, payload: any = {}) {
    const url = this.getGsUrl();
    const response = await fetch(`${url}?action=${action}`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, action }),
    });
    return response.json();
  },

  getMarketRegistry: () => fetch(ROUTER_URL).then(res => res.json()),
  installPlugin: (plugin: any) => api.callGS('installTroopPlugin', { plugin }),
  getLocalCards: () => api.callGS('getTroopActiveCards'),
  login: (id: string, pw: string) => api.callGS('login', { identifier: id, password: pw }),
  getDashboardData: (payload: any) => api.callGS('getDashboardData', payload),
  getCalendar: (userId: string) => api.callGS('getPersonalizedCalendar', { userId }),
  setEventReply: (payload: any) => api.callGS('setEventReply', payload),
};
