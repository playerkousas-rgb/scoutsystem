/**
 * 旅團系統 Portal API 對接
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
  // 獲取轉駁器市集清單
  getMarketRegistry: async () => {
    const res = await fetch(ROUTER_URL);
    return res.json();
  },

  // 安裝插件到本地 GS
  installPlugin: (plugin: any) => callGS('installTroopPlugin', { plugin }),

  // 獲取本地已安裝卡片
  getLocalCards: () => callGS('getTroopActiveCards'),

  // 獲取旅團基本資訊 (如旅團名稱)
  getTroopInfo: () => callGS('getTroopBasicInfo'),
  
  // 原有功能...
  login: (id: string, pw: string) => callGS('login', { identifier: id, password: pw }),
};
