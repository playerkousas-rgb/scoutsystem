const GS_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export async function callGS(action: string, payload: any = {}) {
  const response = await fetch(`${GS_URL}?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

export const api = {
  // 登入與基礎
  login: (identifier: string, password: string) => callGS('login', { identifier, password }),
  getBootstrap: () => callGS('getPublicBootstrapData'),
  
  // 活動與報名
  getCalendar: (userId: string) => callGS('getPersonalizedCalendar', { userId }),
  setEventReply: (data: { eventId: string, targetId: string, userId: string, type: string, paid?: boolean }) => 
    callGS('setEventReply', data),
  
  // 領袖報表
  getEventReport: (eventId: string, branchId?: string) => 
    callGS('getEventLeaderReport', { eventId, branchId }),

  // 圖書館
  getLibrary: () => callGS('getPublicLibraryBookmarks'),
  
  // 通用 CRUD
  getTable: (table: string) => callGS('getTableData', { table }),
};
