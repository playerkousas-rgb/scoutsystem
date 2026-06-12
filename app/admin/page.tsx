'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  canSeeBranch,
  createEventWithReplies,
  getBranchName,
  getCurrentUser,
  getData,
  getReplySummary,
  isFutureEvent,
  roleLabel,
  saveData,
  setCurrentUser,
  uid,
  visibleBranchesFor,
  type AppData,
  type EventStatus,
  type User,
} from '@/lib/troupeStore';

export default function AdminPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();
  const [tab, setTab] = useState<'dashboard' | 'events' | 'members' | 'parents'>('dashboard');

  useEffect(() => {
    const d = getData();
    const current = getCurrentUser() || d.users.find(u => u.role !== 'parent' && u.approved !== false);
    if (current) setCurrentUser(current.id);
    setData(d);
    setUser(current);
  }, []);

  if (!data || !user) return <LoginHint />;
  if (user.role === 'parent') return <LoginHint message="目前登入身份是家長，請切換到管理端帳號。" />;

  const adminUsers = data.users.filter(u => u.role !== 'parent' && u.approved !== false);
  const branches = visibleBranchesFor(user, data);
  const branchIds = new Set(branches.map(b => b.id));
  const scopedMembers = data.members.filter(m => branchIds.has(m.branchId));
  const scopedEvents = data.events.filter(e => branchIds.has(e.branchId));
  const futureEvents = scopedEvents.filter(isFutureEvent).sort((a, b) => a.date.localeCompare(b.date));
  const pendingParents = data.users.filter(u => u.role === 'parent' && u.approved === false);

  const switchUser = (id: string) => {
    const next = data.users.find(u => u.id === id);
    setCurrentUser(id);
    setUser(next);
  };

  const approveParent = (id: string) => {
    const next = { ...data, users: data.users.map(u => u.id === id ? { ...u, approved: true } : u) };
    saveData(next);
    setData(next);
  };

  return (
    <div className="stack">
      <section className="card row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="badge blue">管理後台 · {roleLabel[user.role]}</span>
          <h2 style={{ marginBottom: 4 }}>{user.name}</h2>
          <p className="muted">權限範圍：{user.role === 'commissioner' ? '全旅' : getBranchName(data, user.branchId)}</p>
        </div>
        <div className="row">
          <select className="select" style={{ width: 240 }} value={user.id} onChange={e => switchUser(e.target.value)}>
            {adminUsers.map(u => <option key={u.id} value={u.id}>{u.name} · {roleLabel[u.role]}</option>)}
          </select>
          <Link className="btn" href="/login">切換登入</Link>
        </div>
      </section>

      <nav className="row">
        <button className={`btn ${tab === 'dashboard' ? 'primary' : ''}`} onClick={() => setTab('dashboard')}>總覽</button>
        <button className={`btn ${tab === 'events' ? 'primary' : ''}`} onClick={() => setTab('events')}>活動管理</button>
        <button className={`btn ${tab === 'members' ? 'primary' : ''}`} onClick={() => setTab('members')}>成員資料庫</button>
        <button className={`btn ${tab === 'parents' ? 'primary' : ''}`} onClick={() => setTab('parents')}>家長審核</button>
      </nav>

      {tab === 'dashboard' && <Dashboard data={data} futureEvents={futureEvents} scopedMembers={scopedMembers} pendingParents={pendingParents} />}
      {tab === 'events' && <EventsPanel data={data} setData={setData} user={user} branches={branches} members={scopedMembers} futureEvents={futureEvents} />}
      {tab === 'members' && <MembersPanel data={data} setData={setData} user={user} branches={branches} members={scopedMembers} />}
      {tab === 'parents' && <ParentsPanel data={data} approveParent={approveParent} />}
    </div>
  );
}

