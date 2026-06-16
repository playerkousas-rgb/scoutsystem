'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { branchName, branchIdMatch } from '@/lib/branches';
import { setInterested } from '@/lib/api';

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

function calcAge(dob: string): number {
  if (!dob) return -1;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function MemberInner() {
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyEventId, setBusyEventId] = useState('');
  const user = getUser();

  const load = async () => {
    if (!user) return;
    setLoading(true);
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
  };

  useEffect(() => {
    load();
  }, [user?.userId]);

  const handleInterested = async (eventId: string) => {
    if (!data?.memberId) return alert('找不到成員 ID');
    setBusyEventId(eventId);
    try {
      const res = await setInterested(eventId, data.memberId);
      if (res.success) {
        load(); // 重新載入
      } else {
        alert(res.error || '操作失敗');
      }
    } catch {
      alert('連線失敗');
    } finally {
      setBusyEventId('');
    }
  };

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  const member = data?.member || {};
  const age = calcAge(val(member, 'dateOfBirth'));
  const ec = data?.emergencyContact || {};
  const myReplies: any[] = data?.eventReplies || [];
  const myMemberId = data?.memberId || '';

  // 計算年齡字串
  const ageStr = age >= 0 ? String(age) : '-';
  const isAdult = age >= 18;

  // 報名狀態對照
  const replyMap = new Map<string, string>(); // eventId → type
  myReplies.forEach((r: any) => {
    const eId = r.eventId || '';
    const type = r.type || 'interested';
    replyMap.set(eId, type);
  });

  const today = new Date().toISOString().slice(0, 10);

  // 分類活動
  const registeredEvents = events.filter((e: any) => replyMap.get(e.id || e.eventId) === 'registered' && (e.date || '') >= today);
  const interestedEvents = events.filter((e: any) => replyMap.get(e.id || e.eventId) === 'interested' && (e.date || '') >= today);
  const declinedEvents = events.filter((e: any) => replyMap.get(e.id || e.eventId) === 'declined' && (e.date || '') >= today);
  const notRepliedEvents = events.filter((e: any) => {
    const eId = e.id || e.eventId || '';
    const eDate = e.date || '';
    if (eDate < today) return false;
    const memberBranch = val(member, 'branchId');
    if (e.scope !== 'troop' && !branchIdMatch(e.branchId, memberBranch) && e.branchId) return false;
    return !replyMap.has(eId);
  });

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">成員控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>查看個人資料及活動報名狀態。</p>
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
          <div><label className="muted">年齡</label><p>{ageStr} {isAdult && <span className="badge" style={{ background: '#dbeafe', color: '#2563eb', fontSize: 11 }}>可自行報名</span>}</p></div>
          <div><label className="muted">出生日期</label><p>{val(member, 'dateOfBirth') || '-'}</p></div>
          <div><label className="muted">性別</label><p>{val(member, 'gender') || '-'}</p></div>
          <div><label className="muted">電話</label><p>{val(member, 'phone') || '-'}</p></div>
          <div><label className="muted">電郵</label><p>{val(member, 'email') || '-'}</p></div>
          <div><label className="muted">小隊</label><p>{val(member, 'patrol') || '-'}</p></div>
          <div><label className="muted">職級</label><p>{val(member, 'rank') || '-'}</p></div>
        </div>
      </section>

      {/* 緊急聯絡人 */}
      <section className="card stack">
        <h2>緊急聯絡人</h2>
        {ec.name ? (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div><label className="muted">聯絡人姓名（家長）</label><p>{ec.name}</p></div>
            <div><label className="muted">聯絡人電話</label><p>{ec.phone || '-'}</p></div>
          </div>
        ) : (
          <p className="muted">尚未連結家長帳戶。</p>
        )}
      </section>

      {/* 已確認參加 */}
      <section className="card stack">
        <h2>✅ 已確認參加</h2>
        {registeredEvents.length === 0 && <p className="muted">暫無已確認參加的活動。</p>}
        {registeredEvents.map((e: any) => (
          <div key={e.id || e.eventId} className="card" style={{ boxShadow: 'none', border: '1px solid #bbf7d0' }}>
            <h3>{e.title}</h3>
            <p className="muted">{e.date} · {e.location} · 費用：{e.fee || '-'}</p>
          </div>
        ))}
      </section>

      {/* 有興趣活動 */}
      <section className="card stack">
        <h2>❤️ 有興趣的活動</h2>
        {interestedEvents.length === 0 && <p className="muted">暫無。請到「活動」頁面按 ❤️ 標記有興趣的活動。</p>}
        {interestedEvents.map((e: any) => (
          <div key={e.id || e.eventId} className="card" style={{ boxShadow: 'none', border: '1px solid #fde68a' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{e.title}</h3>
                <p className="muted">{e.date} · {e.location}</p>
              </div>
              <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>等待家長確認</span>
            </div>
          </div>
        ))}
      </section>

      {/* 不參加 */}
      {declinedEvents.length > 0 && (
        <section className="card stack">
          <h2>❌ 不參加</h2>
          {declinedEvents.map((e: any) => (
            <div key={e.id || e.eventId} className="card" style={{ boxShadow: 'none', border: '1px solid #fecaca' }}>
              <h3 style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{e.title}</h3>
              <p className="muted">{e.date} · {e.location}</p>
            </div>
          ))}
        </section>
      )}

      {/* 未回覆活動 */}
      <section className="card stack">
        <h2>⚠️ 未回覆的活動</h2>
        {notRepliedEvents.length === 0 && <p className="muted">全部活動已回覆！</p>}
        {notRepliedEvents.map((e: any) => {
          const eId = e.id || e.eventId || '';
          return (
            <div key={eId} className="card" style={{ boxShadow: 'none', border: '1px solid #fecaca' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{e.title}</h3>
                  <p className="muted">{e.date} · {e.location} · 費用：{e.fee || '-'}</p>
                </div>
                <button
                  className="btn"
                  style={{ fontSize: 14, padding: '4px 10px' }}
                  disabled={busyEventId === eId}
                  onClick={() => handleInterested(eId)}
                >
                  {busyEventId === eId ? '...' : '❤️ 有興趣'}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* 快捷入口 */}
      <section className="grid">
        <a href="/activities" className="card stack group">
          <h3>活動列表</h3>
          <p className="muted">查看全旅活動。</p>
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
