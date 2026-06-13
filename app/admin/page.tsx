'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminRoles, getBranchName, getCurrentUser, getData, getReplySummary, isFutureEvent, roleLabel, saveData, setCurrentUser, uid, visibleBranchesFor, type AppData, type Role, type User } from '@/lib/troupeStore';

export default function AdminPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();
  const [tab, setTab] = useState<'dashboard' | 'accounts' | 'approvals' | 'branches'>('dashboard');

  useEffect(() => {
    const d = getData();
    const current = getCurrentUser();
    if (current) setCurrentUser(current.id);
    setData(d);
    setUser(current);
  }, []);

  if (!data || !user) return <LoginHint />;
  if (!adminRoles.includes(user.role)) return <LoginHint message="此頁只供超級管理員 / 管理員使用。請切換身份。" />;

  const allAdmins = data.users.filter(u => adminRoles.includes(u.role));
  const futureEvents = data.events.filter(isFutureEvent);
  const pendingApplications = data.leaderApplications.filter(a => a.status === 'pending');
  const pendingParents = data.users.filter(u => u.role === 'parent' && u.approved === false);

  const switchUser = (id: string) => {
    const next = data.users.find(u => u.id === id);
    setCurrentUser(id);
    setUser(next);
  };

  const save = (next: AppData) => { saveData(next); setData(next); };

  const approveApplication = (id: string) => {
    const app = data.leaderApplications.find(a => a.id === id);
    if (!app) return;
    const newUser: User = { id: uid('u'), name: app.name, email: app.email, password: 'temp123', role: app.requestedRole, branchId: app.branchId, approved: true, createdBy: user.id };
    save({
      ...data,
      users: [newUser, ...data.users],
      leaderApplications: data.leaderApplications.map(a => a.id === id ? { ...a, status: 'approved', approvedBy: user.id } : a),
    });
  };

  const rejectApplication = (id: string) => save({ ...data, leaderApplications: data.leaderApplications.map(a => a.id === id ? { ...a, status: 'rejected', approvedBy: user.id } : a) });
  const approveParent = (id: string) => save({ ...data, users: data.users.map(u => u.id === id ? { ...u, approved: true } : u) });

  return (
    <div className="stack">
      <section className="card row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="badge blue">後台控制台 · {roleLabel[user.role]}</span>
          <h2 style={{ marginBottom: 4 }}>{user.name}</h2>
          <p className="muted">可查看及管理所有支部資料。超級管理員帳戶日後只可由 Google Sheet 初始化建立。</p>
        </div>
        <div className="row">
          <select className="select" style={{ width: 260 }} value={user.id} onChange={e => switchUser(e.target.value)}>
            {allAdmins.map(u => <option key={u.id} value={u.id}>{u.name} · {roleLabel[u.role]}</option>)}
          </select>
          <Link className="btn" href="/login">身份切換</Link>
        </div>
      </section>

      <nav className="row">
        <button className={`btn ${tab === 'dashboard' ? 'primary' : ''}`} onClick={() => setTab('dashboard')}>總覽</button>
        <button className={`btn ${tab === 'accounts' ? 'primary' : ''}`} onClick={() => setTab('accounts')}>管理員帳戶</button>
        <button className={`btn ${tab === 'approvals' ? 'primary' : ''}`} onClick={() => setTab('approvals')}>批核中心</button>
        <button className={`btn ${tab === 'branches' ? 'primary' : ''}`} onClick={() => setTab('branches')}>全支部資料</button>
      </nav>

      {tab === 'dashboard' && <Dashboard data={data} futureEvents={futureEvents} pendingApplications={pendingApplications.length} pendingParents={pendingParents.length} />}
      {tab === 'accounts' && <AdminAccounts data={data} user={user} save={save} />}
      {tab === 'approvals' && <Approvals data={data} approveApplication={approveApplication} rejectApplication={rejectApplication} approveParent={approveParent} />}
      {tab === 'branches' && <Branches data={data} user={user} />}
    </div>
  );
}

function Dashboard({ data, futureEvents, pendingApplications, pendingParents }: { data: AppData; futureEvents: any[]; pendingApplications: number; pendingParents: number }) {
  return <>
    <section className="grid">
      <div className="card"><span className="badge blue">支部數</span><h2>{data.branches.length}</h2><p className="muted">全旅支部</p></div>
      <div className="card"><span className="badge">總成員</span><h2>{data.members.length}</h2><p className="muted">所有支部成員</p></div>
      <div className="card"><span className="badge gold">未來活動</span><h2>{futureEvents.length}</h2><p className="muted">旅 / 支部 / 外部活動</p></div>
      <div className="card"><span className="badge red">待批核</span><h2>{pendingApplications + pendingParents}</h2><p className="muted">領袖申請 + 家長帳戶</p></div>
    </section>
    <section className="card stack">
      <h3>未來活動總覽</h3>
      {futureEvents.map(event => { const s = getReplySummary(event.id, data); return <div key={event.id} className="card" style={{ boxShadow: 'none' }}><div className="row" style={{ justifyContent: 'space-between' }}><strong>{event.title}</strong><span className="badge blue">{getBranchName(data, event.branchId)} / {event.scope}</span></div><p className="muted">{event.date} · {event.location}</p><div className="kpi"><div className="box"><strong>{s.total}</strong>總數</div><div className="box"><strong>{s.yes}</strong>出席</div><div className="box"><strong>{s.no}</strong>不出席</div><div className="box"><strong>{s.pending}</strong>未覆</div></div></div>; })}
    </section>
  </>;
}

