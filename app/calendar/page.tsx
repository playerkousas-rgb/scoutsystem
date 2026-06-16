'use client';

import { useEffect, useMemo, useState } from 'react';
import { branchName } from '@/lib/branches';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

// ==================== Helpers ====================

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) { const p = JSON.parse(raw); if (p?.userId) return p; }
  } catch {}
  return null;
}

function normalizeDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseLocalDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// 活動來源顏色
function getEventColor(event: any): string {
  const source = String(event.source || '').toLowerCase();
  const scope = String(event.scope || '').toLowerCase();
  if (source === 'scout_library' || source === 'hq' || scope === 'hq' || scope === 'region' || scope === 'district' || scope === 'training') {
    return '#8b5cf6'; // 🟣 紫色
  }
  return '#3b82f6'; // 🔵 藍色
}

function getEventColorBg(event: any): string {
  const source = String(event.source || '').toLowerCase();
  const scope = String(event.scope || '').toLowerCase();
  if (source === 'scout_library' || source === 'hq' || scope === 'hq' || scope === 'region' || scope === 'district' || scope === 'training') {
    return '#f3e8ff'; // 紫色底
  }
  return '#eff6ff'; // 藍色底
}

function getEventSourceLabel(event: any): string {
  const source = String(event.source || '').toLowerCase();
  const scope = String(event.scope || '').toLowerCase();
  if (source === 'scout_library' || source === 'hq' || scope === 'hq' || scope === 'region' || scope === 'district' || scope === 'training') {
    return '🟣 外部';
  }
  return '🔵 自辦';
}

type CalendarEvent = {
  id: string;
  eventId?: string;
  branchId?: string;
  scope: string;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  quota?: number;
  fee?: string;
  description: string;
  status: string;
  source?: string;
};

type ReplyMap = Map<string, string>; // eventId → type

// ==================== 成員行事曆 ====================

function MemberCalendar({ events, replyMap, branchId }: {
  events: CalendarEvent[];
  replyMap: ReplyMap;
  branchId: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => monthKey(new Date()));

  // 成員只看自己支部 + 全旅，且隱藏 declined 的活動
  const myEvents = useMemo(() => events.filter(e => {
    if (e.status !== 'published' && e.status !== 'active') return false;
    const eDate = e.date || '';
    if (eDate < new Date().toISOString().slice(0, 10)) return false;
    // 只看自己支部或全旅
    if (e.scope !== 'troop' && e.branchId !== branchId && e.branchId) return false;
    // ❌ declined 的活動隱藏
    const eId = e.id || e.eventId || '';
    if (replyMap.get(eId) === 'declined') return false;
    return true;
  }), [events, replyMap, branchId]);

  return <CalendarGrid events={myEvents} replyMap={replyMap} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} mode="member" />;
}

// ==================== 家長行事曆 ====================

