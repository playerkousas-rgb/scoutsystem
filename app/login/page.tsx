'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('scout-system-session-v2', data.user.userId);
        localStorage.setItem('isLoggedIn', 'true');
        router.push(data.user.dashboard || '/');
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
        <p className="muted">所有角色均可登入。登入後將跳轉至對應控制台。</p>
        <form onSubmit={handleLogin} className="stack">
          <div>
            <label className="block text-sm font-medium mb-1">電子郵件</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
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
          <a href="/register" className="btn">家長註冊</a>
          <a href="/leader/apply" className="btn">領袖申請</a>
        </div>
      </section>
    </div>
  );
}
