'use client';

import { useEffect, useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
const LIBRARY_URL = 'https://scout-circulars.vercel.app/';

const BRANCHES = ['全旅', '小童軍', '幼童軍', '童軍', '深資童軍', '樂行童軍'];

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
  status: string;
  branchTags?: string[];
  audienceTags?: string[];
  activityType?: string;
  internalDeadline?: string;
  notes?: string;
  ownerUserId?: string;
  createdBy?: string;
};

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return { id: p.userId, name: p.name, role: p.role };
    }
  } catch {}
  try {
    const sid = localStorage.getItem('scout-system-session-v2');
    const d = JSON.parse(localStorage.getItem('scout-system-ui-v2') || '{}');
    const u = d?.users?.find((x: any) => x.id === sid);
    if (u) return { id: u.id, name: u.name, role: u.role };
  } catch {}
  return null;
}

export default function LibraryPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [branch, setBranch] = useState('all');
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [delMsg, setDelMsg] = useState('');

  // 載入星標（localStorage 個人標記）
  useEffect(() => {
    const u = getUser();
    setUser(u);
    try {
      const raw = localStorage.getItem('scout-library-stars');
      if (raw) setStarred(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const saveStars = (ids: Set<string>) => {
    setStarred(new Set(ids));
    localStorage.setItem('scout-library-stars', JSON.stringify([...ids]));
  };

  const toggleStar = (id: string) => {
    const next = new Set(starred);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    saveStars(next);
  };

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

  const canManage = user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'group_leader');

  const deleteBookmark = async (id: string) => {
    if (!confirm('確定要刪除這個通告？')) return;
    setDelMsg('');
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=deleteLibraryBookmark&id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
        setDelMsg('✅ 已刪除');
      } else {
        setDelMsg('❌ 刪除失敗：' + (data.error || ''));
      }
    } catch (err: any) {
      setDelMsg('❌ 連線失敗');
    }
  };

  const updateNotes = async (id: string) => {
    if (!editNotes.trim()) return;
    try {
      const url = APPS_SCRIPT_URL
        + '?action=updateLibraryBookmark'
        + '&id=' + encodeURIComponent(id)
        + '&notes=' + encodeURIComponent(editNotes);
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setBookmarks(prev => prev.map(b => b.id === id ? { ...b, notes: editNotes } : b));
        setEditId(null);
        setEditNotes('');
      } else {
        alert('更新失敗：' + (data.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗');
    }
  };

  const filtered = bookmarks
    .filter(b => !showStarredOnly || starred.has(b.id))
    .filter(b => branch === 'all' || (b.branchTags || []).includes(branch))
    .sort((a, b) => String(a.internalDeadline || '').localeCompare(String(b.internalDeadline || '')));

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  return (
    <div className="stack">
      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ 無法連接後端：{error}</p>
        </section>
      )}
      {connected && !error && (
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <p style={{ color: 'var(--green)' }}>🟢 已連接 Google Sheet · 共 {bookmarks.length} 筆通告</p>
        </section>
      )}
      {delMsg && (
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <p style={{ color: 'var(--green)' }}>{delMsg}</p>
        </section>
      )}
      <section className="hero">
        <span className="badge gold">本旅通告圖書館</span>
        <h1>領袖已標記通告</h1>
        <p>這裡顯示領袖從全港童軍通告圖書館中挑選、收藏及標記的通告。你可以標記自己有興趣的通告。</p>
        <div className="row">
          <a className="btn primary" href={LIBRARY_URL} target="_blank">開啟全港通告圖書館</a>
        </div>
      </section>
      <section className="grid">
        <div className="card"><span className="badge blue">本旅收藏</span><h2>{bookmarks.length}</h2><p className="muted">領袖標記後才會出現在這裡</p></div>
        <div className="card"><span className="badge gold">已標星</span><h2>{starred.size}</h2><p className="muted">你感興趣的通告</p></div>
      </section>
      <section className="card row">
        <strong>篩選：</strong>
        <button className={`btn ${!showStarredOnly ? 'primary' : ''}`} onClick={() => setShowStarredOnly(false)}>全部</button>
        <button className={`btn ${showStarredOnly ? 'primary' : ''}`} onClick={() => setShowStarredOnly(true)}>⭐ 已標星</button>
        <div className="row" style={{ gap: 6, marginLeft: 12 }}>
          {BRANCHES.map(b => (
            <button key={b} className={`btn ${branch === b ? 'primary' : ''}`} onClick={() => setBranch(branch === b ? 'all' : b)}>
              {b}
            </button>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>本旅已標記通告</h2>
        {!filtered.length && <p className="muted">暫時沒有符合條件的通告。</p>}
        {filtered.map(b => (
          <div key={b.id} className="card" style={{ boxShadow: 'none' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                  <button className="btn" style={{ fontSize: 20, padding: '0 6px' }} onClick={() => toggleStar(b.id)}>
                    {starred.has(b.id) ? '⭐' : '☆'}
                  </button>
                  <h3 style={{ marginBottom: 0 }}>{b.title}</h3>
                </div>
                <p className="muted">
                  {b.region || '-'} · {b.sourceSite || '-'} · 本旅截止：{b.internalDeadline || '未設定'}
                  {b.officialDeadline && <span style={{ color: '#999' }}> · 官方截止：{b.officialDeadline}（未必準確）</span>}
                </p>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {b.attachmentUrl && <a className="btn" target="_blank" href={b.attachmentUrl}>開啟附件</a>}
                {b.sourceUrl && <a className="btn" target="_blank" href={b.sourceUrl}>來源</a>}
              </div>
            </div>
            <p className="muted">支部：{(b.branchTags || []).join('、') || '-'}　對象：{(b.audienceTags || []).join('、') || '-'}　類型：{b.activityType || '-'}</p>
            {b.notes && (
              editId === b.id ? (
                <div className="stack" style={{ gap: 8, marginTop: 8 }}>
                  <textarea className="w-full" rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
                  <div className="row">
                    <button className="btn" onClick={() => { setEditId(null); setEditNotes(''); }}>取消</button>
                    <button className="btn primary" onClick={() => updateNotes(b.id)}>儲存</button>
                  </div>
                </div>
              ) : <p>{b.notes}</p>
            )}
            {canManage && (
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                <button className="btn" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => { setEditId(b.id); setEditNotes(b.notes || ''); }}>編輯備註</button>
                <button className="btn" style={{ fontSize: 12, padding: '4px 8px', color: 'var(--red)' }} onClick={() => deleteBookmark(b.id)}>刪除</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
