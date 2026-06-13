'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBranchName, getData, isFutureEvent, type AppData, type EventScope } from '@/lib/troupeStore';

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

export default function CalendarPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => monthKey(new Date()));
  const [scope, setScope] = useState<EventScope | 'all'>('all');

  useEffect(() => setData(getData()), []);

  const events = useMemo(() => {
    if (!data) return [];
    return data.events
      .filter(e => e.status === 'published' && isFutureEvent(e))
      .filter(e => scope === 'all' || e.scope === scope)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, scope]);

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

  const byDate = new Map<string, typeof events>();
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

  if (!data) return null;

  return <div className="stack">
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
      {(Object.keys(scopeLabel) as EventScope[]).map(k => <button key={k} className={`btn ${scope === k ? 'primary' : ''}`} onClick={() => setScope(k)}>{scopeLabel[k]}</button>)}
    </section>

    <section className="card" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: 8, minWidth: 760 }}>
        {['日', '一', '二', '三', '四', '五', '六'].map(w => <div key={w} className="muted" style={{ fontWeight: 800, textAlign: 'center' }}>{w}</div>)}
        {days.map(day => {
          const key = dateKey(day);
          const items = byDate.get(key) || [];
          const inMonth = day.getMonth() === month;
          const isToday = key === dateKey(new Date());
          return <div key={key} style={{ minHeight: 120, border: '1px solid var(--line)', borderRadius: 14, padding: 10, background: inMonth ? 'white' : '#f1f5f9', opacity: inMonth ? 1 : .55 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ color: isToday ? 'var(--red)' : 'var(--blue)' }}>{day.getDate()}</strong>
              {isToday && <span className="badge red">今天</span>}
            </div>
            <div className="stack" style={{ gap: 6 }}>
              {items.slice(0, 3).map(e => <div key={e.id} style={{ borderRadius: 10, padding: '7px 8px', background: '#f8fafc', border: '1px solid var(--line)' }}>
                <span className={scopeClass[e.scope]}>{scopeLabel[e.scope]}</span>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}>{e.title}</div>
              </div>)}
              {items.length > 3 && <span className="muted">+{items.length - 3} 項</span>}
            </div>
          </div>;
        })}
      </div>
    </section>

    <section className="card stack">
      <h2>未來活動清單</h2>
      {events.map(e => <div className="card" style={{ boxShadow: 'none' }} key={e.id}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div><span className={scopeClass[e.scope]}>{scopeLabel[e.scope]}</span><h3>{e.title}</h3></div>
          <strong>{e.date}</strong>
        </div>
        <p className="muted">{e.location} · {getBranchName(data, e.branchId)} · 費用：{e.fee || '-'}</p>
        <p>{e.description}</p>
      </div>)}
      {!events.length && <p className="muted">目前沒有符合條件的未來活動。</p>}
    </section>
  </div>;
}
