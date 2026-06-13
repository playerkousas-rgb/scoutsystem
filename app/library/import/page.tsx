'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { adminRoles, getCurrentUser, getData, leaderRoles, roleLabel, upsertLibraryBookmark, type AppData, type LibraryBookmarkStatus } from '@/lib/troupeStore';

const statusOptions: Array<{ value: LibraryBookmarkStatus; label: string }> = [
  { value: 'new', label: '待處理' },
  { value: 'following', label: '適合跟進' },
  { value: 'not_applicable', label: '不適用' },
  { value: 'converted', label: '已轉活動草稿' },
  { value: 'published', label: '已發布' },
];

function getParam(name: string) {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(name) || '';
}

export default function LibraryImportPage() {
  return <AuthGate roles={[...adminRoles, ...leaderRoles]} title="加入圖書館通告需要領袖或後台登入"><ImportInner /></AuthGate>;
}

function ImportInner() {
  const [data, setData] = useState<AppData | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: '', sourceSite: '', region: '', circularDate: '', sourceUrl: '', attachmentUrl: '', officialDeadline: '', targetText: '', fee: '',
    status: 'new' as LibraryBookmarkStatus,
    branchTags: [] as string[], audienceTags: [] as string[], activityType: '', internalDeadline: '', ownerUserId: '', notes: '',
  });

  useEffect(() => {
    const d = getData();
    const user = getCurrentUser();
    setData(d);
    setForm(f => ({
      ...f,
      title: getParam('title'),
      sourceSite: getParam('sourceSite') || getParam('source_site'),
      region: getParam('region'),
      circularDate: getParam('date') || getParam('capturedDate'),
      sourceUrl: getParam('sourceUrl') || getParam('url'),
      attachmentUrl: getParam('attachmentUrl') || getParam('pdf_url') || getParam('pdfUrl'),
      officialDeadline: getParam('deadline') || getParam('officialDeadline'),
      targetText: getParam('target') || getParam('audience'),
      fee: getParam('fee'),
      ownerUserId: user?.id || '',
      branchTags: guessBranches(getParam('target') || getParam('audience'), d.branches.map(b => b.shortName)),
      audienceTags: guessAudience(getParam('target') || getParam('audience')),
    }));
  }, []);

  const circularKey = useMemo(() => {
    const raw = form.attachmentUrl || form.sourceUrl || `${form.sourceSite}|${form.title}|${form.circularDate}`;
    return raw.trim();
  }, [form]);

  if (!data) return null;

  const toggle = (field: 'branchTags' | 'audienceTags', value: string) => {
    setForm(f => ({ ...f, [field]: f[field].includes(value) ? f[field].filter(x => x !== value) : [...f[field], value] }));
  };

  const save = () => {
    const user = getCurrentUser();
    upsertLibraryBookmark({
      circularKey,
      title: form.title || '未命名通告',
      sourceSite: form.sourceSite,
      region: form.region,
      circularDate: form.circularDate,
      sourceUrl: form.sourceUrl,
      attachmentUrl: form.attachmentUrl || form.sourceUrl,
      officialDeadline: form.officialDeadline,
      targetText: form.targetText,
      fee: form.fee,
      status: form.status,
      branchTags: form.branchTags,
      audienceTags: form.audienceTags,
      activityType: form.activityType,
      internalDeadline: form.internalDeadline,
      ownerUserId: form.ownerUserId,
      notes: form.notes,
      createdBy: user?.id,
    });
    setSaved(true);
  };

  return <div className="split">
    <section className="card stack">
      <span className="badge gold">由通告圖書館加入</span>
      <h2>確認加入本旅收藏</h2>
      <p className="muted">圖書館按鈕會把通告基本資料帶到這頁；領袖只需要確認標記，不需要操作 Google Sheet。</p>
      {saved && <div className="notice">已加入本旅收藏。下一步可以在圖書館頁查看收藏，或稍後轉成活動草稿。</div>}

      <div className="card" style={{ boxShadow: 'none' }}>
        <span className="badge blue">{form.region || '未有地域'} · {form.sourceSite || '未有來源'}</span>
        <h3>{form.title || '未收到標題'}</h3>
        <p className="muted">日期：{form.circularDate || '-'}　官方截止：{form.officialDeadline || '-'}　對象：{form.targetText || '-'}　費用：{form.fee || '-'}</p>
        <div className="row">
          {form.attachmentUrl && <a className="btn" target="_blank" href={form.attachmentUrl}>開啟附件</a>}
          {form.sourceUrl && <a className="btn" target="_blank" href={form.sourceUrl}>開啟來源</a>}
        </div>
      </div>

      <label><span className="label">處理狀態</span><select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LibraryBookmarkStatus })}>{statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      <label><span className="label">活動類型</span><select className="select" value={form.activityType} onChange={e => setForm({ ...form, activityType: e.target.value })}><option value="">未分類</option><option>訓練班</option><option>比賽</option><option>服務</option><option>專章</option><option>會議</option><option>行政</option><option>其他</option></select></label>
      <label><span className="label">本旅內部截止日期</span><input className="input" type="date" value={form.internalDeadline} onChange={e => setForm({ ...form, internalDeadline: e.target.value })} /></label>
      <label><span className="label">負責人</span><select className="select" value={form.ownerUserId} onChange={e => setForm({ ...form, ownerUserId: e.target.value })}>{data.users.filter(u => [...adminRoles, ...leaderRoles].includes(u.role)).map(u => <option key={u.id} value={u.id}>{u.name} · {roleLabel[u.role]}</option>)}</select></label>

      <div>
        <span className="label">適用支部</span>
        <div className="row">{['全旅', ...data.branches.map(b => b.shortName)].map(tag => <button key={tag} className={`btn ${form.branchTags.includes(tag) ? 'primary' : ''}`} onClick={() => toggle('branchTags', tag)}>{tag}</button>)}</div>
      </div>
      <div>
        <span className="label">對象</span>
        <div className="row">{['成員', '家長', '領袖', '團長'].map(tag => <button key={tag} className={`btn ${form.audienceTags.includes(tag) ? 'primary' : ''}`} onClick={() => toggle('audienceTags', tag)}>{tag}</button>)}</div>
      </div>
      <label><span className="label">備註</span><textarea className="textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
      <div className="row"><button className="btn primary" onClick={save}>加入本旅收藏</button><button className="btn gold" onClick={() => { setForm({ ...form, status: 'converted' }); save(); }}>加入並標記為活動草稿</button><Link className="btn" href="/library">返回圖書館</Link></div>
    </section>
    <aside className="card stack">
      <h3>接入方式 B</h3>
      <p className="muted">圖書館不用 API，只要在每張通告加「加入 ScoutSystem」按鈕，把資料放入 URL parameters 帶到此頁即可。</p>
      <code style={{ whiteSpace: 'pre-wrap' }}>{`/library/import?title=...&sourceSite=...&region=...&pdf_url=...&deadline=...&audience=...&fee=...`}</code>
    </aside>
  </div>;
}

function guessAudience(text: string) {
  const out: string[] = [];
  if (/領袖|團長|教練/.test(text)) out.push('領袖');
  if (/家長|親子/.test(text)) out.push('家長');
  if (/小童軍|幼童軍|童軍|深資|樂行|成員/.test(text)) out.push('成員');
  return out;
}

function guessBranches(text: string, branchShortNames: string[]) {
  const out: string[] = [];
  for (const b of branchShortNames) if (text.includes(b)) out.push(b);
  if (/全旅|所有|全體/.test(text)) out.push('全旅');
  return out;
}
