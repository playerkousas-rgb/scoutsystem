'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

type ApplyType = 'parent' | 'leader' | 'member' | 'admin';

const BRANCHES = [
  { id: 'b1', name: '小童軍支部' },
  { id: 'b2', name: '幼童軍支部' },
  { id: 'b3', name: '童軍支部' },
  { id: 'b4', name: '深資童軍支部' },
  { id: 'b5', name: '樂行童軍支部' },
];

const LEADER_ROLES = [
  { value: 'group_leader', label: '團長' },
  { value: 'branch_leader', label: '支部領袖' },
  { value: 'coach', label: '教練員' },
  { value: 'admin', label: '管理員' },
];

export default function ApplyPage() {
  const router = useRouter();
  const [type, setType] = useState<ApplyType>('parent');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState('b1');
  const [role, setRole] = useState('group_leader');
  const [ymNumbers, setYmNumbers] = useState('');
  const [childNames, setChildNames] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let url = '';
      if (type === 'parent') {
        url = APPS_SCRIPT_URL
          + '?action=registerParent'
          + '&name=' + encodeURIComponent(name)
          + '&email=' + encodeURIComponent(email)
          + '&phone=' + encodeURIComponent(phone)
          + '&branchId=' + encodeURIComponent(branchId)
          + '&childYmNumbers=' + encodeURIComponent(ymNumbers)
          + '&childNames=' + encodeURIComponent(childNames)
          + '&notes=' + encodeURIComponent(notes);
      } else {
        url = APPS_SCRIPT_URL
          + '?action=applyLeader'
          + '&name=' + encodeURIComponent(name)
          + '&email=' + encodeURIComponent(email)
          + '&phone=' + encodeURIComponent(phone)
          + '&role=' + encodeURIComponent(role)
          + '&branchId=' + encodeURIComponent(type === 'admin' ? '' : branchId)
          + '&experience=' + encodeURIComponent(notes);
        if (type === 'member') {
          url += '&ymNumbers=' + encodeURIComponent(ymNumbers);
        }
      }

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || '提交失敗');
      }
    } catch (err: any) {
      setError(err.message || '連線失敗，請確認已連接網絡');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="stack" style={{ maxWidth: 480, margin: '60px auto' }}>
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <span className="badge green">申請已提交</span>
          <h2>提交成功</h2>
          <p className="muted">你的申請已提交，請等待管理員或團長審批。審批通過後即可用電郵登入。</p>
          <button className="btn primary" onClick={() => router.push('/login')}>前往登入</button>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 480, margin: '60px auto' }}>
      <section className="card">
        <h1>申請加入系統</h1>
        <p className="muted">統一申請頁面。家長、領袖、成員、管理員均可在此申請。正式身份以總會 / YMIS 登記為準。</p>

        <form onSubmit={handleSubmit} className="stack">
          <div>
            <label className="block text-sm font-medium mb-1">申請類型</label>
            <select className="select w-full" value={type} onChange={e => setType(e.target.value as ApplyType)}>
              <option value="parent">家長帳戶</option>
              <option value="leader">領袖 / 教練員帳戶</option>
              <option value="member">成員帳戶</option>
              <option value="admin">管理員帳戶</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">姓名 *</label>
            <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電郵 *</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電話</label>
            <input className="w-full border rounded-lg px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {type !== 'admin' && (
            <div>
              <label className="block text-sm font-medium mb-1">所屬支部</label>
              <select className="select w-full" value={branchId} onChange={e => setBranchId(e.target.value)}>
                {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {(type === 'leader' || type === 'admin') && (
            <div>
              <label className="block text-sm font-medium mb-1">希望使用身份</label>
              <select className="select w-full" value={role} onChange={e => setRole(e.target.value)}>
                {LEADER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          )}

          {(type === 'parent' || type === 'member') && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {type === 'parent' ? '子女 YMIS / 成員編號 *' : '自己的 YMIS / 成員編號 *'}
              </label>
              <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={ymNumbers} onChange={e => setYmNumbers(e.target.value)} placeholder="可多個，以空格、逗號或換行分隔" required />
            </div>
          )}

          {type === 'parent' && (
            <div>
              <label className="block text-sm font-medium mb-1">子女姓名（可留空）</label>
              <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={childNames} onChange={e => setChildNames(e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">備註 / 經驗（可留空）</label>
            <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={type === 'leader' || type === 'admin' ? '簡述你的童軍經驗...' : '其他備註...'} />
          </div>

          {error && (
            <div className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
              <p style={{ color: 'var(--red)' }}>{error}</p>
            </div>
          )}

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? '提交中...' : '提交申請'}
          </button>
        </form>

        <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
          <a href="/login" className="btn">已有帳戶？登入</a>
          <a href="/" className="btn">返回首頁</a>
        </div>
      </section>
    </div>
  );
}
