'use client';

import { useEffect, useMemo, useState } from 'react';
import { type EventScope } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const scopeLabel: Record<EventScope, string> = {
  troop: '全旅', branch: '支部', hq: '總部', region: '地域', district: '區', training: '訓練班'
};

const scopeClass: Record<EventScope, string> = {
  troop: 'badge blue', branch: 'badge green', hq: 'badge gold', region: 'badge gold', district: 'badge gold', training: 'badge'
};

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

function normalizeDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') {
    // 兼容 ISO 格式如 2026-06-15T00:00:00.000Z
    return value.slice(0, 10);
  }
  return String(value);
}

function getBranchName(branches: { id: string; name: string }[], branchId?: string) {
  if (!branchId) return '全旅 / 外部活動';
  return branches.find(b => b.id === branchId)?.name || '未指定';
}

type CalendarItem = {
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
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => monthKey(new Date()));
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
            // 標準化日期格式（兼容 ISO 或 yyyy-MM-dd）
            const normalizedEvents = (data.data.events || []).map((e: any) => ({
              ...e,
              date: normalizeDate(e.date),
              endDate: e.endDate ? normalizeDate(e.endDate) : undefined,
            }));
            setEvents(normalizedEvents);
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

  const isFutureEvent = (e: CalendarItem) => e.status !== 'archived' && e.date >= new Date().toISOString().slice(0, 10);

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => e.status === 'published' && isFutureEvent(e))
      .filter(e => scope === 'all' || e.scope === scope)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, scope]);

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

  const byDate = new Map<string, typeof filteredEvents>();
  filteredEvents.forEach(e => {
    const arr = byDate.get(e.date) || [];
    arr.push(e);
    byDate.set(e.date, arr);
  });

  const moveMonth = (delta: number) => {
    const d = parseLocalDate(`${currentMonth}-01`);
    d.setMonth(d.getMonth() + delta);
    setCurrentMonth(monthKey(d));
  };

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  return (
    <div className="stack">
      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ 無法連接後端：{error}</p>
          <p className="muted">若持續出錯，請檢查 Apps Script 是否已重新部署（Deploy → New deployment）。</p>
        </section>
      )}
      {connected && !error && (
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <p style={{ color: 'var(--green)' }}>🟢 已連接 Google Sheet · 共 {events.length} 筆活動</p>
        </section>
      )}
      <section className="hero">
        <span className="badge blue">公開行事曆</span>
        <h1>旅團活動行事曆</h1>
        <p>這個日曆只作公開查看用途，用來標記哪一天有活動。報名、回覆、付款和點名等行政流程仍在活動頁處理。</p>
        <div className="row">
          <button className="btn" onClick={() => moveMonth(-1)}>← 上月</button>
          <strong style={{ fontSize: 22, color: 'var(--blue)' }}>{year} 年 {month + 1} 月</strong>
          <button className="btn" onClick={() => moveMonth(1)}>下月 →</button>
          <button className="btn" onClick={() => setCurrentMonth(monthKey(new Date()))}>返回本月</button>
        </div>
      </section>
      <section className="card row">
        <strong>分類：</strong>
        <button className={`btn ${scope === 'all' ? 'primary' : ''}`} onClick={() => setScope('all')}>全部</button>
        {(Object.keys(scopeLabel) as EventScope[]).map(k => (
          <button key={k} className={`btn ${scope === k ? 'primary' : ''}`} onClick={() => setScope(k)}>{scopeLabel[k]}</button>
        ))}
      </section>
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
                <div className="stack" style={{ gap: 6 }}>
                  {items.slice(0, 3).map(e => (
                    <div key={e.id} style={{ borderRadius: 10, padding: '7px 8px', background: '#f8fafc', border: '1px solid var(--line)' }}>
                      <span className={scopeClass[e.scope]}>{scopeLabel[e.scope]}</span>
                      <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}>{e.title}</div>
                    </div>
                  ))}
                  {items.length > 3 && <span className="muted">+{items.length - 3} 項</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="card stack">
        <h2>未來活動清單</h2>
        {filteredEvents.map(e => (
          <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className={scopeClass[e.scope]}>{scopeLabel[e.scope]}</span>
                <h3>{e.title}</h3>
              </div>
              <strong>{e.date}</strong>
            </div>
            <p className="muted">{e.location} · {getBranchName(branches, e.branchId)} · 費用：{e.fee || '-'}</p>
            <p>{e.description}</p>
          </div>
        ))}
        {!filteredEvents.length && <p className="muted">目前沒有符合條件的未來活動。</p>}
      </section>
    </div>
  );
}
