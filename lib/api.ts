// ScoutSystem API Client - V5.0 報名系統

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  timestamp?: string;
};

// ---------- Helper ----------

function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return p;
    }
  } catch {}
  return null;
}

// ---------- 公開讀取 API ----------

export function fetchPublicBootstrap() {
  return fetch(`${APPS_SCRIPT_URL}?action=getPublicBootstrapData`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message } as APIResponse<any>));
}

export function fetchPublicCalendarItems() {
  return fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message } as APIResponse<any>));
}

export function fetchPublicLibraryBookmarks() {
  return fetch(`${APPS_SCRIPT_URL}?action=getPublicLibraryBookmarks`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message } as APIResponse<any>));
}

// ---------- 登入 API ----------

export function login(email: string, password: string) {
  const url = `${APPS_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  return fetch(url, { method: 'GET', cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

// ---------- 報名 API (V5.0) ----------

/** 成員按 ❤️ 有興趣 */
export function setInterested(eventId: string, memberId: string) {
  const user = getUser();
  const params = new URLSearchParams({
    action: 'setEventReply',
    eventId,
    memberId,
    userId: user?.userId || '',
    type: 'interested',
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 家長按 ✅ 已報名（代子女） */
export function setRegistered(eventId: string, memberId: string, parentUserId: string) {
  const params = new URLSearchParams({
    action: 'setEventReply',
    eventId,
    memberId,
    userId: parentUserId,
    parentUserId,
    type: 'registered',
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 家長按 ❌ 不參加 */
export function setDeclined(eventId: string, memberId: string, parentUserId: string) {
  const params = new URLSearchParams({
    action: 'setEventReply',
    eventId,
    memberId,
    userId: parentUserId,
    parentUserId,
    type: 'declined',
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 成員 18+ 自行報名 */
export function setRegisteredSelf(eventId: string, memberId: string) {
  const user = getUser();
  const params = new URLSearchParams({
    action: 'setEventReply',
    eventId,
    memberId,
    userId: user?.userId || '',
    type: 'registered',
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 取消報名 */
export function cancelEventReply(eventId: string, memberId: string) {
  const params = new URLSearchParams({
    action: 'cancelEventReply',
    eventId,
    memberId,
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 取得報名紀錄 — 依活動 */
export function getEventRepliesByEvent(eventId: string, userId?: string) {
  const params = new URLSearchParams({
    action: 'getEventReplies',
    eventId,
    ...(userId ? { userId } : {}),
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 取得報名紀錄 — 依成員（成員自己用） */
export function getEventRepliesByMember(memberId: string) {
  const params = new URLSearchParams({
    action: 'getEventReplies',
    memberId,
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 取得報名紀錄 — 依多個成員（家長查子女） */
export function getEventRepliesByMembers(memberIds: string[]) {
  const params = new URLSearchParams({
    action: 'getEventReplies',
    memberIds: memberIds.join(','),
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 活動報名摘要（領袖用） */
export function getEventRegistrationSummary(eventId: string, userId: string) {
  const params = new URLSearchParams({
    action: 'getEventRegistrationSummary',
    eventId,
    userId,
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 標記已付費 */
export function setReplyPaid(eventId: string, memberId: string, paid: boolean) {
  const params = new URLSearchParams({
    action: 'setReplyPaid',
    eventId,
    memberId,
    paid: String(paid),
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}

/** 取得 Dashboard 資料 */
export function getDashboardData(userId: string) {
  const params = new URLSearchParams({
    action: 'getDashboardData',
    userId,
  });
  return fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' })
    .then(r => r.json())
    .catch(err => ({ success: false, error: err.message }));
}
