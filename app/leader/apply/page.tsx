'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getData, roleLabel, submitLeaderApplication, type AppData } from '@/lib/troupeStore';

export default function LeaderApplyPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', requestedRole: 'branch_leader' as 'group_leader' | 'branch_leader' | 'coach', branchId: '', experience: '' });

  useEffect(() => { const d = getData(); setData(d); setForm(f => ({ ...f, branchId: d.branches[0]?.id || '' })); }, []);
  if (!data) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaderApplication(form);
    setDone(true);
  };

  return <div className="split">
    <section className="card stack">
      <span className="badge gold">領袖頁面帳戶申請</span>
      <h2>團長 / 支部領袖 / 教練員申請</h2>
      <p className="muted">申請團長會由管理員或超級管理員批核；申請支部領袖或教練員會由相關支部團長批核。</p>
      {done ? <div className="stack"><div className="notice">申請已提交。請用管理員或團長身份到控制台查看批核流程。</div><div className="row"><Link className="btn primary" href="/admin">後台批核</Link><Link className="btn" href="/leader">領袖頁面</Link></div></div> : <form className="stack" onSubmit={submit}>
        <label><span className="label">姓名</span><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">Email / 帳戶</span><input className="input" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        <label><span className="label">電話</span><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <div className="grid">
          <label><span className="label">申請身份</span><select className="select" value={form.requestedRole} onChange={e => setForm({ ...form, requestedRole: e.target.value as any })}><option value="group_leader">團長</option><option value="branch_leader">支部領袖</option><option value="coach">教練員</option></select></label>
          <label><span className="label">支部</span><select className="select" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })}>{data.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        </div>
        <label><span className="label">經驗 / 備註</span><textarea className="textarea" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} /></label>
        <button className="btn primary" type="submit">提交申請</button>
      </form>}
    </section>
    <aside className="card"><h3>批核規則</h3><table className="table"><tbody><tr><th>{roleLabel.group_leader}</th><td>管理員 / 超級管理員批核</td></tr><tr><th>{roleLabel.branch_leader}</th><td>相關支部團長批核</td></tr><tr><th>{roleLabel.coach}</th><td>相關支部團長批核</td></tr></tbody></table></aside>
  </div>;
}
