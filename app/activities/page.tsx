'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBranchName, type AppData, type EventScope } from '@/lib/troupeStore';

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

export default function ActivitiesPage() {
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<typeof TABS[number]>('全部');
  const [branch, setBranch] = useState('all');
  const [showStarred, setShowStarred] = useState(false);
  const [showHearted, setShowHearted] = useState(false);
  const [showCoined, setShowCoined] = useState(false);
  const [stars, setStars] = useState<Set<string>>(() => getMarkedIds('scout-activity-stars'));
  const [hearts, setHearts] = useState<Set<string>>(() => getMarkedIds('scout-activity-hearts'));
  const [coins, setCoins] = useState<Set<string>>(() => getMarkedIds('scout-activity-coins'));

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

  const toggleStar = (id: string) => {
    const next = new Set(stars);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setStars(next);
    saveMarkedIds('scout-activity-stars', next);
  };

  const toggleHeart = (id: string) => {
    const next = new Set(hearts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHearts(next);
    saveMarkedIds('scout-activity-hearts', next);
  };

  const toggleCoin = (id: string) => {
    const next = new Set(coins);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCoins(next);
    saveMarkedIds('scout-activity-coins', next);
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
        // For events, try to match branch name via branchId
        const bName = branches.find((b: any) => b.id === e.branchId)?.name || '';
        return bName === branch || bName.replace('支部', '') === branch || bName.includes(branch);
      })
      .filter(e => {
        if (!showStarred && !showHearted && !showCoined) return true;
        return (showStarred && stars.has(e.id)) || (showHearted && hearts.has(e.id)) || (showCoined && coins.has(e.id));
      })
      .filter(e => !e.isLibrary || isFutureEvent(e.date) || stars.has(e.id) || hearts.has(e.id) || coins.has(e.id))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, tab, branch, stars, hearts, coins, showStarred, showHearted, branches]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

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
        <p>集中展示旅、支部活動，以及本旅已標記的全港通告。標記 ⭐ 有興趣、❤️ 會參加、💰 已報名，即使通告過期也不會消失。</p>
        <div className="row">
          {TABS.map(t => (
            <button key={t} className={`btn ${tab === t ? 'primary' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </section>
      <section className="card row">
        <strong>篩選：</strong>
        <button className={`btn ${!showStarred && !showHearted && !showCoined ? 'primary' : ''}`} onClick={() => { setShowStarred(false); setShowHearted(false); setShowCoined(false); }}>全部</button>
        <button className={`btn ${showStarred ? 'primary' : ''}`} onClick={() => { setShowStarred(true); setShowHearted(false); }}>⭐ 已標星</button>
        <button className={`btn ${showHearted ? 'primary' : ''}`} onClick={() => { setShowStarred(false); setShowHearted(true); setShowCoined(false); }}>❤️ 會參加</button>
        <button className={`btn ${showCoined ? 'primary' : ''}`} onClick={() => { setShowStarred(false); setShowHearted(false); setShowCoined(true); }}>💰 已報名</button>
        <div className="row" style={{ gap: 6, marginLeft: 12, flexWrap: 'wrap' }}>
          {BRANCHES.map(b => (
            <button key={b} className={`btn ${branch === b ? 'primary' : ''}`} onClick={() => setBranch(branch === b ? 'all' : b)}>
              {b}
            </button>
          ))}
        </div>
      </section>
      <section className="card stack">
        {filteredEvents.map(e => (
          <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                  <button className="btn" style={{ fontSize: 18, padding: '0 4px' }} title="感興趣" onClick={() => toggleStar(e.id)}>
                    {stars.has(e.id) ? '⭐' : '☆'}
                  </button>
                  <button className="btn" style={{ fontSize: 18, padding: '0 4px' }} title="會參加" onClick={() => toggleHeart(e.id)}>
                    {hearts.has(e.id) ? '❤️' : '🤍'}
                  </button>
                  <button className="btn" style={{ fontSize: 18, padding: '0 4px' }} title="已報名" onClick={() => toggleCoin(e.id)}>
                    {coins.has(e.id) ? '💰' : '🪙'}
                  </button>
                  <div>
                    <span className="badge blue">{e.isLibrary ? '通告' : e.scope === 'troop' ? '旅活動' : e.scope === 'branch' ? '支部活動' : '外部活動'}</span>
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
        ))}
        {!filteredEvents.length && <p className="muted">目前沒有符合條件的活動或通告。</p>}
      </section>
    </div>
  );
}
