'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { branchName } from '@/lib/branches';

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

function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) {
      if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key];
    }
  }
  return '';
}

// 從出生日期計算年齡
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

// 讀取「會參加」的活動 ID
function getHeartedIds(): Set<string> {
  try {
    const raw = localStorage.getItem('scout-activity-hearts');
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function MemberInner() {
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hearts, setHearts] = useState<Set<string>>(() => getHeartedIds());
  const user = getUser();

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [dashRes, calRes] = await Promise.all([
          fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' }),
          fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' }),
        ]);
        const dashData = await dashRes.json();
        const calData = await calRes.json();
        if (dashData.success) setData(dashData.data);
        if (calData.success && calData.data) setEvents(calData.data.events || []);
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
  const age = calcAge(val(member, 'dateOfBirth'));
  const ec = data?.emergencyContact || {};

  // 會參加的活動（從 localStorage hearts 比對真實活動）
  const today = new Date().toISOString().slice(0, 10);
  const heartedEvents = events.filter(e => hearts.has(e.id) && e.date >= today);

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">成員控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>查看個人資料及所屬旅 / 支部的活動。</p>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>{error}</p>
        </section>
      )}

      {/* 個人資料 */}
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

      {/* 緊急聯絡人（來自家長連結） */}
      <section className="card stack">
        <h2>緊急聯絡人</h2>
        {ec.name ? (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div><label className="muted">聯絡人姓名（家長）</label><p>{ec.name}</p></div>
            <div><label className="muted">聯絡人電話</label><p>{ec.phone || '-'}</p></div>
          </div>
        ) : (
          <p className="muted">尚未連結家長帳戶。如家長已註冊並填寫你的 YMIS 編號，審批後將自動連結。</p>
        )}
      </section>

      {/* 會參加的活動 */}
      <section className="card stack">
        <h2>會參加的活動</h2>
        {!heartedEvents.length && <p className="muted">暫無。請到「活動」頁面按愛心標記會參加的活動。</p>}
        {heartedEvents.map((e: any) => (
          <div key={e.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location}</p>
          </div>
        ))}
      </section>

      {/* 旅 / 支部活動 */}
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
          <p className="muted">查看全旅活動，按愛心標記會參加。</p>
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
  return (
    <AuthGate roles={memberRoles as any} title="需要成員權限">
      <MemberInner />
    </AuthGate>
  );
}
