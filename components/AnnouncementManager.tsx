'use client';

import { useState } from 'react';
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

export default function AnnouncementManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const user = getUser();

  // 管理員/超管 → 全旅；支部領袖/團長/教練 → 自己支部
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const scopeLabel = isAdmin ? '全旅' : '自己支部';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('請輸入訊息內容');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        action: 'addAnnouncement',
        senderId: user?.userId || '',
        senderName: user?.name || '',
        title: title || '通告',
        message: message,
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        setSuccess(true);
        setTitle('');
        setMessage('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(d.error || '發送失敗');
      }
    } catch (err: any) {
      setError(err.message || '連線失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card stack">
      <h2>發送通告訊息</h2>
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8 }}>
        {isAdmin
          ? '您是管理員，發送的通告會顯示給全旅所有用戶（登入時彈出）。'
          : '您是領袖，發送的通告只會顯示給您所屬支部的成員和家長（登入時彈出）。'}
        <br />發送範圍：<strong>{scopeLabel}</strong>
      </div>
      <form onSubmit={handleSend} className="stack">
        <div>
          <label className="block text-sm font-medium mb-1">標題</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例如：明天集會取消"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">訊息內容 *</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="輸入通告內容..."
            required
          />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#15803d', fontSize: 14 }}>✓ 通告已發送！{scopeLabel}的用戶下次進入頁面時會看到。</p>}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? '發送中...' : `📢 發送通告（${scopeLabel}）`}
        </button>
      </form>
    </section>
  );
}
