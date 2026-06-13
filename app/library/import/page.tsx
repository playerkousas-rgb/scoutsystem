'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const BRANCHES = ['全旅', '小童軍', '幼童軍', '童軍', '深資'];
const AUDIENCES = ['成員', '家長', '領袖', '團長'];

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return { id: p.userId, name: p.name };
    }
  } catch {}
  try {
    const sid = localStorage.getItem('scout-system-session-v2');
    const d = JSON.parse(localStorage.getItem('scout-system-ui-v2') || '{}');
    const u = d?.users?.find((x: any) => x.id === sid);
    if (u) return { id: u.id, name: u.name };
  } catch {}
  return null;
}

function ImportForm() {
  const router = useRouter();
  const s = useSearchParams();

  const title = s.get('title') || '';
  const sourceSite = s.get('sourceSite') || '';
  const region = s.get('region') || '';
  const circularDate = s.get('date') || '';
  const sourceUrl = s.get('sourceUrl') || '';
  const attachmentUrl = s.get('attachmentUrl') || '';
  const officialDeadline = s.get('deadline') || '';
  const targetText = s.get('audience') || '';
  const fee = s.get('fee') || '';

  const [user] = useState(getUser);
  const [branches, setBranches] = useState<string[]>(['全旅']);
  const [audiences, setAudiences] = useState<string[]>(['領袖']);
  const [activityType, setActivityType] = useState('');
  const [internalDeadline, setInternalDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const toggle = (arr: string[], set: any, val: string) => {
    if (val === '全旅') { set(['全旅']); return; }
    set((prev: string[]) => {
      const next = prev.filter((p: string) => p !== '全旅');
      if (next.includes(val)) return next.filter((p: string) => p !== val);
      return [...next, val];
    });
  };

  const doSubmit = async () => {
    if (!user) { setMsg('請先登入'); return; }
    if (!title) { setMsg('缺少通告標題'); return; }

    setLoading(true);
    setMsg('');

    const circularKey = 'c-' + Date.now();
    const url = APPS_SCRIPT_URL
      + '?action=addLibraryBookmark'
      + '&circularKey=' + encodeURIComponent(circularKey)
      + '&title=' + encodeURIComponent(title)
      + '&sourceSite=' + encodeURIComponent(sourceSite)
      + '&region=' + encodeURIComponent(region)
      + '&circularDate=' + encodeURIComponent(circularDate)
      + '&sourceUrl=' + encodeURIComponent(sourceUrl)
      + '&attachmentUrl=' + encodeURIComponent(attachmentUrl)
      + '&officialDeadline=' + encodeURIComponent(officialDeadline)
      + '&targetText=' + encodeURIComponent(targetText)
      + '&fee=' + encodeURIComponent(fee)
      + '&status=published'
      + '&branchTags=' + encodeURIComponent(branches.join(','))
      + '&audienceTags=' + encodeURIComponent(audiences.join(','))
      + '&activityType=' + encodeURIComponent(activityType)
      + '&internalDeadline=' + encodeURIComponent(internalDeadline)
      + '&ownerUserId=' + encodeURIComponent(user.id)
      + '&notes=' + encodeURIComponent(notes)
      + '&createdBy=' + encodeURIComponent(user.id);

    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMsg('✅ 已加入本旅通告');
        setTimeout(() => router.push('/library'), 1500);
      } else {
        setMsg('❌ 加入失敗：' + (data.error || '未知錯誤'));
      }
    } catch (err: any) {
      setMsg('❌ 連線失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="stack" style={{ maxWidth: 600, margin: '60px auto' }}>
        <section className="card">
          <span className="badge red">需要登入</span>
          <h2>請先登入</h2>
          <p className="muted">只有領袖或管理員可以加入通告。</p>
          <a href="/login" className="btn primary">前往登入</a>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 720, margin: '0 auto' }}>
      <section className="hero">
        <span className="badge gold">加入本旅通告</span>
        <h1>{title || '新通告'}</h1>
        <p className="muted">{sourceSite} · {region} · 官方截止：{officialDeadline || '-'}</p>
        <div className="row" style={{ gap: 8 }}>
          {sourceUrl && <a href={sourceUrl} target="_blank" className="btn">開啟來源</a>}
          {attachmentUrl && <a href={attachmentUrl} target="_blank" className="btn primary">開啟附件</a>}
        </div>
      </section>

      <section className="card stack">
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label className="muted" style={{ fontSize: 13 }}>活動類型</label>
            <select className="select w-full" value={activityType} onChange={e => setActivityType(e.target.value)}>
              <option value="">未分類</option>
              <option value="訓練班">訓練班</option>
              <option value="服務日">服務日</option>
              <option value="營期">營期</option>
              <option value="比賽">比賽</option>
              <option value="集會">集會</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="muted" style={{ fontSize: 13 }}>本旅內部截止日期</label>
            <input type="date" className="w-full" value={internalDeadline} onChange={e => setInternalDeadline(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="muted" style={{ fontSize: 13 }}>適用支部</label>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {BRANCHES.map(b => (
              <button key={b} type="button" className={`btn ${branches.includes(b) ? 'primary' : ''}`} onClick={() => toggle(branches, setBranches, b)}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="muted" style={{ fontSize: 13 }}>對象</label>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {AUDIENCES.map(a => (
              <button key={a} type="button" className={`btn ${audiences.includes(a) ? 'primary' : ''}`} onClick={() => toggle(audiences, setAudiences, a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="muted" style={{ fontSize: 13 }}>備註</label>
          <textarea className="w-full" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="給其他領袖的內部備註..." />
        </div>

        <div className="muted" style={{ fontSize: 13 }}>負責人：{user.name}</div>
      </section>

      {msg && (
        <section className="card" style={msg.includes('✅') ? { background: '#f0fff4', border: '1px solid #ccffcc' } : { background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: msg.includes('✅') ? 'var(--green)' : 'var(--red)' }}>{msg}</p>
        </section>
      )}

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <a href="/library" className="btn">返回圖書館</a>
        <button className="btn primary" onClick={doSubmit} disabled={loading}>
          {loading ? '處理中...' : '加入本旅通告'}
        </button>
      </div>
    </div>
  );
}

export default function LibraryImportPage() {
  return (
    <Suspense fallback={<div className="stack" style={{ padding: 40 }}>載入中...</div>}>
      <ImportForm />
    </Suspense>
  );
}
