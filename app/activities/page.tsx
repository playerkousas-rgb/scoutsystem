'use client';

import { useEffect, useMemo, useState } from 'react';
import EventReplyButton from '@/components/EventReplyButton';

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

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) return JSON.parse(raw);
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

type ActivityItem = {
  id: string;
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
  isLibrary?: boolean;
  circularKey?: string;
  sourceUrl?: string;
  attachmentUrl?: string;
  officialDeadline?: string;
  internalDeadline?: string;
  activityType?: string;
  branchTags?: string[];
};

export default function ActivitiesPage() {
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<typeof TABS[number]>('全部');
  const [branch, setBranch] = useState('all');
  const user = getUser();

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
              date: normalizeDate(b.internalDeadline || b.officialDeadline || b.circularDate || ''),
              location: b.sourceSite || b.region || '全港',
              description: b.notes || '本旅已標記通告，請向領袖查詢詳情。',
              status: b.status || 'published',
              scope: 'troop',
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
        if (e.isLibrary) return (e.branchTags || []).includes(branch);
        const bName = branches.find((b: any) => b.id === e.branchId)?.name || '';
        return bName === branch || bName.replace('支部', '') === branch || bName.includes(branch);
      })
      .filter(e => !e.isLibrary || isFutureEvent(e.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, tab, branch, branches]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  return (
    <div className="stack">
      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>無法連接後端：{error}</p>
        </section>
      )}
      {connected && !error && (
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <p style={{ color: 'var(--green)' }}>已連接 Google Sheet · 共 {events.length} 筆活動及通告</p>
        </section>
      )}
      <section className="hero">
        <span className="badge blue">公開活動</span>
        <h1>旅或支部未來活動</h1>
        <p>集中展示旅、支部活動，以及本旅已標記的全港通告。按 ❤️ 有興趣、💰 已報名。</p>
        <div className="row">
          {TABS.map(t => (
            <button key={t} className={`btn ${tab === t ? 'primary' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </section>
      <section className="card row">
        <strong>支部：</strong>
        <button className={`btn ${branch === 'all' ? 'primary' : ''}`} onClick={() => setBranch('all')}>全部</button>
        {BRANCHES.map(b => (
          <button key={b} className={`btn ${branch === b ? 'primary' : ''}`} onClick={() => setBranch(branch === b ? 'all' : b)}>
            {b}
          </button>
        ))}
      </section>
      <section className="card stack">
        {filteredEvents.map(e => (
          <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div>
                  <span className="badge blue">{e.isLibrary ? '通告' : e.scope === 'troop' ? '旅活動' : e.scope === 'branch' ? '支部活動' : '外部活動'}</span>
                  {e.source === 'scout_library' && <span className="badge gold">童軍圖書館</span>}
                  <h3 style={{ marginTop: 4, marginBottom: 0 }}>{e.title}</h3>
                </div>
              </div>
              <strong>{e.date}</strong>
            </div>
            <p className="muted">
              {e.date} · {e.location}
              · 費用：{e.fee || '-'}
              {e.isLibrary && e.activityType && ` · 類型：${e.activityType}`}
            </p>
            <p>{e.description}</p>
            {e.isLibrary && e.attachmentUrl && (
              <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                <a href={e.attachmentUrl} target="_blank" className="btn primary">開啟附件</a>
                {e.sourceUrl && <a href={e.sourceUrl} target="_blank" className="btn">來源</a>}
              </div>
            )}
            {/* 報名按鈕（後端持久化） */}
            {user && <EventReplyButton eventId={e.id} />}
          </div>
        ))}
        {!filteredEvents.length && <p className="muted">目前沒有符合條件的活動或通告。</p>}
      </section>
    </div>
  );
}
