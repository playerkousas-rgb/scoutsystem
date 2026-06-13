// ScoutSystem API Client - Direct fetch to Google Apps Script

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  timestamp?: string;
};

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
