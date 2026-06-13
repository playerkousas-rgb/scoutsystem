'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBranchName, type AppData, type EventScope } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const scopeLabel: Record<EventScope | 'all', string> = {
  all: '全部', troop: '旅活動', branch: '支部活動', hq: '總部', region: '地域', district: '區', training: '訓練班'
};

const BRANCHES = ['全旅', '小童軍', '幼童軍', '童軍', '深資童軍', '樂行童軍'];

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
};

export default function ActivitiesPage() {
  const [events, setEvents] = useState<ActivityItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [scope, setScope] = useState<EventScope | 'all'>('all');
  const [branch, setBranch] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // 同時載入 Events + LibraryBookmarks
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
              date: b.internalDeadline || b.officialDeadline || '',
              location: b.sourceSite || b.region || '全港',
              description: b.notes || '本旅已標記通告，請向領袖查詢詳情。',
              status: b.status,
              scope: 'troop' as EventScope,
              source: 'library',
              isLibrary: true,
              circularKey: b.circularKey,
              sourceUrl: b.sourceUrl,
              attachmentUrl: b.attachmentUrl,
              fee: b.fee,
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
      .filter(e => e.status === 'published' || e.status === 'active' || e.status === 'following' || !e.status)
      .filter(e => !e.isLibrary || isFutureEvent(e.date))
      .filter(e => scope === 'all' || e.scope === scope)
      .filter(e => branch === 'all' || (e.isLibrary ? true : e.scope === 'branch' && getBranchName({ branches } as AppData, e.branchId) === branch))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, scope, branch, branches]);

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
        <p>集中展示旅、支部、總部、地域區及訓練班活動，以及本旅已標記的全港通告。無需登入即可查看。</p>
        <div className="row">
          <strong>篩選：</strong>
          {(Object.keys(scopeLabel) as Array<EventScope | 'all'>).map(k => (
            <button key={k} className={`btn ${scope === k ? 'primary' : ''}`} onClick={() => setScope(k)}>{scopeLabel[k]}</button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
          <strong>支部：</strong>
          <button className={`btn ${branch === 'all' ? 'primary' : ''}`} onClick={() => setBranch('all')}>全部</button>
          {BRANCHES.map(b => (
            <button key={b} className={`btn ${branch === b ? 'primary' : ''}`} onClick={() => setBranch(b)}>{b}</button>
          ))}
        </div>
      </section>
      <section className="card stack">
        {filteredEvents.map(e => (
          <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="badge blue">{scopeLabel[e.scope]}</span>
                {e.isLibrary && <span className="badge gold">通告</span>}
                {e.source === 'scout_library' && <span className="badge gold">童軍圖書館</span>}
                <h3>{e.title}</h3>
              </div>
              <strong>{e.date}</strong>
            </div>
            <p className="muted">
              {e.date} · {e.location}
              {e.isLibrary ? '' : ` · ${getBranchName({ branches } as AppData, e.branchId)}`}
              · 費用：{e.fee || '-'}
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
        {!filteredEvents.length && <p className="muted">目前沒有符合條件的未來活動。</p>}
      </section>
    </div>
  );
}