function AdminAccounts({ data, user, save }: { data: AppData; user: User; save: (d: AppData) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const addAdmin = () => {
    if (!name || !email || !password || user.role !== 'super_admin') return;
    const newAdmin: User = { id: uid('u'), name, email, password, role: 'admin', approved: true, createdBy: user.id };
    save({ ...data, users: [newAdmin, ...data.users] });
    setName(''); setEmail(''); setPassword('');
  };

  const changeRole = (targetId: string, role: Role) => {
    if (user.role !== 'super_admin') return;
    save({
      ...data,
      users: data.users.map(u => u.id === targetId ? { ...u, role, branchId: adminRoles.includes(role) ? undefined : u.branchId } : u),
    });
  };

  return <section className="card stack">
    <h3>管理員帳戶設定</h3>
    <div className="notice">超級管理員：不能由前台申請，正式版會在 Google Sheet 直接初始化。管理員：由超級管理員在此建立，可登入後台並管理所有支部。</div>
    {user.role === 'super_admin' ? <div className="grid"><input className="input" placeholder="管理員姓名" value={name} onChange={e => setName(e.target.value)} /><input className="input" placeholder="Email / 帳戶" value={email} onChange={e => setEmail(e.target.value)} /><input className="input" placeholder="初始密碼" value={password} onChange={e => setPassword(e.target.value)} /><button className="btn primary" onClick={addAdmin}>建立管理員</button></div> : <p className="muted">只有超級管理員可建立管理員帳戶。</p>}
    <table className="table"><thead><tr><th>姓名</th><th>帳戶</th><th>身份</th><th>建立來源</th></tr></thead><tbody>{data.users.filter(u => adminRoles.includes(u.role)).map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><span className="badge blue">{roleLabel[u.role]}</span></td><td>{u.createdBy || '-'}</td></tr>)}</tbody></table>
    <h3>身份升級 / 移除下一級資格</h3>
    <p className="muted">當某人加入上一級單位，可用單一身份取代原本下一級身份，避免同一人同時持有多重衝突權限。</p>
    <table className="table"><thead><tr><th>人員</th><th>目前身份</th><th>支部</th><th>改為</th></tr></thead><tbody>{data.users.filter(u => u.role !== 'parent' && u.role !== 'member').map(u => <tr key={u.id}><td>{u.name}<br /><span className="muted">{u.email}</span></td><td>{roleLabel[u.role]}</td><td>{getBranchName(data, u.branchId)}</td><td><select className="select" value={u.role} disabled={user.role !== 'super_admin' || u.role === 'super_admin'} onChange={e => changeRole(u.id, e.target.value as Role)}><option value="admin">管理員</option><option value="group_leader">團長</option><option value="branch_leader">支部領袖</option><option value="coach">教練員</option></select></td></tr>)}</tbody></table>
  </section>;
}

function Approvals({ data, approveApplication, rejectApplication, approveParent }: { data: AppData; approveApplication: (id: string) => void; rejectApplication: (id: string) => void; approveParent: (id: string) => void }) {
  return <section className="card stack">
    <h3>批核中心</h3>
    <h4>領袖 / 教練員申請</h4>
    <table className="table"><thead><tr><th>申請人</th><th>申請身份</th><th>支部</th><th>經驗</th><th>狀態</th><th></th></tr></thead><tbody>{data.leaderApplications.map(a => <tr key={a.id}><td>{a.name}<br /><span className="muted">{a.email}</span></td><td>{roleLabel[a.requestedRole]}</td><td>{getBranchName(data, a.branchId)}</td><td>{a.experience || '-'}</td><td><span className={a.status === 'pending' ? 'badge gold' : a.status === 'approved' ? 'badge green' : 'badge red'}>{a.status}</span></td><td>{a.status === 'pending' && <div className="row"><button className="btn green" onClick={() => approveApplication(a.id)}>批核</button><button className="btn red" onClick={() => rejectApplication(a.id)}>拒絕</button></div>}</td></tr>)}</tbody></table>
    <h4>家長帳戶</h4>
    <table className="table"><tbody>{data.users.filter(u => u.role === 'parent').map(p => <tr key={p.id}><td>{p.name}</td><td>{p.email}</td><td>{data.members.filter(m => m.parentUserId === p.id).map(m => m.name).join('、') || '-'}</td><td>{p.approved === false ? <span className="badge gold">待審</span> : <span className="badge green">已核准</span>}</td><td>{p.approved === false && <button className="btn green" onClick={() => approveParent(p.id)}>核准</button>}</td></tr>)}</tbody></table>
  </section>;
}

function Branches({ data, user }: { data: AppData; user: User }) {
  const branches = visibleBranchesFor(user, data);
  return <section className="card stack"><h3>全支部資料</h3><div className="grid">{branches.map(b => <div key={b.id} className="card" style={{ boxShadow: 'none' }}><h3>{b.name}</h3><p className="muted">{b.section}</p><p>成員：{data.members.filter(m => m.branchId === b.id).length}　領袖：{data.users.filter(u => u.branchId === b.id && ['group_leader','branch_leader','coach'].includes(u.role)).length}</p></div>)}</div></section>;
}

function LoginHint({ message = '請先登入後台帳號。' }: { message?: string }) {
  return <div className="card stack"><h2>{message}</h2><Link className="btn primary" href="/login">前往登入</Link></div>;
}
