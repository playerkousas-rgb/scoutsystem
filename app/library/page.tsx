'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { getData, roleLabel, type AppData, type LibraryBookmarkStatus } from '@/lib/troupeStore';

const LIBRARY_URL = 'https://scout-circulars.vercel.app/';
const statusLabel: Record<LibraryBookmarkStatus, string> = {
  new: '待處理', following: '適合跟進', not_applicable: '不適用', converted: '已轉活動草稿', published: '已發布', archived: '已封存'
};

export default function LibraryPage() {
  return <AuthGate title="圖書館頁面需要登入"><LibraryInner /></AuthGate>;
}

function LibraryInner() {
  const [data, setData] = useState<AppData | null>(null);
  useEffect(() => setData(getData()), []);

  return <div className="stack">
    <section className="hero">
      <span className="badge gold">全港童軍通告自動化圖書館</span>
      <h1>接入 Scout Circulars 圖書館</h1>
      <p>
        你的圖書館繼續負責搜尋全港通告；ScoutSystem 只做本旅標記、收藏、轉活動草稿。
        方式 B：圖書館每張通告加「加入 ScoutSystem」按鈕，把通告資料帶到 <code>/library/import</code>。
      </p>
      <div className="row">
        <a className="btn primary" href={LIBRARY_URL} target="_blank">開啟圖書館</a>
        <a className="btn" href="/library/import?title=測試通告&sourceSite=圖書館測試&region=測試地域&attachmentUrl=https://scout-circulars.vercel.app/&deadline=2026-07-01&audience=領袖&fee=$0">測試加入流程</a>
      </div>
    </section>

    <section className="grid">
      <div className="card"><h3>圖書館端</h3><p className="muted">設定 ScoutSystem 網址，然後每張通告可按「加入 ScoutSystem」。</p></div>
      <div className="card"><h3>ScoutSystem 端</h3><p className="muted">接收 URL parameters，顯示確認頁，讓領袖標記支部、對象、負責人及本旅截止。</p></div>
      <div className="card"><h3>多旅團支援</h3><p className="muted">每個領袖在圖書館瀏覽器 localStorage 設定自己的 ScoutSystem 網址，不需要中央名單。</p></div>
    </section>

    <section className="card stack">
      <h2>本旅收藏通告</h2>
      {!data?.libraryBookmarks?.length && <p className="muted">尚未有收藏通告。</p>}
      {data?.libraryBookmarks?.map(b => <div key={b.id} className="card" style={{ boxShadow: 'none' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}><strong>{b.title}</strong><span className={b.status === 'not_applicable' ? 'badge red' : b.status === 'published' ? 'badge green' : 'badge gold'}>{statusLabel[b.status]}</span></div>
        <p className="muted">{b.region || '-'} · {b.sourceSite || '-'} · 官方截止：{b.officialDeadline || '-'} · 本旅截止：{b.internalDeadline || '-'}</p>
        <p className="muted">支部：{b.branchTags.join('、') || '-'}　對象：{b.audienceTags.join('、') || '-'}　類型：{b.activityType || '-'}</p>
        <p>{b.notes}</p>
        <div className="row">
          {b.attachmentUrl && <a className="btn" target="_blank" href={b.attachmentUrl}>開啟附件</a>}
          <span className="muted">負責人：{data.users.find(u => u.id === b.ownerUserId)?.name || '-'}</span>
        </div>
      </div>)}
    </section>

    <section className="card stack">
      <h2>圖書館端需要加入的資料</h2>
      <p className="muted">不需要 JSON API。只要按鈕跳到以下網址格式：</p>
      <code style={{ whiteSpace: 'pre-wrap' }}>{`{ScoutSystem網址}/library/import?title=...&sourceSite=...&region=...&date=...&attachmentUrl=...&deadline=...&audience=...&fee=...`}</code>
    </section>
  </div>;
}