function Dashboard({ data, futureEvents, scopedMembers, pendingParents }: { data: AppData; futureEvents: any[]; scopedMembers: any[]; pendingParents: User[] }) {
  const pendingReplies = data.replies.filter(r => futureEvents.some(e => e.id === r.eventId) && r.status === 'pending').length;
  return (
    <section className="grid">
      <div className="card"><span className="badge blue">未來活動</span><h2>{futureEvents.length}</h2><p className="muted">預設隱藏過期 / 歸檔活動</p></div>
      <div className="card"><span className="badge">成員</span><h2>{scopedMembers.length}</h2><p className="muted">依角色權限範圍計算</p></div>
      <div className="card"><span className="badge gold">待回覆</span><h2>{pendingReplies}</h2><p className="muted">家長尚未提交活動回覆</p></div>
      <div className="card"><span className="badge red">待審家長</span><h2>{pendingParents.length}</h2><p className="muted">註冊後需後台核准</p></div>
    </section>
  );
}

function EventsPanel({ data, setData, user, branches, members, futureEvents }: { data: AppData; setData: (d: AppData) => void; user: User; branches: any[]; members: any[]; futureEvents: any[] }) {
  const [step, setStep] = useState(1);
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [fee, setFee] = useState('$0');
  const [quota, setQuota] = useState('');
  const [description, setDescription] = useState('');
  const [targetIds, setTargetIds] = useState<string[]>([]);

  const branchMembers = members.filter(m => m.branchId === branchId);

  const toggle = (id: string) => setTargetIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const selectAll = () => setTargetIds(branchMembers.map(m => m.id));

  const publish = () => {
    const next = createEventWithReplies(data, {
      branchId,
      title,
      date,
      location,
      fee,
      quota: quota ? Number(quota) : undefined,
      description,
      status: 'published' as EventStatus,
      targetMemberIds: targetIds,
      createdBy: user.id,
    });
    saveData(next);
    setData(next);
    setStep(1); setTitle(''); setLocation(''); setDescription(''); setTargetIds([]);
  };

  return (
    <div className="split">
      <section className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div><span className="badge gold">3 步驟新增活動</span><h3>新增並發布活動</h3></div>
          <span className="badge blue">Step {step}/3</span>
        </div>

        {step === 1 && (
          <div className="stack">
            <label><span className="label">支部</span><select className="select" value={branchId} onChange={e => { setBranchId(e.target.value); setTargetIds([]); }}>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select></label>
            <label><span className="label">活動名稱</span><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：露營技能訓練日" /></label>
            <div className="grid">
              <label><span className="label">日期</span><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
              <label><span className="label">地點</span><input className="input" value={location} onChange={e => setLocation(e.target.value)} /></label>
              <label><span className="label">名額</span><input className="input" value={quota} onChange={e => setQuota(e.target.value)} /></label>
              <label><span className="label">費用</span><input className="input" value={fee} onChange={e => setFee(e.target.value)} /></label>
            </div>
            <label><span className="label">活動說明</span><textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} /></label>
            <button className="btn primary" disabled={!title || !branchId || !date} onClick={() => setStep(2)}>下一步：選擇成員</button>
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <div className="row"><button className="btn" onClick={selectAll}>選擇本支部全部成員</button><span className="muted">已選 {targetIds.length} 人</span></div>
            <table className="table"><tbody>
              {branchMembers.map(m => <tr key={m.id}><td><input type="checkbox" checked={targetIds.includes(m.id)} onChange={() => toggle(m.id)} /></td><td>{m.name}</td><td>{m.patrol}</td><td>{m.parentUserId ? <span className="badge green">有家長</span> : <span className="badge red">未綁定</span>}</td></tr>)}
            </tbody></table>
            <div className="row"><button className="btn" onClick={() => setStep(1)}>上一步</button><button className="btn primary" disabled={targetIds.length === 0} onClick={() => setStep(3)}>下一步：確認發布</button></div>
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            <div className="notice">發布後系統會為每位目標成員建立「待回覆」紀錄，並為已綁定家長建立通知佇列。外部 Email / WhatsApp 可於下一階段接上。</div>
            <table className="table"><tbody>
              <tr><th>活動</th><td>{title}</td></tr><tr><th>日期</th><td>{date}</td></tr><tr><th>支部</th><td>{getBranchName(data, branchId)}</td></tr><tr><th>目標成員</th><td>{targetIds.length} 人</td></tr>
            </tbody></table>
            <div className="row"><button className="btn" onClick={() => setStep(2)}>上一步</button><button className="btn primary" onClick={publish}>發布活動</button></div>
          </div>
        )}
      </section>

      <section className="card stack">
        <h3>未來活動與報名統計</h3>
        {futureEvents.map(event => {
          const s = getReplySummary(event.id, data);
          return <div className="card" style={{ boxShadow: 'none' }} key={event.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}><strong>{event.title}</strong><span className="badge blue">{getBranchName(data, event.branchId)}</span></div>
            <p className="muted">{event.date} · {event.location}</p>
            <div className="kpi"><div className="box"><strong>{s.total}</strong>總數</div><div className="box"><strong>{s.yes}</strong>出席</div><div className="box"><strong>{s.no}</strong>不出席</div><div className="box"><strong>{s.pending}</strong>未覆</div></div>
          </div>;
        })}
      </section>
    </div>
  );
}

