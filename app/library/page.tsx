'use client';

import { useEffect, useState } from 'react';
import { type LibraryBookmarkStatus } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
const LIBRARY_URL = 'https://scout-circulars.vercel.app/';

const statusLabel: Record<LibraryBookmarkStatus, string> = {
  new: '待處理', following: '適合跟進', not_applicable: '不適用', converted: '已轉活動草稿', published: '已發布', archived: '已封存'
};

type BookmarkItem = {
  id: string;
  circularKey: string;
  title: string;
  sourceSite?: string;
  region?: string;
  circularDate?: string;
  sourceUrl?: string;
  attachmentUrl?: string;
  officialDeadline?: string;
  targetText?: string;
  fee?: string;
  status: LibraryBookmarkStatus;
  branchTags?: string[];
  audienceTags?: string[];
  activityType?: string;
  internalDeadline?: string;
  notes?: string;
};

export default function LibraryPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<LibraryBookmarkStatus | 'all'>('all');
  const [branch, setBranch] = useState('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getPublicLibraryBookmarks`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.data) {
            setBookmarks(data.data);
            setConnected(true);
          } else {
            setError(data.error || '載入失敗');
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || '無法連線');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = bookmarks
    .filter(b => status === 'all' || b.status === status)
    .filter(b => branch === 'all' || (b.branchTags || []).includes(branch))
    .sort((a, b) => String(a.internalDeadline || a.officialDeadline || '').localeCompare(String(b.internalDeadline || b.officialDeadline || '')));

  const branchTags = Array.from(new Set(bookmarks.flatMap(b => b.branchTags || []))).filter(Boolean);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  return (
    <div className="stack">
      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ 無法連接後端：{error}</p>
          <p className="muted">若持續出錯，請檢查 Apps Script 是否已重新部署（Deploy → New deployment）。</p>
        </section>
      )}
      {connected && !error && (
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <p style={{ color: 'var(--green)' }}>🟢 已連接 Google Sheet · 共 {bookmarks.length} 筆書籤</p>
        </section>
      )}
      <section className="hero">
        <span className="badge gold">本旅通告圖書館</span>
        <h1>領袖已標記通告</h1>
        <p>
          這裡不是重新顯示全港最新通告，而是顯示領袖從「全港童軍通告自動化圖書館」中按本旅需要挑選、收藏及標記的通告。
          原圖書館按日期提供最新消息；ScoutSystem 內的圖書館則按本旅需要、支部、對象及處理狀態整理。
        </p>
        <div className="row">
          <a className="btn primary" href={LIBRARY_URL} target="_blank">開啟全港通告圖書館</a>
          <a className="btn" href="/library/import?title=測試通告&sourceSite=圖書館測試&region=測試地域&attachmentUrl=https://scout-circulars.vercel.app/&deadline=2026-07-01&audience=領袖&fee=$0">測試加入流程</a>
        </div>
      </section>
      <section className="grid">
        <div className="card"><span className="badge blue">本旅收藏</span><h2>{bookmarks.length}</h2><p className="muted">領袖標記後才會出現在這裡</p></div>
        <div className="card"><span className="badge gold">待處理 / 跟進</span><h2>{bookmarks.filter(b => ['new', 'following'].includes(b.status)).length}</h2><p className="muted">需要領袖判斷是否轉活動</p></div>
        <div className="card"><span className="badge green">已發布 / 已轉活動</span><h2>{bookmarks.filter(b => ['converted', 'published'].includes(b.status)).length}</h2><p className="muted">已進入本旅流程</p></div>
      </section>
      <section className="card row">
        <strong>篩選：</strong>
        <select className="select" style={{ width: 220 }} value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="all">全部狀態</option>
          <option value="new">待處理</option>
          <option value="following">適合跟進</option>
          <option value="not_applicable">不適用</option>
          <option value="converted">已轉活動草稿</option>
          <option value="published">已發布</option>
          <option value="archived">已封存</option>
        </select>
        <select className="select" style={{ width: 220 }} value={branch} onChange={e => setBranch(e.target.value)}>
          <option value="all">全部支部</option>
          {branchTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </section>
      <section className="card stack">
        <h2>本旅已標記通告</h2>
        {!filtered.length && <p className="muted">暫時沒有符合條件的標記通告。</p>}
        {filtered.map(b => (
          <div key={b.id} className="card" style={{ boxShadow: 'none' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className={b.status === 'not_applicable' ? 'badge red' : b.status === 'published' ? 'badge green' : 'badge gold'}>{statusLabel[b.status]}</span>
                <h3 style={{ marginBottom: 6 }}>{b.title}</h3>
                <p className="muted">{b.region || '-'} · {b.sourceSite || '-'} · 官方截止：{b.officialDeadline || '-'} · 本旅截止：{b.internalDeadline || '-'}</p>
              </div>
              <div className="row">
                {b.attachmentUrl && <a className="btn" target="_blank" href={b.attachmentUrl}>開啟附件</a>}
                {b.sourceUrl && <a className="btn" target="_blank" href={b.sourceUrl}>來源</a>}
              </div>
            </div>
            <p className="muted">支部：{(b.branchTags || []).join('、') || '-'}　對象：{(b.audienceTags || []).join('、') || '-'}　類型：{b.activityType || '-'}</p>
            {b.notes && <p>{b.notes}</p>}
          </div>
        ))}
      </section>
      <section className="card stack">
        <h2>接入方式</h2>
        <p className="muted">全港圖書館負責搜尋最新消息；ScoutSystem 只接收領袖選中的通告。加入 / 標記仍需要領袖或後台登入。</p>
        <code style={{ whiteSpace: 'pre-wrap' }}>{`{ScoutSystem網址}/library/import?title=...&sourceSite=...&region=...&date=...&attachmentUrl=...&deadline=...&audience=...&fee=...`}</code>
      </section>
    </div>
  );
}
