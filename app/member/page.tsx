'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBranchName, getCurrentUser, getData, isFutureEvent, setCurrentUser, type AppData, type User } from '@/lib/troupeStore';

export default function MemberPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();
  useEffect(() => { const d = getData(); const current = getCurrentUser() || d.users.find(u => u.role === 'member'); if (current) setCurrentUser(current.id); setData(d); setUser(current); }, []);
  if (!data || !user || user.role !== 'member') return <div className="card stack"><h2>請先登入成員帳戶。</h2><Link className="btn primary" href="/login">前往登入</Link></div>;

  const member = data.members.find(m => m.id === user.memberId);
  const branchEvents = data.events.filter(e => isFutureEvent(e) && (e.scope === 'troop' || e.branchId === user.branchId || e.targetMemberIds.includes(user.memberId || '')));
  const branchLeaders = data.users.filter(u => u.branchId === user.branchId && ['group_leader', 'branch_leader', 'coach'].includes(u.role));

  return <div className="stack">
    <section className="card row" style={{ justifyContent: 'space-between' }}><div><span className="badge blue">成員頁面</span><h2>{member?.name || user.name}</h2><p className="muted">只查看自己支部資料及與自己相關活動。</p></div><Link className="btn" href="/login">身份切換</Link></section>
    <section className="grid">
      <div className="card"><h3>我的支部</h3><p>{getBranchName(data, user.branchId)}</p><p className="muted">{member?.patrol} · {member?.rank}</p></div>
      <div className="card"><h3>成員編號</h3><p>{member?.ymNumber}</p><p className="muted">日後不接外部 YMIS，只作內部記錄。</p></div>
      <div className="card"><h3>未來活動</h3><p style={{ fontSize: 32, margin: 0, color: 'var(--blue)' }}>{branchEvents.length}</p><p className="muted">支部 / 全旅活動</p></div>
    </section>
    <section className="split"><div className="card stack"><h3>支部領袖</h3><table className="table"><tbody>{branchLeaders.map(l => <tr key={l.id}><td>{l.name}</td><td>{l.email}</td></tr>)}</tbody></table></div><div className="card stack"><h3>我的活動</h3>{branchEvents.map(e => <div className="card" style={{ boxShadow: 'none' }} key={e.id}><strong>{e.title}</strong><p className="muted">{e.date} · {e.location}</p><p>{e.description}</p></div>)}</div></section>
  </div>;
}
