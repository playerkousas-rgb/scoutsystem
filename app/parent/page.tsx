'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { branchName } from '@/lib/branches';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
const parentRoles: string[] = ['parent'];

function getUser() {
  try { const raw = localStorage.getItem('currentUser'); if (raw) { const p = JSON.parse(raw); if (p?.userId) return p; } } catch {}
  return null;
}

function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) { if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key]; }
  }
  return '';
}

function ParentInner() {
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [myReplies, setMyReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [dashRes, calRes, replyRes] = await Promise.all([
          fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' }),
          fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' }),
          fetch(`${APPS_SCRIPT_URL}?action=getEventReplies&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' }),
        ]);
        const dd = await dashRes.json();
        const cd = await calRes.json();
        const rd = await replyRes.json();
        if (dd.success) setData(dd.data);
        if (cd.success && cd.data) setEvents(cd.data.events || []);
        if (rd.success) setMyReplies(rd.data || []);
      } catch (err: any) { setError(err.message || '載入失敗'); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  const today = new Date().toISOString().slice(0, 10);
  const interestedEvents = events.filter(e => {
    const r = myReplies.find(r => val(r, 'eventId') === e.id);
    return r && val(r, 'type') === 'interested' && e.date >= today;
  });
  const registeredEvents = events.filter(e => {
    const r = myReplies.find(r => val(r, 'eventId') === e.id);
    return r && val(r, 'type') === 'registered' && e.date >= today;
  });

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">家長控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>管理子女資料及回覆活動。</p>
      </section>

      {error && (<section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}><p style={{ color: 'var(--red)' }}>{error}</p></section>)}

      <section className="grid">
        <div className="card"><span className="badge blue">子女</span><h2>{data?.children?.length || 0}</h2><p className="muted">已關聯成員</p></div>
        <div className="card"><span className="badge red">有興趣</span><h2>{interestedEvents.length}</h2><p className="muted">有興趣活動</p></div>
        <div className="card"><span className="badge green">已報名</span><h2>{registeredEvents.length}</h2><p className="muted">已報名活動</p></div>
      </section>

      <section className="card stack">
        <h2>💰 已報名的活動</h2>
        {!registeredEvents.length && <p className="muted">暫無。家長可在活動頁按 💰 報名。</p>}
        {registeredEvents.map(e => (
          <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location}</p>
          </div>
        ))}
      </section>

      <section className="card stack">
        <h2>❤️ 有興趣的活動</h2>
        {!interestedEvents.length && <p className="muted">暫無。</p>}
        {interestedEvents.map(e => (
          <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location}</p>
          </div>
        ))}
      </section>

      <section className="card stack">
        <h2>我的子女</h2>
        {!data?.children?.length && <p className="muted">暫無子女資料。請確認註冊時填寫的 YM 編號正確，並等待領袖審批。</p>}
        {(data?.children || []).map((child: any) => (
          <div key={child.id || child.memberId} className="card" style={{ boxShadow: 'none' }}>
            <h3>{child.name || child.nameChinese || '未命名'}</h3>
            <p className="muted">支部：{branchName(child.branchId)} · 小隊：{child.patrol || '-'} · YM：{child.ymNumber || '-'}</p>
          </div>
        ))}
      </section>

      <section className="grid">
        <a href="/activities" className="card stack group">
          <h3>活動與通告</h3>
          <p className="muted">查看全旅活動，按 💰 報名。</p>
          <div className="btn block text-center">進入</div>
        </a>
        <a href="/calendar" className="card stack group">
          <h3>行事曆</h3>
          <p className="muted">查看活動行事曆。</p>
          <div className="btn block text-center">進入</div>
        </a>
      </section>
    </div>
  );
}

export default function ParentDashboard() {
  return (<AuthGate roles={parentRoles as any} title="需要家長權限"><ParentInner /></AuthGate>);
}