function ParentCalendar({ events, children, userId }: {
  events: CalendarEvent[];
  children: any[];
  userId: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => monthKey(new Date()));
  const [selectedChild, setSelectedChild] = useState<string>('all'); // 'all' or child memberId
  const [childReplies, setChildReplies] = useState<Map<string, Map<string, string>>>(new Map()); // childMemberId → ReplyMap

  // 載入所有子女的報名狀態
  useEffect(() => {
    async function load() {
      const memberIds = children.map(c => c.memberId || c.id).filter(Boolean);
      if (memberIds.length === 0) return;
      try {
        const params = new URLSearchParams({
          action: 'getEventReplies',
          memberIds: memberIds.join(','),
        });
        const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
          const map = new Map<string, Map<string, string>>();
          (data.data || []).forEach((r: any) => {
            const mId = r.memberId || '';
            const eId = r.eventId || '';
            const type = r.type || 'interested';
            if (!map.has(mId)) map.set(mId, new Map());
            map.get(mId)!.set(eId, type);
          });
          setChildReplies(map);
        }
      } catch {}
    }
    load();
  }, [children]);

  const today = new Date().toISOString().slice(0, 10);

  // 根據選擇的子女過濾活動
  const filteredEvents = useMemo(() => {
    if (selectedChild === 'all') {
      // 全部子女 → 顯示所有可見活動
      const allVisibleEventIds = new Set<string>();
      const allEvents: CalendarEvent[] = [];
      children.forEach(child => {
        const childBranch = child.branchId || '';
        const childReplyMap = childReplies.get(child.memberId || child.id || '') || new Map();
        events.forEach(e => {
          if (e.status !== 'published' && e.status !== 'active') return;
          if ((e.date || '') < today) return;
          if (e.scope !== 'troop' && e.branchId !== childBranch && e.branchId) return;
          const eId = e.id || e.eventId || '';
          allVisibleEventIds.add(eId);
          if (!allEvents.find(x => (x.id || x.eventId) === eId)) {
            allEvents.push(e);
          }
        });
      });
      return allEvents;
    } else {
      // 單一子女
      const child = children.find(c => (c.memberId || c.id) === selectedChild);
      if (!child) return [];
      const childBranch = child.branchId || '';
      return events.filter(e => {
        if (e.status !== 'published' && e.status !== 'active') return false;
        if ((e.date || '') < today) return false;
        if (e.scope !== 'troop' && e.branchId !== childBranch && e.branchId) return false;
        return true;
      });
    }
  }, [events, selectedChild, children, childReplies, today]);

  // 取得某子女對某活動的狀態
  const getChildStatus = (childMemberId: string, eventId: string): string => {
    const map = childReplies.get(childMemberId);
    return map?.get(eventId) || '';
  };

  // 生成狀態圖示
  const statusIcon = (type: string): string => {
    if (type === 'registered') return '✅';
    if (type === 'declined') return '❌';
    if (type === 'interested') return '❤️';
    return '';
  };

  // 疊加圖示：✅❤️ 或 ❌❤️
  const statusIconFull = (type: string): string => {
    if (type === 'registered') return '✅'; // 家長確認參加
    if (type === 'declined') return '❌';
    if (type === 'interested') return '❤️';
    return '';
  };

  return (
    <div className="stack">
      {/* 子女切換 Tab */}
      <section className="card row" style={{ gap: 6, flexWrap: 'wrap' }}>
        <strong>子女：</strong>
        <button className={`btn ${selectedChild === 'all' ? 'primary' : ''}`} onClick={() => setSelectedChild('all')}>全部</button>
        {children.map(child => {
          const cId = child.memberId || child.id || '';
          const cName = child.name || child.nameChinese || '未命名';
          return (
            <button key={cId} className={`btn ${selectedChild === cId ? 'primary' : ''}`} onClick={() => setSelectedChild(cId)}>
              {cName}
            </button>
          );
        })}
      </section>

      <CalendarGrid
        events={filteredEvents}
        replyMap={selectedChild === 'all' ? new Map() : (childReplies.get(selectedChild) || new Map())}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        mode="parent"
        children={children}
        childReplies={childReplies}
        selectedChild={selectedChild}
        statusIconFn={statusIconFull}
      />
    </div>
  );
}

// ==================== 領袖行事曆 ====================

function LeaderCalendar({ events, branchId, userId }: {
  events: CalendarEvent[];
  branchId: string;
  userId: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => monthKey(new Date()));
  const [eventSummaries, setEventSummaries] = useState<Record<string, any>>({});

  const myEvents = useMemo(() => events.filter(e => {
    if (e.status !== 'published' && e.status !== 'active') return false;
    if ((e.date || '') < new Date().toISOString().slice(0, 10)) return false;
    if (e.scope !== 'troop' && e.branchId !== branchId && e.branchId) return false;
    return true;
  }), [events, branchId]);

  return <CalendarGrid events={myEvents} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} mode="leader" userId={userId} />;
}

// ==================== 通用行事曆 Grid ====================

