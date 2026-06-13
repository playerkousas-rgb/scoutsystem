'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getData, roleLabel, submitLeaderApplication, type AppData } from '@/lib/troupeStore';

export default function SystemApplyPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', requestedRole: 'branch_leader' as 'group_leader' | 'branch_leader' | 'coach', branchId: '', experience: '' });

  useEffect(() => { const d = getData(); setData(d); setForm(f => ({ ...f, branchId: d.branches[0]?.id || '' })); }, []);
  if (!data) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaderApplication({ ...form, experience: form.experience || '申請加入 ScoutSystem 使用。正式領袖 / 成員資格以總會登記為準。' });
    setDone(true);
  };

  return <div className="split">
    <section className="card stack">
      <span className="badge gold">申請加入系統</span>
      <h2>系統帳戶申請</h2>
      <p className="muted">這裡只是申請使用 ScoutSystem，不代表正式成為領袖、教練員或成員。正式身份仍以總會 / YMIS 登記為準。</p>
      {done ? <div className="stack"><div className="notice">申請已提交。批核後才可登入相關頁面。</div><div className="row"><Link className="btn primary" href="/login">返回登入</Link><Link className="btn" href="/">返回首頁</Link></div></div> : <form className="stack" onSubmit={submit}>
        <label><span className="label">姓名</span><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">Email / 帳戶</span><input className="input" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        <label><span className="label">電話</span><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <div className="grid">
          <label><span className="label">希望使用身份</span><select className="select" value={form.requestedRole} onChange={e => setForm({ ...form, requestedRole: e.target.value as any })}><option value="group_leader">團長</option><option value="branch_leader">支部領袖</option><option value="coach">教練員</option></select></label>
          <label><span className="label">相關支部</span><select className="select" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })}>{data.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        </div>
        <label><span className="label">備註，可留空</span><textarea className="textarea" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="例如：協助某支部活動、需要查看通告等" /></label>
        <button className="btn primary" type="submit">提交系統帳戶申請</button>
      </form>}
    </section>
    <aside className="card"><h3>批核規則</h3><table className="table"><tbody><tr><th>{roleLabel.group_leader}</th><td>管理員 / 超級管理員批核</td></tr><tr><th>{roleLabel.branch_leader}</th><td>相關支部團長批核</td></tr><tr><th>{roleLabel.coach}</th><td>相關支部團長批核</td></tr></tbody></table><hr /><p className="muted">日後如果要加入成員帳戶申請，可用同一流程，只是批核人及可見頁面不同。</p></aside>
  </div>;
}
