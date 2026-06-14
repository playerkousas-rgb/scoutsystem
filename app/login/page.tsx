'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export default function LoginPage() {
  const [mode, setMode] = useState<'email' | 'ymis'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = APPS_SCRIPT_URL
        + '?action=login'
        + '&email=' + encodeURIComponent(identifier)
        + '&password=' + encodeURIComponent(password);
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('scout-system-session-v2', data.user.userId);
        localStorage.setItem('isLoggedIn', 'true');
        // ★ 用 window.location.href 而非 router.push，確保整頁刷新、所有元件重新讀取登入狀態
        window.location.href = data.user.dashboard || '/';
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (err) {
      setError('無法連線到伺服器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 480, margin: '60px auto' }}>
      <section className="card">
        <h1>登入系統</h1>

        {/* 登入方式切換 */}
        <div className="row" style={{ gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
          <button
            type="button"
            onClick={() => { setMode('email'); setIdentifier(''); }}
            style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: mode === 'email' ? '#2563eb' : '#f5f5f5',
              color: mode === 'email' ? '#fff' : '#666',
            }}
          >
            📧 電郵登入
          </button>
          <button
            type="button"
            onClick={() => { setMode('ymis'); setIdentifier(''); }}
            style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: mode === 'ymis' ? '#2563eb' : '#f5f5f5',
              color: mode === 'ymis' ? '#fff' : '#666',
            }}
          >
            🔢 YMIS 登入
          </button>
        </div>

        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          {mode === 'email'
            ? '家長、領袖、管理員請用已登記的電郵登入。'
            : '成員請用 YMIS 成員編號登入（如不知編號請向領袖查詢）。'}
        </p>

        <form onSubmit={handleLogin} className="stack">
          <div>
            <label className="block text-sm font-medium mb-1">
              {mode === 'email' ? '電郵 *' : 'YMIS 成員編號 *'}
            </label>
            <input
              type={mode === 'email' ? 'email' : 'text'}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder={mode === 'email' ? '例如：name@example.com' : '例如：YM001'}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          {error && (
            <div className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
              <p style={{ color: 'var(--red)' }}>{error}</p>
            </div>
          )}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
          <a href="/apply" className="btn">申請加入</a>
        </div>
      </section>
    </div>
  );
}
