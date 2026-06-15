/**
 * ScoutSystem - 旅團/區註冊中心
 * 這裡決定了前端指向哪一個後端 GS
 */

export interface DistrictConfig {
  code: string;
  name: string;
  apiBase: string;
  status: 'live' | 'disabled' | 'maintenance';
  note?: string;
  maintenanceMessage?: string;
}

export const DISTRICTS: Record<string, DistrictConfig> = {
  SKW: {
    code: 'SKW',
    name: '筲箕灣區',
    apiBase: 'https://script.google.com/macros/s/AKfycby9YxshCODYJKymkCD6IuiMiKHswQDySswQPsDC36SLN55XQEdtn_Ik_ja1ES_g7l0/exec',
    status: 'live',
    note: '首個已接入及實際使用區。',
  },
  // 範例：日後新增區
  // CHW: {
  //   code: 'CHW',
  //   name: '柴灣區',
  //   apiBase: 'https://script.google.com/macros/s/.../exec',
  //   status: 'disabled',
  //   note: '暫停服務中。',
  //   maintenanceMessage: '此區目前暫停使用本平台。如有需要，請自行另行構建或聯絡平台管理員。',
  // },
};

// 預設使用的區 (可以從環境變數或網址決定)
export const DEFAULT_DISTRICT = 'SKW';

export const getCurrentDistrict = () => {
  // 這裡未來可以改為根據網址或是 localStorage 切換
  return DISTRICTS[DEFAULT_DISTRICT];
};
