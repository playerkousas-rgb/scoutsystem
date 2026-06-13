'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getData, registerParentAccount, submitLeaderApplication, type AppData } from '@/lib/troupeStore';

type ApplyType = 'parent' | 'leader' | 'member';

export default function ApplyPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [done, setDone] = useState(false);
  const [type, setType] = useState<ApplyType>('parent');
  const [form, setForm] = useState({ name: '', email: '', phone: '', branchId: '', requestedRole: 'branch_leader' as 'group_leader' | 'branch_leader' | 'coach', ymNumbers: '', childNames: '', notes: '' });

  useEffect(() => {
    const d = getData();
    const queryType = new URLSearchParams(window.location.search).get('type') as ApplyType | null;
    if (queryType === 'parent' || queryType === 'leader' || queryType === 'member') setType(queryType);
    setData(d);
    setForm(f => ({ ...f, branchId: d.branches[0]?.id || '' }));
  }, []);

  if (!data) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'parent') {
      registerParentAccount(form.name.trim(), form.email.trim(), form.ymNumbers.split(/[\n,， ]+/).filter(Boolean), form.phone.trim());
    } else if (type === 'leader') {
      submitLeaderApplication({ name: form.name, email: form.email, phone: form.phone, branchId: form.branchId, requestedRole: form.requestedRole, experience: form.notes || '申請加入 ScoutSystem 使用。正式身份以總會登記為準。' });
    } else {
      // UI prototype: 成員申請正式接 Apps Script 後會寫入 Applications。
      submitLeaderApplication({ name: form.name, email: form.email, phone: form.phone, branchId: form.branchId, requestedRole: 'coach', experience: `成員帳戶申請；YMIS：${form.ymNumbers}；備註：${form.notes}` });
    }
    setDone(true);
  };

  return <div className="split">
    <section className="card stack">
      <span className="badge gold">申請加入系統</span>
      <h2>統一申請頁</h2>
      <p className="muted">為方便手機使用，家長、領袖 / 教練員、成員申請合併在同一頁。這只是申請使用 ScoutSystem，正式身份仍以總會 / YMIS 登記為準。</p>

      {done ? <div className="stack"><div className="notice">申請已提交。批核後才可登入相關頁面。</div><div className="row"><Link className="btn primary" href="/login">返回登入</Link><Link className="btn" href="/">返回首頁</Link></div></div> : <form className="stack" onSubmit={submit}>
        <label><span className="label">申請類型</span><select className="select" value={type} onChange={e => setType(e.target.value as ApplyType)}><option value="parent">家長帳戶</option><option value="leader">領袖 / 教練員帳戶</option><option value="member">成員帳戶</option></select></label>
        <label><span className="label">姓名 *</span><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">電話 *</span><input className="input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span className="label">電郵 / 登入帳戶 *</span><input className="input" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>

        {(type === 'leader' || type === 'member') && <label><span className="label">相關支部</span><select className="select" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })}>{data.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>}
        {type === 'leader' && <label><span className="label">希望使用身份</span><select className="select" value={form.requestedRole} onChange={e => setForm({ ...form, requestedRole: e.target.value as any })}><option value="group_leader">團長</option><option value="branch_leader">支部領袖</option><option value="coach">教練員</option></select></label>}
        {(type === 'parent' || type === 'member') && <label><span className="label">{type === 'parent' ? '子女 YMIS / 成員編號 *' : '自己的 YMIS / 成員編號 *'}</span><textarea className="textarea" required value={form.ymNumbers} onChange={e => setForm({ ...form, ymNumbers: e.target.value })} placeholder="可多個，以空格、逗號或換行分隔" /></label>}
        {type === 'parent' && <label><span className="label">子女姓名，可不填</span><textarea className="textarea" value={form.childNames} onChange={e => setForm({ ...form, childNames: e.target.value })} /></label>}
        <label><span className="label">備註，可留空</span><textarea className="textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
        <button className="btn primary" type="submit">提交申請</button>
      </form>}
    </section>
    <aside className="card"><h3>簡化原則</h3><ul className="muted"><li>同一頁完成所有帳戶申請。</li><li>手機使用時不用在多個頁面之間切換。</li><li>正式批核紀錄日後統一寫入 Applications。</li></ul></aside>
  </div>;
}