function CalendarGrid({
  events,
  replyMap = new Map(),
  currentMonth,
  setCurrentMonth,
  mode,
  children: parentChildren,
  childReplies,
  selectedChild,
  statusIconFn,
  userId,
}: {
  events: CalendarEvent[];
  replyMap?: ReplyMap;
  currentMonth: string;
  setCurrentMonth: (m: string) => void;
  mode: 'member' | 'parent' | 'leader' | 'public';
  children?: any[];
  childReplies?: Map<string, Map<string, string>>;
  selectedChild?: string;
  statusIconFn?: (type: string) => string;
  userId?: string;
}) {
  const monthDate = parseLocalDate(`${currentMonth}-01`);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const byDate = new Map<string, CalendarEvent[]>();
  events.forEach(e => {
    const arr = byDate.get(e.date) || [];
    arr.push(e);
    byDate.set(e.date, arr);
  });

  const moveMonth = (delta: number) => {
    const d = parseLocalDate(`${currentMonth}-01`);
    d.setMonth(d.getMonth() + delta);
    setCurrentMonth(monthKey(d));
  };

  const getStatusForEvent = (eId: string): string => {
    return replyMap.get(eId) || '';
  };

  return (
    <>
      <section className="hero">
        <span className="badge blue">
          {mode === 'member' ? '我的行事曆' : mode === 'parent' ? '家長行事曆' : mode === 'leader' ? '領袖行事曆' : '公開行事曆'}
        </span>
        <h1>{mode === 'member' ? '我的活動行事曆' : '旅團活動行事曆'}</h1>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => moveMonth(-1)}>← 上月</button>
          <strong style={{ fontSize: 22, color: 'var(--blue)' }}>{year} 年 {month + 1} 月</strong>
          <button className="btn" onClick={() => moveMonth(1)}>下月 →</button>
          <button className="btn" onClick={() => setCurrentMonth(monthKey(new Date()))}>返回本月</button>
        </div>
        {/* 圖例 */}
        <div className="row" style={{ gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>🔵 旅團/支部自辦</span>
          <span style={{ fontSize: 13 }}>🟣 總會/地域/區主辦</span>
          {mode !== 'leader' && mode !== 'public' && (
            <>
              <span style={{ fontSize: 13 }}>✅ 已參加</span>
              <span style={{ fontSize: 13 }}>❤️ 有興趣</span>
              <span style={{ fontSize: 13 }}>❌ 不參加</span>
            </>
          )}
        </div>
      </section>

      {/* 月曆格 */}
      <section className="card" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: 8, minWidth: 760 }}>
          {['日','一','二','三','四','五','六'].map(w => <div key={w} className="muted" style={{ fontWeight: 800, textAlign: 'center' }}>{w}</div>)}
          {days.map(day => {
            const key = dateKey(day);
            const items = byDate.get(key) || [];
            const inMonth = day.getMonth() === month;
            const isToday = key === dateKey(new Date());
            return (
              <div key={key} style={{ minHeight: 120, border: '1px solid var(--line)', borderRadius: 14, padding: 10, background: inMonth ? 'white' : '#f1f5f9', opacity: inMonth ? 1 : .55 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ color: isToday ? 'var(--red)' : 'var(--blue)' }}>{day.getDate()}</strong>
                  {isToday && <span className="badge red">今天</span>}
                </div>
                <div className="stack" style={{ gap: 4 }}>
                  {items.slice(0, 3).map(e => {
                    const eId = e.id || e.eventId || '';
                    const color = getEventColor(e);
                    const bg = getEventColorBg(e);
                    const status = getStatusForEvent(eId);
                    const icon = statusIconFn ? statusIconFn(status) : (status === 'registered' ? '✅' : status === 'declined' ? '❌' : status === 'interested' ? '❤️' : '');

                    // 領袖模式：顯示連結
                    if (mode === 'leader') {
                      return (
                        <a key={eId} href={`/leader/registration?eventId=${encodeURIComponent(eId)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ borderRadius: 10, padding: '5px 8px', background: bg, border: `1px solid ${color}33`, fontSize: 12 }}>
                            <div style={{ fontWeight: 700, color }}>{e.title}</div>
                            <div style={{ fontSize: 11, color: '#666' }}>查看報名 →</div>
                          </div>
                        </a>
                      );
                    }

                    // 家長「全部」模式
                    if (mode === 'parent' && selectedChild === 'all' && parentChildren && childReplies) {
                      const childIcons = parentChildren.map(child => {
                        const cId = child.memberId || child.id || '';
                        const cName = (child.name || child.nameChinese || '').slice(0, 2);
                        const childStatus = childReplies.get(cId)?.get(eId) || '';
                        const ci = childStatus === 'registered' ? '✅' : childStatus === 'declined' ? '❌' : childStatus === 'interested' ? '❤️' : '';
                        return ci ? `${cName}${ci}` : '';
                      }).filter(Boolean);
                      return (
                        <div key={eId} style={{ borderRadius: 10, padding: '5px 8px', background: bg, border: `1px solid ${color}33`, fontSize: 12 }}>
                          <div style={{ fontWeight: 700, color }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{childIcons.join(' ')}</div>
                        </div>
                      );
                    }

                    // 成員/家長單一子女
                    return (
                      <div key={eId} style={{ borderRadius: 10, padding: '5px 8px', background: bg, border: `1px solid ${color}33`, fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color }}>{e.title}</div>
                        {icon && <div style={{ fontSize: 13, marginTop: 2 }}>{icon}</div>}
                      </div>
                    );
                  })}
                  {items.length > 3 && <span className="muted" style={{ fontSize: 11 }}>+{items.length - 3} 項</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 列表視圖 */}
      <section className="card stack">
        <h2>活動清單</h2>
        {events.length === 0 && <p className="muted">沒有符合條件的活動。</p>}
        {events.map(e => {
          const eId = e.id || e.eventId || '';
          const color = getEventColor(e);
          const bg = getEventColorBg(e);
          const sourceLabel = getEventSourceLabel(e);
          const status = getStatusForEvent(eId);
          const icon = statusIconFn ? statusIconFn(status) : (status === 'registered' ? '✅' : status === 'declined' ? '❌' : status === 'interested' ? '❤️' : '');

          return (
            <div key={eId} className="card" style={{ boxShadow: 'none', borderLeft: `4px solid ${color}` }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: bg, color }}>{sourceLabel}</span>
                    {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
                    {mode === 'parent' && selectedChild === 'all' && parentChildren && childReplies && (
                      <div className="row" style={{ gap: 6 }}>
                        {parentChildren.map(child => {
                          const cId = child.memberId || child.id || '';
                          const cName = (child.name || child.nameChinese || '').slice(0, 2);
                          const childStatus = childReplies.get(cId)?.get(eId) || '';
                          const ci = childStatus === 'registered' ? '✅' : childStatus === 'declined' ? '❌' : childStatus === 'interested' ? '❤️' : '';
                          return ci ? <span key={cId} style={{ fontSize: 12, background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{cName}{ci}</span> : null;
                        })}
                      </div>
                    )}
                  </div>
                  <h3>{e.title}</h3>
                  <p className="muted">{e.date} · {e.location} · {branchName(e.branchId)} · 費用：{e.fee || '-'}</p>
                </div>
                {mode === 'leader' && (
                  <a href={`/leader/registration?eventId=${encodeURIComponent(eId)}`} className="btn primary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                    查看報名 →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

// ==================== 主頁面 ====================

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashData, setDashData] = useState<any>(null);
  const [replies, setReplies] = useState<ReplyMap>(new Map());

  const user = getUser();
  const role = user?.role || '';
  const isMember = role === 'member';
  const isParent = role === 'parent';
  const isLeader = ['super_admin', 'admin', 'group_leader', 'branch_leader', 'coach'].includes(role);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [
          fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' }).then(r => r.json()),
        ];
        if (user) {
          promises.push(
            fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' }).then(r => r.json())
          );
        }
        const [calData, dashRes] = await Promise.all(promises);

        if (calData.success && calData.data) {
          const normalized = (calData.data.events || []).map((e: any) => ({
            ...e,
            date: normalizeDate(e.date),
            endDate: e.endDate ? normalizeDate(e.endDate) : undefined,
          }));
          setEvents(normalized);
          setBranches(calData.data.branches || []);
        }

        if (dashRes?.success) {
          setDashData(dashRes.data);
          // 成員：建立 replyMap
          if (dashRes.data?.eventReplies) {
            const map = new Map<string, string>();
            dashRes.data.eventReplies.forEach((r: any) => {
              if (r.eventId) map.set(r.eventId, r.type || 'interested');
            });
            setReplies(map);
          }
        }
      } catch (err: any) {
        setError(err.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  const branchId = user?.branchId || '';

  // 根據角色渲染不同行事曆
  if (isMember) {
    return <MemberCalendar events={events} replyMap={replies} branchId={dashData?.member?.branchId || branchId} />;
  }

  if (isParent) {
    const children = dashData?.children || [];
    return <ParentCalendar events={events} children={children} userId={user?.userId || ''} />;
  }

  if (isLeader) {
    return <LeaderCalendar events={events} branchId={branchId} userId={user?.userId || ''} />;
  }

  // 未登入：公開行事曆
  return <PublicCalendar events={events} />;
}

// ==================== 公開行事曆 ====================

function PublicCalendar({ events }: { events: CalendarEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(() => monthKey(new Date()));
  const today = new Date().toISOString().slice(0, 10);

  const pubEvents = useMemo(() => events.filter(e => {
    if (e.status !== 'published' && e.status !== 'active') return false;
    if ((e.date || '') < today) return false;
    return true;
  }), [events, today]);

  return <CalendarGrid events={pubEvents} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} mode="public" />;
}