function MembersPanel({ data, setData, user, branches, members }: { data: AppData; setData: (d: AppData) => void; user: User; branches: any[]; members: any[] }) {
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [ymNumber, setYmNumber] = useState('');

  const addMember = () => {
    if (!name || !branchId || !canSeeBranch(user, branchId)) return;
    const next = { ...data, members: [{ id: uid('m'), name, branchId, ymNumber, patrol: '', emergencyPhone: '' }, ...data.members] };
    saveData(next); setData(next); setName(''); setYmNumber('');
  };

  return <section className="card stack"><h3>成員資料庫</h3>
    <div className="grid"><input className="input" placeholder="成員姓名" value={name} onChange={e => setName(e.target.value)} /><input className="input" placeholder="成員編號" value={ymNumber} onChange={e => setYmNumber(e.target.value)} /><select className="select" value={branchId} onChange={e => setBranchId(e.target.value)}>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select><button className="btn primary" onClick={addMember}>新增成員</button></div>
    <table className="table"><thead><tr><th>姓名</th><th>支部</th><th>小隊</th><th>編號</th><th>家長</th></tr></thead><tbody>{members.map(m => <tr key={m.id}><td>{m.name}</td><td>{getBranchName(data, m.branchId)}</td><td>{m.patrol || '-'}</td><td>{m.ymNumber || '-'}</td><td>{m.parentUserId ? data.users.find(u => u.id === m.parentUserId)?.name : <span className="badge red">未綁定</span>}</td></tr>)}</tbody></table>
  </section>;
}

function ParentsPanel({ data, approveParent }: { data: AppData; approveParent: (id: string) => void }) {
  const parents = data.users.filter(u => u.role === 'parent');
  return <section className="card stack"><h3>家長註冊審核</h3><p className="muted">核准後，家長才能登入家長入口查看已綁定成員。</p><table className="table"><thead><tr><th>姓名</th><th>Email</th><th>綁定成員</th><th>狀態</th><th></th></tr></thead><tbody>{parents.map(p => <tr key={p.id}><td>{p.name}</td><td>{p.email}</td><td>{data.members.filter(m => m.parentUserId === p.id).map(m => m.name).join('、') || '-'}</td><td>{p.approved === false ? <span className="badge gold">待審</span> : <span className="badge green">已核准</span>}</td><td>{p.approved === false && <button className="btn green" onClick={() => approveParent(p.id)}>核准</button>}</td></tr>)}</tbody></table></section>;
}

function LoginHint({ message = '請先登入管理端帳號。' }: { message?: string }) {
  return <div className="card stack"><h2>{message}</h2><Link className="btn primary" href="/login">前往登入</Link></div>;
}
