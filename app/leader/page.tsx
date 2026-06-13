'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBranchName, getCurrentUser, getData, getReplySummary, isFutureEvent, leaderRoles, roleLabel, saveData, setCurrentUser, type AppData, type User } from '@/lib/troupeStore';

export default function LeaderPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    const d = getData();
    const current = getCurrentUser();
    if (current) setCurrentUser(current.id);
    setData(d); setUser(current);
  }, []);

  if (!data || !user || !leaderRoles.includes(user.role)) return <div className="card stack"><h2>請先登入領袖帳戶。</h2><Link className="btn primary" href="/login">前往登入</Link><Link className="btn gold" href="/leader/apply">申請領袖 / 教練員帳戶</Link></div>;

  const branch = data.branches.find(b => b.id === user.branchId);
  const members = data.members.filter(m => m.branchId === user.branchId);
  const events = data.events.filter(e => isFutureEvent(e) && (e.scope === 'troop' || e.branchId === user.branchId || !e.branchId));
  const applications = data.leaderApplications.filter(a => a.branchId === user.branchId && a.status === 'pending');
  const canApproveBranchStaff = user.role === 'group_leader';

  const approveStaff = (id: string) => {
    const app = data.leaderApplications.find(a => a.id === id);
    if (!app || !canApproveBranchStaff || app.requestedRole === 'group_leader') return;
    const next = {
      ...data,
      users: [{ id: `u_${Date.now()}`, name: app.name, email: app.email, password: 'temp123', role: app.requestedRole, branchId: app.branchId, approved: true, createdBy: user.id }, ...data.users],
      leaderApplications: data.leaderApplications.map(a => a.id === id ? { ...a, status: 'approved' as const, approvedBy: user.id } : a),
    };
    saveData(next); setData(next);
  };

  return <div className="stack">
    <section className="card row" style={{ justifyContent: 'space-between' }}>
      <div><span className="badge blue">領袖控制台 · {roleLabel[user.role]}</span><h2>{user.name}</h2><p className="muted">支部：{branch?.name}。你可以改動相關支部資料，並查看其他旅 / 外部公開活動。</p></div>
      <Link className="btn" href="/login">身份切換</Link>
    </section>

    <section className="grid">
      <div className="card"><span className="badge">本支部成員</span><h2>{members.length}</h2><p className="muted">{branch?.section}</p></div>
      <div className="card"><span className="badge gold">可見未來活動</span><h2>{events.length}</h2><p className="muted">支部 + 全旅 + 外部活動</p></div>
      <div className="card"><span className="badge red">待批核申請</span><h2>{canApproveBranchStaff ? applications.filter(a => a.requestedRole !== 'group_leader').length : 0}</h2><p className="muted">只有團長可批核本支部領袖 / 教練員</p></div>
    </section>

    <section className="split">
      <div className="card stack"><h3>本支部成員資料</h3><table className="table"><thead><tr><th>姓名</th><th>小隊</th><th>編號</th><th>級別</th><th>緊急電話</th></tr></thead><tbody>{members.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.patrol || '-'}</td><td>{m.ymNumber}</td><td>{m.rank || '-'}</td><td>{m.emergencyPhone || '-'}</td></tr>)}</tbody></table></div>
      <div className="card stack"><h3>支部領袖 / 教練員申請</h3>{canApproveBranchStaff ? applications.filter(a => a.requestedRole !== 'group_leader').map(a => <div key={a.id} className="card" style={{ boxShadow: 'none' }}><strong>{a.name}</strong><p className="muted">申請：{roleLabel[a.requestedRole]} · {a.email}</p><p>{a.experience}</p><button className="btn green" onClick={() => approveStaff(a.id)}>團長批核</button></div>) : <p className="muted">非團長身份只可查看，不能批核帳戶。</p>}</div>
    </section>

    <section className="card stack"><h3>活動與報名統計</h3>{events.map(event => { const s = getReplySummary(event.id, data); return <div key={event.id} className="card" style={{ boxShadow: 'none' }}><div className="row" style={{ justifyContent: 'space-between' }}><strong>{event.title}</strong><span className="badge blue">{getBranchName(data, event.branchId)}</span></div><p className="muted">{event.date} · {event.location}</p>{event.branchId === user.branchId && <div className="kpi"><div className="box"><strong>{s.total}</strong>總數</div><div className="box"><strong>{s.yes}</strong>出席</div><div className="box"><strong>{s.no}</strong>不出席</div><div className="box"><strong>{s.pending}</strong>未覆</div></div>}</div>; })}</section>
  </div>;
}
