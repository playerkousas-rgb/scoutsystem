'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBranchName, type AppData, type EventScope } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const scopeLabel: Record<EventScope | 'all', string> = {
  all: '全部', troop: '旅活動', branch: '支部活動', hq: '總部', region: '地域', district: '區', training: '訓練班'
};

function normalizeDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value);
}

function isFutureEvent(date: string) {
  return date >= new Date().toISOString().slice(0, 10);
}

export default function ActivitiesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [scope, setScope] = useState<EventScope | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.data) {
            const normalized = (data.data.events || []).map((e: any) => ({
              ...e,
              date: normalizeDate(e.date),
            }));
            setEvents(normalized);
            setBranches(data.data.branches || []);
            setConnected(true);
          } else {
            setError(data.error || '載入失敗');
          }
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
      .filter((e: any) => e.status === 'published' && isFutureEvent(e.date))
      .filter((e: any) => scope === 'all' || e.scope === scope)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [events, scope]);

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
          <p style={{ color: 'var(--green)' }}>🟢 已連接 Google Sheet · 共 {events.length} 筆活動</p>
        </section>
      )}
      <section className="hero">
        <span className="badge blue">公開活動</span>
        <h1>旅或支部未來活動</h1>
        <p>集中展示旅、支部、總部、地域區及訓練班活動。無需登入即可查看。</p>
        <div className="row">
          <strong>篩選：</strong>
          {(Object.keys(scopeLabel) as Array<EventScope | 'all'>).map(k => (
            <button key={k} className={`btn ${scope === k ? 'primary' : ''}`} onClick={() => setScope(k)}>{scopeLabel[k]}</button>
          ))}
        </div>
      </section>
      <section className="card stack">
        {filteredEvents.map((e: any) => (
          <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className="badge blue">{scopeLabel[e.scope]}</span>
                {e.source === 'scout_library' && <span className="badge gold">童軍圖書館</span>}
                <h3>{e.title}</h3>
              </div>
              <strong>{e.date}</strong>
            </div>
            <p className="muted">{e.date} · {e.location} · {getBranchName({ branches } as AppData, e.branchId)} · 費用：{e.fee || '-'}</p>
            <p>{e.description}</p>
          </div>
        ))}
        {!filteredEvents.length && <p className="muted">目前沒有符合條件的未來活動。</p>}
      </section>
    </div>
  );
}
