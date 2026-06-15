'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { branchName } from '@/lib/branches';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const memberRoles: string[] = ['member'];

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) { const p = JSON.parse(raw); if (p?.userId) return p; }
  } catch {}
  return null;
}

function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) { if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key]; }
  }
  return '';
}

function calcAge(dob: string): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return String(age);
}

function MemberInner() {
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
        const dashData = await dashRes.json();
        const calData = await calRes.json();
        const replyData = await replyRes.json();
        if (dashData.success) setData(dashData.data);
        if (calData.success && calData.data) setEvents(calData.data.events || []);
        if (replyData.success) setMyReplies(replyData.data || []);
      } catch (err: any) { setError(err.message || '載入失敗'); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  const member = data?.member || {};
  const age = calcAge(val(member, 'dateOfBirth'));
  const ec = data?.emergencyContact || {};
  const today = new Date().toISOString().slice(0, 10);

  // 用後端報名資料比對活動
  const interestedEvents = events.filter(e => {
    const reply = myReplies.find(r => val(r, 'eventId') === e.id);
    return reply && val(reply, 'type') === 'interested' && e.date >= today;
  });
  const registeredEvents = events.filter(e => {
    const reply = myReplies.find(r => val(r, 'eventId') === e.id);
    return reply && val(reply, 'type') === 'registered' && e.date >= today;
  });

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">成員控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>查看個人資料及所屬旅 / 支部的活動。</p>
      </section>

      {error && (<section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}><p style={{ color: 'var(--red)' }}>{error}</p></section>)}

      <section className="card stack">
        <h2>個人資料</h2>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><label className="muted">姓名</label><p>{val(member, 'name') || user?.name || '-'}</p></div>
          <div><label className="muted">支部</label><p>{branchName(val(member, 'branchId')) || '-'}</p></div>
          <div><label className="muted">YMIS 編號</label><p>{val(member, 'ymNumber') || '-'}</p></div>
          <div><label className="muted">年齡</label><p>{age}</p></div>
          <div><label className="muted">出生日期</label><p>{val(member, 'dateOfBirth') || '-'}</p></div>
          <div><label className="muted">性別</label><p>{val(member, 'gender') || '-'}</p></div>
          <div><label className="muted">電話</label><p>{val(member, 'phone') || '-'}</p></div>
          <div><label className="muted">電郵</label><p>{val(member, 'email') || '-'}</p></div>
          <div><label className="muted">小隊</label><p>{val(member, 'patrol') || '-'}</p></div>
          <div><label className="muted">職級</label><p>{val(member, 'rank') || '-'}</p></div>
        </div>
      </section>

      <section className="card stack">
        <h2>緊急聯絡人</h2>
        {ec.name ? (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div><label className="muted">聯絡人姓名（家長）</label><p>{ec.name}</p></div>
            <div><label className="muted">聯絡人電話</label><p>{ec.phone || '-'}</p></div>
          </div>
        ) : (<p className="muted">尚未連結家長帳戶。</p>)}
      </section>

      <section className="card stack">
        <h2>❤️ 有興趣的活動</h2>
        {!interestedEvents.length && <p className="muted">暫無。請到「活動」頁面按 ❤️ 標記。</p>}
        {interestedEvents.map((e: any) => (
          <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location}</p>
          </div>
        ))}
      </section>

      <section className="card stack">
        <h2>💰 已報名的活動</h2>
        {!registeredEvents.length && <p className="muted">暫無。</p>}
        {registeredEvents.map((e: any) => (
          <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location}</p>
          </div>
        ))}
      </section>

      <section className="card stack">
        <h2>旅 / 支部活動</h2>
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
          <h3>活動與通告</h3>
          <p className="muted">查看全旅活動，按 ❤️ 有興趣、💰 報名。</p>
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

export default function MemberDashboard() {
  return (<AuthGate roles={memberRoles as any} title="需要成員權限"><MemberInner /></AuthGate>);
}
