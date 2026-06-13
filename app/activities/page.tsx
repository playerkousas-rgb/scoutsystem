'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { getBranchName, getData, isFutureEvent, type AppData, type EventScope } from '@/lib/troupeStore';

const scopeLabel: Record<EventScope | 'all', string> = { all: '全部', troop: '旅活動', branch: '支部活動', hq: '總部', region: '地域', district: '區', training: '訓練班' };

export default function ActivitiesPage() {
  return <AuthGate title="活動頁面需要登入"><ActivitiesInner /></AuthGate>;
}

function ActivitiesInner() {
  const [data, setData] = useState<AppData | null>(null);
  const [scope, setScope] = useState<EventScope | 'all'>('all');
  useEffect(() => setData(getData()), []);
  const events = useMemo(() => (data?.events || []).filter(isFutureEvent).filter(e => scope === 'all' || e.scope === scope).sort((a, b) => a.date.localeCompare(b.date)), [data, scope]);
  if (!data) return null;
  return <div className="stack">
    <section className="hero"><span className="badge gold">活動頁面</span><h1>旅或支部未來活動</h1><p>集中展示旅、支部、總部、地域區及訓練班活動。童軍圖書館接入會在下一階段以資料同步或連結方式加入。</p></section>
    <section className="card row"><strong>篩選：</strong>{(Object.keys(scopeLabel) as Array<EventScope | 'all'>).map(k => <button key={k} className={`btn ${scope === k ? 'primary' : ''}`} onClick={() => setScope(k)}>{scopeLabel[k]}</button>)}</section>
    <section className="grid">{events.map(e => <div className="card" key={e.id}><span className={e.source === 'scout_library' ? 'badge gold' : 'badge blue'}>{scopeLabel[e.scope]}{e.source === 'scout_library' ? ' · 童軍圖書館接口示範' : ''}</span><h3>{e.title}</h3><p className="muted">{e.date} · {e.location}</p><p>{e.description}</p><p className="muted">對象：{getBranchName(data, e.branchId)}　費用：{e.fee || '-'}</p></div>)}</section>
  </div>;
}
