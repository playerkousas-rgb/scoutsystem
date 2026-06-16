'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBranchName, type AppData, type EventScope } from '@/lib/troupeStore';
import { setInterested, setRegistered, setRegisteredSelf, setDeclined } from '@/lib/api';
import { branchName } from '@/lib/branches';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const TABS = ['全部', '旅活動', '支部活動', '外部活動'] as const;
const BRANCHES = ['全旅', '小童軍', '幼童軍', '童軍', '深資童軍', '樂行童軍', '領袖'];

function normalizeDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value);
}

function isFutureEvent(date: string) {
  return date >= new Date().toISOString().slice(0, 10);
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

type ActivityItem = {
  id: string;
  branchId?: string;
  scope: EventScope;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  quota?: number;
  fee?: string;
  description: string;
  status: string;
  source?: string;
  isLibrary?: boolean;
  circularKey?: string;
  sourceUrl?: string;
  attachmentUrl?: string;
  officialDeadline?: string;
  internalDeadline?: string;
  activityType?: string;
  branchTags?: string[];
};

function getMarkedIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveMarkedIds(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

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

export default function ActivitiesPage() {
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<typeof TABS[number]>('全部');
  const [branch, setBranch] = useState('all');
  const [showStarred, setShowStarred] = useState(false);
  const [stars, setStars] = useState<Set<string>>(() => getMarkedIds('scout-activity-stars'));

  // V5.0: 報名狀態（從後端取得）
  const [replies, setReplies] = useState<Map<string, string>>(new Map()); // eventId → type
  const [busyEventId, setBusyEventId] = useState('');
  const [dashData, setDashData] = useState<any>(null);
  const [registerModal, setRegisterModal] = useState<{ event: ActivityItem; children: any[] } | null>(null);

  const user = getUser();
  const role = user?.role || '';
  const isMember = role === 'member';
  const isParent = role === 'parent';
  const isLeader = ['super_admin', 'admin', 'group_leader', 'branch_leader', 'coach'].includes(role);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [calendarRes, libRes] = await Promise.all([
          fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' }),
          fetch(`${APPS_SCRIPT_URL}?action=getPublicLibraryBookmarks`, { cache: 'no-store' }),
        ]);
        const calendarData = await calendarRes.json();
        const libData = await libRes.json();

        if (!cancelled) {
          let allEvents: ActivityItem[] = [];
          const branchList: any[] = [];

          if (calendarData.success && calendarData.data) {
            const normalized = (calendarData.data.events || []).map((e: any) => ({
              ...e,
              date: normalizeDate(e.date),
              isLibrary: false,
            }));
            allEvents = [...normalized];
            branchList.push(...(calendarData.data.branches || []));
          }

          if (libData.success && libData.data) {
            const libItems = (libData.data || []).map((b: any) => ({
              id: b.id,
              title: b.title,
              date: b.internalDeadline || b.officialDeadline || b.circularDate || '',
              location: b.sourceSite || b.region || '全港',
              description: b.notes || '本旅已標記通告，請向領袖查詢詳情。',
              status: b.status || 'published',
              scope: 'troop' as EventScope,
              source: 'library',
              isLibrary: true,
              circularKey: b.circularKey,
              sourceUrl: b.sourceUrl,
              attachmentUrl: b.attachmentUrl,
              fee: b.fee,
              officialDeadline: b.officialDeadline,
              internalDeadline: b.internalDeadline,
              activityType: b.activityType,
              branchTags: b.branchTags || [],
            }));
            allEvents = [...allEvents, ...libItems];
          }

          setEvents(allEvents);
          setBranches(branchList);
          setConnected(true);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || '無法連線');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // V5.0: 載入報名狀態
  useEffect(() => {
    if (!user) return;
    async function loadReplies() {
      try {
        const dashRes = await fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' });
        const d = await dashRes.json();
        if (d.success) {
          setDashData(d.data);
          const myReplies = d.data?.eventReplies || [];
          const map = new Map<string, string>();
          myReplies.forEach((r: any) => {
            if (r.eventId) map.set(r.eventId, r.type || 'interested');
          });
          setReplies(map);
        }
      } catch {}
    }
    loadReplies();
  }, [user]);

  const toggleStar = (id: string) => {
    const next = new Set(stars);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setStars(next);
    saveMarkedIds('scout-activity-stars', next);
  };

  // 成員按 ❤️
  const handleInterested = async (eventId: string) => {
    if (!user || !isMember) return;
    const memberId = dashData?.memberId;
    if (!memberId) return alert('找不到成員 ID');
    setBusyEventId(eventId);
    try {
      const res = await setInterested(eventId, memberId);
      if (res.success) {
        setReplies(prev => new Map(prev).set(eventId, 'interested'));
      } else {
        alert(res.error || '操作失敗');
      }
    } catch {
      alert('連線失敗');
    } finally {
      setBusyEventId('');
    }
  };

  // 家長按 📋（開啟選子女 Modal）
  const handleParentRegister = (event: ActivityItem) => {
    const children = dashData?.children || [];
    if (children.length === 0) return alert('暫無子女資料');
    setRegisterModal({ event, children });
  };

  // 成員 18+ 自行報名
  const handleSelfRegister = async (eventId: string) => {
    if (!user || !isMember) return;
    const memberId = dashData?.memberId;
    if (!memberId) return alert('找不到成員 ID');
    setBusyEventId(eventId);
    try {
      const res = await setRegisteredSelf(eventId, memberId);
      if (res.success) {
        setReplies(prev => new Map(prev).set(eventId, 'registered'));
      } else {
        alert(res.error || '報名失敗');
      }
    } catch {
      alert('連線失敗');
    } finally {
      setBusyEventId('');
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        if (tab === '全部') return true;
        if (tab === '旅活動') return e.scope === 'troop' && !e.isLibrary;
        if (tab === '支部活動') return e.scope === 'branch' && !e.isLibrary;
        if (tab === '外部活動') return e.isLibrary || (e.scope !== 'troop' && e.scope !== 'branch');
        return true;
      })
      .filter(e => {
        if (branch === 'all') return true;
        if (e.isLibrary) {
          return (e.branchTags || []).includes(branch);
        }
        const bName = branches.find((b: any) => b.id === e.branchId)?.name || '';
        return bName === branch || bName.replace('支部', '') === branch || bName.includes(branch);
      })
      .filter(e => {
        if (!showStarred) return true;
        return stars.has(e.id);
      })
      .filter(e => !e.isLibrary || isFutureEvent(e.date) || stars.has(e.id))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, tab, branch, stars, showStarred, branches]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  // 成員年齡
  const memberAge = dashData?.member ? calcAge(dashData.member.dateOfBirth || '') : -1;
  const isAdult = memberAge >= 18;

  return (
    <div className="stack">
      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ 無法連接後端：{error}</p>
        </section>
      )}
      {connected && !error && (
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <p style={{ color: 'var(--green)' }}>🟢 已連接 Google Sheet · 共 {events.length} 筆活動及通告</p>
        </section>
      )}
      <section className="hero">
        <span className="badge blue">公開活動</span>
        <h1>旅或支部未來活動</h1>
        <p>查看活動，成員可按 ❤️ 表達有興趣，家長可 ✅參加 / ❌不參加 回覆。⭐ 為個人收藏。</p>
        <div className="row">
          {TABS.map(t => (
            <button key={t} className={`btn ${tab === t ? 'primary' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </section>
      <section className="card row">
        <strong>篩選：</strong>
        <button className={`btn ${!showStarred ? 'primary' : ''}`} onClick={() => setShowStarred(false)}>全部</button>
        <button className={`btn ${showStarred ? 'primary' : ''}`} onClick={() => setShowStarred(true)}>⭐ 已標星</button>
        <div className="row" style={{ gap: 6, marginLeft: 12, flexWrap: 'wrap' }}>
          {BRANCHES.map(b => (
            <button key={b} className={`btn ${branch === b ? 'primary' : ''}`} onClick={() => setBranch(branch === b ? 'all' : b)}>
              {b}
            </button>
          ))}
        </div>
      </section>
      <section className="card stack">
        {filteredEvents.map(e => {
          const replyType = replies.get(e.id) || '';
          return (
            <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 8, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* ⭐ 始終可用（localStorage） */}
                    <button className="btn" style={{ fontSize: 18, padding: '0 4px' }} title="收藏" onClick={() => toggleStar(e.id)}>
                      {stars.has(e.id) ? '⭐' : '☆'}
                    </button>

                    {/* ❤️ 成員：有興趣 */}
                    {isMember && !e.isLibrary && (
                      <button
                        className="btn"
                        style={{ fontSize: 18, padding: '0 4px' }}
                        title="有興趣"
                        disabled={busyEventId === e.id || replyType === 'registered'}
                        onClick={() => handleInterested(e.id)}
                      >
                        {replyType === 'interested' || replyType === 'registered' ? '❤️' : '🤍'}
                      </button>
                    )}

                    {/* 📋 家長：回覆活動 */}
                    {isParent && !e.isLibrary && (
                      <button
                        className="btn"
                        style={{ fontSize: 14, padding: '0 6px', fontWeight: 600 }}
                        title="回覆活動"
                        disabled={busyEventId === e.id}
                        onClick={() => handleParentRegister(e)}
                      >
                        📋
                      </button>
                    )}

                    {/* 💰 成員 18+：自行確認參加 */}
                    {isMember && isAdult && !e.isLibrary && replyType !== 'registered' && (
                      <button
                        className="btn"
                        style={{ fontSize: 14, padding: '0 6px', fontWeight: 600 }}
                        title="確認參加（18歲以上）"
                        disabled={busyEventId === e.id}
                        onClick={() => handleSelfRegister(e.id)}
                      >
                        ✅
                      </button>
                    )}

                    <div>
                      <span className="badge blue">{e.isLibrary ? '通告' : e.scope === 'troop' ? '旅活動' : e.scope === 'branch' ? '支部活動' : '外部活動'}</span>
                      {replyType === 'registered' && <span className="badge" style={{ background: '#dcfce7', color: '#16a34a', marginLeft: 4 }}>✅ 參加</span>}
                      {replyType === 'declined' && <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', marginLeft: 4 }}>❌ 不參加</span>}
                      {replyType === 'interested' && <span className="badge" style={{ background: '#fef3c7', color: '#d97706', marginLeft: 4 }}>❤️ 有興趣</span>}
                      {e.source === 'scout_library' && <span className="badge gold">童軍圖書館</span>}
                      <h3 style={{ marginTop: 4, marginBottom: 0 }}>{e.title}</h3>
                    </div>
                  </div>
                </div>
                <strong>{e.date}</strong>
              </div>
              <p className="muted">
                {e.date} · {e.location}
                {e.isLibrary ? '' : ` · ${getBranchName({ branches } as AppData, e.branchId)}`}
                · 費用：{e.fee || '-'}
                {e.isLibrary && e.activityType && ` · 類型：${e.activityType}`}
              </p>
              <p>{e.description}</p>
              {e.isLibrary && e.attachmentUrl && (
                <div className="row" style={{ gap: 6, marginTop: 8 }}>
                  <a href={e.attachmentUrl} target="_blank" className="btn primary">開啟附件</a>
                  {e.sourceUrl && <a href={e.sourceUrl} target="_blank" className="btn">來源</a>}
                </div>
              )}
            </div>
          );
        })}
        {!filteredEvents.length && <p className="muted">目前沒有符合條件的活動或通告。</p>}
      </section>

      {/* 家長回覆 Modal */}
      {registerModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
          onClick={() => setRegisterModal(null)}
        >
          <div className="card stack" style={{ maxWidth: 500, width: '100%', margin: '40px 0' }} onClick={ev => ev.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>📋 回覆活動</h2>
              <button className="btn" style={{ padding: '4px 12px' }} onClick={() => setRegisterModal(null)}>✕</button>
            </div>
            <p><strong>{registerModal.event.title}</strong></p>
            <p className="muted">{registerModal.event.date} · {registerModal.event.location} · 費用：{registerModal.event.fee || '-'}</p>
            <div className="stack" style={{ gap: 8 }}>
              {registerModal.children.map((child: any) => {
                const childId = child.memberId || child.id || '';
                const childName = child.name || child.nameChinese || '未命名';
                const childRegistered = (child.registeredEvents || []).some((e: any) => (e.eventId || e.id) === registerModal.event.id);
                const childInterested = (child.interestedEvents || []).some((e: any) => (e.eventId || e.id) === registerModal.event.id);
                const childDeclined = (child.declinedEvents || []).some((e: any) => (e.eventId || e.id) === registerModal.event.id);

                return (
                  <div key={childId} className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', padding: 10 }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{childName}</strong>
                        <span className="muted" style={{ marginLeft: 8 }}>{branchName(child.branchId)}</span>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        {childRegistered && <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>✅ 參加</span>}
                        {childDeclined && (
                          <>
                            <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>❌ 不參加</span>
                            <button
                              className="btn"
                              style={{ fontSize: 11, padding: '2px 8px' }}
                              disabled={busyEventId === registerModal.event.id}
                              onClick={async () => {
                                setBusyEventId(registerModal.event.id);
                                try {
                                  const res = await setRegistered(registerModal.event.id, childId, user?.userId || '');
                                  if (res.success) { setRegisterModal(null); window.location.reload(); }
                                  else alert(res.error || '操作失敗');
                                } catch { alert('連線失敗'); }
                                finally { setBusyEventId(''); }
                              }}
                            >改為參加</button>
                          </>
                        )}
                        {childInterested && !childRegistered && !childDeclined && (
                          <>
                            <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>❤️</span>
                            <button className="btn primary" style={{ fontSize: 11, padding: '2px 8px' }} disabled={busyEventId === registerModal.event.id}
                              onClick={async () => {
                                setBusyEventId(registerModal.event.id);
                                try {
                                  const res = await setRegistered(registerModal.event.id, childId, user?.userId || '');
                                  if (res.success) { setRegisterModal(null); window.location.reload(); }
                                  else alert(res.error || '操作失敗');
                                } catch { alert('連線失敗'); }
                                finally { setBusyEventId(''); }
                              }}
                            >✅ 參加</button>
                            <button className="btn" style={{ fontSize: 11, padding: '2px 8px', color: '#dc2626' }} disabled={busyEventId === registerModal.event.id}
                              onClick={async () => {
                                setBusyEventId(registerModal.event.id);
                                try {
                                  const res = await setDeclined(registerModal.event.id, childId, user?.userId || '');
                                  if (res.success) { setRegisterModal(null); window.location.reload(); }
                                  else alert(res.error || '操作失敗');
                                } catch { alert('連線失敗'); }
                                finally { setBusyEventId(''); }
                              }}
                            >❌ 不參加</button>
                          </>
                        )}
                        {!childRegistered && !childDeclined && !childInterested && (
                          <>
                            <button className="btn primary" style={{ fontSize: 11, padding: '4px 10px' }} disabled={busyEventId === registerModal.event.id}
                              onClick={async () => {
                                setBusyEventId(registerModal.event.id);
                                try {
                                  const res = await setRegistered(registerModal.event.id, childId, user?.userId || '');
                                  if (res.success) { setRegisterModal(null); window.location.reload(); }
                                  else alert(res.error || '操作失敗');
                                } catch { alert('連線失敗'); }
                                finally { setBusyEventId(''); }
                              }}
                            >✅ 參加</button>
                            <button className="btn" style={{ fontSize: 11, padding: '4px 10px', color: '#dc2626' }} disabled={busyEventId === registerModal.event.id}
                              onClick={async () => {
                                setBusyEventId(registerModal.event.id);
                                try {
                                  const res = await setDeclined(registerModal.event.id, childId, user?.userId || '');
                                  if (res.success) { setRegisterModal(null); window.location.reload(); }
                                  else alert(res.error || '操作失敗');
                                } catch { alert('連線失敗'); }
                                finally { setBusyEventId(''); }
                              }}
                            >❌ 不參加</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
