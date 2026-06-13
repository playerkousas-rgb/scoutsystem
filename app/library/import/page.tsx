'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type LibraryBookmarkStatus } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const statusOptions: LibraryBookmarkStatus[] = ['new', 'following', 'not_applicable', 'converted', 'published'];

const statusLabel: Record<LibraryBookmarkStatus, string> = {
  new: '待處理', following: '適合跟進', not_applicable: '不適用', converted: '已轉活動草稿', published: '已發布', archived: '已封存'
};

export default function LibraryImportPage() {
  const router = useRouter();
  const search = useSearchParams();

  // 來源通告參數（只讀）
  const [title] = useState(search.get('title') || '');
  const [sourceSite] = useState(search.get('sourceSite') || '');
  const [region] = useState(search.get('region') || '');
  const [circularDate] = useState(search.get('date') || '');
  const [sourceUrl] = useState(search.get('sourceUrl') || '');
  const [attachmentUrl] = useState(search.get('attachmentUrl') || '');
  const [officialDeadline] = useState(search.get('deadline') || '');
  const [targetText] = useState(search.get('audience') || '');
  const [fee] = useState(search.get('fee') || '');

  // 本旅標記欄位（可編輯）
  const [circularKey, setCircularKey] = useState(() => 'circular-' + Date.now());
  const [status, setStatus] = useState<LibraryBookmarkStatus>('new');
  const [branchTags, setBranchTags] = useState('');
  const [audienceTags, setAudienceTags] = useState('');
  const [activityType, setActivityType] = useState('');
  const [internalDeadline, setInternalDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const [user, setUser] = useState<{ userId: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 讀取登入用戶
  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.userId) {
          setUser({ userId: parsed.userId, name: parsed.name });
          return;
        }
      }
    } catch {}
    // fallback
    try {
      const sessionId = localStorage.getItem('scout-system-session-v2');
      if (sessionId) {
        const rawData = localStorage.getItem('scout-system-ui-v2');
        if (rawData) {
          const data = JSON.parse(rawData);
          const found = data?.users?.find((u: any) => u.id === sessionId);
          if (found) {
            setUser({ userId: found.id, name: found.name });
          }
        }
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('請先登入才能加入書籤');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addLibraryBookmark',
          circularKey,
          title,
          sourceSite,
          region,
          circularDate,
          sourceUrl,
          attachmentUrl,
          officialDeadline,
          targetText,
          fee,
          status,
          branchTags: branchTags.split(/[,、]/).map(s => s.trim()).filter(Boolean),
          audienceTags: audienceTags.split(/[,、]/).map(s => s.trim()).filter(Boolean),
          activityType,
          internalDeadline,
          ownerUserId: user.userId,
          notes,
          createdBy: user.userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/library'), 1200);
      } else {
        setError(data.error || '加入失敗');
      }
    } catch (err: any) {
      setError(err.message || '連線失敗');
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
          <p className="muted">只有領袖或管理員可以將通告加入本旅圖書館。</p>
          <a href="/login" className="btn primary">前往登入</a>
        </section>
      </div>
    );
  }

  if (success) {
    return (
      <div className="stack" style={{ maxWidth: 600, margin: '60px auto' }}>
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <span className="badge green">加入成功</span>
          <h2>已加入本旅圖書館</h2>
          <p className="muted">正在跳轉至圖書館頁面...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 720, margin: '0 auto' }}>
      <section className="hero">
        <span className="badge gold">加入本旅圖書館</span>
        <h1>標記通告</h1>
        <p className="muted">確認以下資訊後加入本旅圖書館，供其他領袖跟進。</p>
      </section>

      <form onSubmit={handleSubmit} className="stack">
        {/* 來源通告資訊（只讀） */}
        <section className="card stack">
          <h2>來源通告資訊</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>標題</label>
              <input className="w-full" value={title} readOnly style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>來源網站</label>
              <input className="w-full" value={sourceSite} readOnly style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>地域</label>
              <input className="w-full" value={region} readOnly style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>通告日期</label>
              <input className="w-full" value={circularDate} readOnly style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>官方截止</label>
              <input className="w-full" value={officialDeadline} readOnly style={{ background: '#f8fafc' }} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>費用</label>
              <input className="w-full" value={fee} readOnly style={{ background: '#f8fafc' }} />
            </div>
          </div>
          <div>
            <label className="muted" style={{ fontSize: 13 }}>對象</label>
            <input className="w-full" value={targetText} readOnly style={{ background: '#f8fafc' }} />
          </div>
          <div className="row" style={{ gap: 12 }}>
            {sourceUrl && <a href={sourceUrl} target="_blank" className="btn">開啟來源</a>}
            {attachmentUrl && <a href={attachmentUrl} target="_blank" className="btn primary">開啟附件</a>}
          </div>
        </section>

        {/* 本旅標記設定 */}
        <section className="card stack">
          <h2>本旅標記設定</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>狀態</label>
              <select className="select w-full" value={status} onChange={e => setStatus(e.target.value as LibraryBookmarkStatus)}>
                {statusOptions.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>活動類型</label>
              <input className="w-full" value={activityType} onChange={e => setActivityType(e.target.value)} placeholder="例如：訓練班 / 服務日 / 營期" />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>本旅截止</label>
              <input type="date" className="w-full" value={internalDeadline} onChange={e => setInternalDeadline(e.target.value)} />
            </div>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>Circular Key</label>
              <input className="w-full" value={circularKey} onChange={e => setCircularKey(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="muted" style={{ fontSize: 13 }}>適用支部（用逗號分隔）</label>
            <input className="w-full" value={branchTags} onChange={e => setBranchTags(e.target.value)} placeholder="全旅, 幼童軍支部, 童軍支部" />
          </div>
          <div>
            <label className="muted" style={{ fontSize: 13 }}>對象標籤（用逗號分隔）</label>
            <input className="w-full" value={audienceTags} onChange={e => setAudienceTags(e.target.value)} placeholder="領袖, 幼童軍, 童軍" />
          </div>
          <div>
            <label className="muted" style={{ fontSize: 13 }}>備註</label>
            <textarea className="w-full" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="給其他領袖的內部備註..." />
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            負責人：{user.name} ({user.userId})
          </div>
        </section>

        {error && (
          <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
            <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
          </section>
        )}

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <a href="/library" className="btn">取消</a>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? '加入中...' : '加入本旅圖書館'}
          </button>
        </div>
      </form>
    </div>
  );
}
