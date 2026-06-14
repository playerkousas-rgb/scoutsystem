'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

function getUser() {
  const u = getCurrentUser();
  if (u) return u;
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return p;
    }
  } catch {}
  return null;
}

function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) {
      if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key];
    }
  }
  return '';
}

const SEEN_KEY = 'scout-seen-announcements';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(SEEN_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });
  const user = getUser();

  useEffect(() => {
    if (!user) return;
    fetch(`${APPS_SCRIPT_URL}?action=getAnnouncements&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setAnnouncements(d.data || []);
      })
      .catch(() => {});
  }, [user]);

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try { sessionStorage.setItem(SEEN_KEY, JSON.stringify([...next])); } catch {}
  };

  const visible = announcements.filter(a => !dismissed.has(val(a, 'announcementId')));
  if (!visible.length) return null;

  return (
    <div className="stack" style={{ gap: 8, marginBottom: 8 }}>
      {visible.map(a => {
        const id = val(a, 'announcementId');
        const scope = val(a, 'scope');
        return (
          <div
            key={id}
            style={{
              border: scope === 'troop' ? '2px solid #f59e0b' : '2px solid #3b82f6',
              borderRadius: 12,
              padding: '14px 16px',
              background: scope === 'troop' ? '#fffbeb' : '#eff6ff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>
                  {scope === 'troop' ? '📢' : '📣'}
                </span>
                <strong style={{ fontSize: 16 }}>{val(a, 'title')}</strong>
                <span style={{
                  fontSize: 11, padding: '1px 8px', borderRadius: 999,
                  background: scope === 'troop' ? '#f59e0b' : '#3b82f6',
                  color: '#fff', fontWeight: 600,
                }}>
                  {scope === 'troop' ? '全旅' : '支部'}
                </span>
                <span style={{ fontSize: 12, color: '#888' }}>{val(a, 'senderName')}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#333' }}>
                {val(a, 'message')}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>{val(a, 'createdAt')}</p>
            </div>
            <button
              onClick={() => dismiss(id)}
              style={{
                border: 'none', background: 'rgba(0,0,0,0.08)', borderRadius: 6,
                width: 28, height: 28, cursor: 'pointer', fontSize: 14, flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
