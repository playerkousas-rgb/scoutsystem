'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const parentRoles: string[] = ['parent'];

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return p;
    }
  } catch {}
  return null;
}

function ParentInner() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' });
        const d = await res.json();
        if (d.success) setData(d.data);
      } catch (err: any) {
        setError(err.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">家長控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>管理子女資料及回覆活動。</p>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}

      <section className="grid">
        <div className="card"><span className="badge blue">子女</span><h2>{data?.children?.length || 0}</h2><p className="muted">已關聯成員</p></div>
        <div className="card"><span className="badge gold">通知</span><h2>{data?.notificationCount || 0}</h2><p className="muted">待處理通知</p></div>
      </section>

      <section className="card stack">
        <h2>我的子女</h2>
        {!data?.children?.length && <p className="muted">暫無子女資料。請確認註冊時填寫的 YM 編號正確，並等待領袖審批。</p>}
        {(data?.children || []).map((child: any) => (
          <div key={child.id || child.memberId} className="card" style={{ boxShadow: 'none' }}>
            <h3>{child.name || child.nameChinese || '未命名'}</h3>
            <p className="muted">支部：{child.branchId || '-'} · 小隊：{child.patrol || '-'} · YM：{child.ymNumber || '-'}</p>
          </div>
        ))}
      </section>

      <section className="grid">
        <a href="/activities" className="card stack group">
          <h3>🗓️ 活動與通告</h3>
          <p className="muted">查看全旅活動及已標記通告。</p>
          <div className="btn block text-center">進入</div>
        </a>
        <a href="/calendar" className="card stack group">
          <h3>📅 行事曆</h3>
          <p className="muted">查看活動行事曆。</p>
          <div className="btn block text-center">進入</div>
        </a>
      </section>
    </div>
  );
}

export default function ParentDashboard() {
  return (
    <AuthGate roles={parentRoles as any} title="需要家長權限">
      <ParentInner />
    </AuthGate>
  );
}
