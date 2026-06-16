'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { branchName } from '@/lib/branches';
import { ParentRegisterPanel, type ChildInfo } from '@/components/EventRegistrationPanel';

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
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeringEvent, setRegisteringEvent] = useState<any>(null);
  const user = getUser();

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
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

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  const today = new Date().toISOString().slice(0, 10);
  const futureEvents = events.filter((e: any) => (e.date || '') >= today);

  const children: ChildInfo[] = data?.children || [];
  const childIds = children.map((c: any) => c.memberId || c.id).filter(Boolean);

  // 為每個子女找出未回覆的活動
  const getChildEvents = (child: ChildInfo, type: 'unresponded' | 'registered' | 'interested' | 'declined') => {
    const list = type === 'unresponded' ? (child.unrespondedEvents || [])
      : type === 'registered' ? (child.registeredEvents || [])
      : type === 'declined' ? (child.declinedEvents || [])
      : (child.interestedEvents || []);

    return list.filter((e: any) => {
      const eDate = String(e.date || '');
      return eDate >= today;
    });
  };

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">家長控制台</span>
        <h1>歡迎，{user?.name}</h1>
        <p>管理子女資料及活動報名。</p>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>{error}</p>
        </section>
      )}

      {/* 統計卡片 */}
      <section className="grid">
        <div className="card"><span className="badge blue">子女</span><h2>{children.length}</h2><p className="muted">已關聯成員</p></div>
        <div className="card">
          <span className="badge red">未回覆</span>
          <h2>{children.reduce((sum, c) => sum + (c.unrespondedCount || 0), 0)}</h2>
          <p className="muted">活動待回覆</p>
        </div>
        <div className="card">
          <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>✅ 參加</span>
          <h2>{children.reduce((sum, c) => sum + (c.registeredCount || 0), 0)}</h2>
          <p className="muted">已確認參加</p>
        </div>
        <div className="card">
          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>❌ 不參加</span>
          <h2>{children.reduce((sum, c) => sum + (c.declinedCount || 0), 0)}</h2>
          <p className="muted">已確認不參加</p>
        </div>
      </section>

      {/* 未回覆活動（重要提醒） */}
      {children.some(c => (c.unrespondedCount || 0) > 0) && (
        <section className="card stack">
          <h2>⚠️ 未回覆的活動</h2>
          {children.map((child) => {
            const unresponded = getChildEvents(child, 'unresponded');
            if (unresponded.length === 0) return null;
            return (
              <div key={child.memberId || child.id}>
                <h3 style={{ color: 'var(--blue)', marginBottom: 8 }}>{child.name || child.nameChinese} 的未回覆活動</h3>
                {unresponded.map((e: any) => {
                  const eId = e.eventId || e.id || '';
                  return (
                    <div key={eId} className="card" style={{ boxShadow: 'none', border: '1px solid #fecaca', marginBottom: 8, padding: 12 }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{e.title}</strong>
                          <p className="muted" style={{ margin: 0 }}>{e.date} · {e.location} · 費用：{e.fee || '-'}</p>
                        </div>
                        <button
                          className="btn primary"
                          style={{ fontSize: 13, padding: '6px 14px', whiteSpace: 'nowrap' }}
                          onClick={() => setRegisteringEvent({ ...e, id: eId })}
                        >
                          📋 回覆
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      )}

      {/* 已確認參加 */}
      {children.some(c => (c.registeredCount || 0) > 0) && (
        <section className="card stack">
          <h2>✅ 已確認參加</h2>
          {children.map((child) => {
            const registered = getChildEvents(child, 'registered');
            if (registered.length === 0) return null;
            return (
              <div key={child.memberId || child.id}>
                <h3 style={{ color: 'var(--green)', marginBottom: 8 }}>{child.name || child.nameChinese}</h3>
                {registered.map((e: any) => (
                  <div key={e.eventId || e.id} className="card" style={{ boxShadow: 'none', border: '1px solid #bbf7d0', marginBottom: 8, padding: 12 }}>
                    <strong>{e.title}</strong>
                    <p className="muted" style={{ margin: 0 }}>{e.date} · {e.location}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {/* 已確認不參加 */}
      {children.some(c => (c.declinedCount || 0) > 0) && (
        <section className="card stack">
          <h2>❌ 已確認不參加</h2>
          {children.map((child) => {
            const declined = getChildEvents(child, 'declined');
            if (declined.length === 0) return null;
            return (
              <div key={child.memberId || child.id}>
                <h3 style={{ color: '#dc2626', marginBottom: 8 }}>{child.name || child.nameChinese}</h3>
                {declined.map((e: any) => {
                  const eId = e.eventId || e.id || '';
                  return (
                    <div key={eId} className="card" style={{ boxShadow: 'none', border: '1px solid #fecaca', marginBottom: 8, padding: 12 }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{e.title}</strong>
                          <p className="muted" style={{ margin: 0 }}>{e.date} · {e.location}</p>
                        </div>
                        <button
                          className="btn"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => setRegisteringEvent({ ...e, id: eId })}
                        >
                          改為參加
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      )}

      {/* 有興趣活動 */}
      {children.some(c => (c.interestedCount || 0) > 0) && (
        <section className="card stack">
          <h2>❤️ 有興趣的活動</h2>
          {children.map((child) => {
            const interested = getChildEvents(child, 'interested');
            if (interested.length === 0) return null;
            return (
              <div key={child.memberId || child.id}>
                <h3 style={{ color: '#d97706', marginBottom: 8 }}>{child.name || child.nameChinese}</h3>
                {interested.map((e: any) => {
                  const eId = e.eventId || e.id || '';
                  return (
                    <div key={eId} className="card" style={{ boxShadow: 'none', border: '1px solid #fde68a', marginBottom: 8, padding: 12 }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{e.title}</strong>
                          <p className="muted" style={{ margin: 0 }}>{e.date} · {e.location}</p>
                        </div>
                        <button
                          className="btn primary"
                          style={{ fontSize: 13, padding: '6px 14px', whiteSpace: 'nowrap' }}
                          onClick={() => setRegisteringEvent({ ...e, id: eId })}
                        >
                          📋 回覆
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      )}

      {/* 我的子女 */}
      <section className="card stack">
        <h2>我的子女</h2>
        {!children.length && <p className="muted">暫無子女資料。請確認註冊時填寫的 YMIS 編號正確，並等待領袖審批。</p>}
        {children.map((child: any) => (
          <div key={child.memberId || child.id} className="card" style={{ boxShadow: 'none' }}>
            <h3>{child.name || child.nameChinese || '未命名'}</h3>
            <p className="muted">
              支部：{branchName(child.branchId)} · 小隊：{child.patrol || '-'} · YM：{child.ymNumber || '-'}
            </p>
          </div>
        ))}
      </section>

      {/* 快捷入口 */}
      <section className="grid">
        <a href="/activities" className="card stack group">
          <h3>活動列表</h3>
          <p className="muted">查看全旅活動及報名。</p>
          <div className="btn block text-center">進入</div>
        </a>
        <a href="/calendar" className="card stack group">
          <h3>行事曆</h3>
          <p className="muted">查看活動行事曆。</p>
          <div className="btn block text-center">進入</div>
        </a>
      </section>

      {/* 報名 Modal */}
      {registeringEvent && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
          onClick={() => setRegisteringEvent(null)}
        >
          <div className="card stack" style={{ maxWidth: 600, width: '100%', margin: '40px 0' }} onClick={ev => ev.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>📋 回覆活動</h2>
              <button className="btn" style={{ padding: '4px 12px' }} onClick={() => setRegisteringEvent(null)}>✕</button>
            </div>
            <ParentRegisterPanel
              event={registeringEvent}
              children={children}
              onRegistered={() => {
                setRegisteringEvent(null);
                load(); // 重新載入
              }}
            />
          </div>
        </div>
      )}
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
