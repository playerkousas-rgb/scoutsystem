'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const memberRoles: string[] = ['member'];

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

function MemberInner() {
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

  const member = data?.member || {};

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">成員控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>查看個人資料及即將參與的活動。</p>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}

      <section className="card stack">
        <h2>個人資料</h2>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><label className="muted">姓名</label><p>{member.name || user?.name || '-'}</p></div>
          <div><label className="muted">支部</label><p>{member.branchId || '-'}</p></div>
          <div><label className="muted">小隊</label><p>{member.patrol || '-'}</p></div>
          <div><label className="muted">YM 編號</label><p>{member.ymNumber || '-'}</p></div>
          <div><label className="muted">職級</label><p>{member.rank || '-'}</p></div>
          <div><label className="muted">學校</label><p>{member.school || '-'}</p></div>
        </div>
      </section>

      <section className="card stack">
        <h2>即將參與的活動</h2>
        {!data?.upcomingEvents?.length && <p className="muted">暫無即將進行的活動。</p>}
        {(data?.upcomingEvents || []).map((e: any) => (
          <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location}</p>
          </div>
        ))}
      </section>

      <section className="grid">
        <a href="/activities" className="card stack group">
          <h3>🗓️ 活動與通告</h3>
          <p className="muted">查看全旅活動。</p>
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

export default function MemberDashboard() {
  return (
    <AuthGate roles={memberRoles as any} title="需要成員權限">
      <MemberInner />
    </AuthGate>
  );
}
