'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchPublicBootstrap } from '@/lib/api';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const AUDIENCE_OPTIONS = ['成員', '家長', '領袖', '團長'];

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.userId) return { userId: parsed.userId, name: parsed.name };
    }
  } catch {}
  try {
    const sessionId = localStorage.getItem('scout-system-session-v2');
    if (sessionId) {
      const data = JSON.parse(localStorage.getItem('scout-system-ui-v2') || '{}');
      const found = data?.users?.find((u: any) => u.id === sessionId);
      if (found) return { userId: found.id, name: found.name };
    }
  } catch {}
  return null;
}

export default function LibraryImportPage() {
  const router = useRouter();
  const search = useSearchParams();

  // 來源通告（只讀）
  const source = {
    title: search.get('title') || '',
    sourceSite: search.get('sourceSite') || '',
    region: search.get('region') || '',
    circularDate: search.get('date') || '',
    sourceUrl: search.get('sourceUrl') || '',
    attachmentUrl: search.get('attachmentUrl') || '',
    officialDeadline: search.get('deadline') || '',
    targetText: search.get('audience') || '',
    fee: search.get('fee') || '',
  };

  const [circularKey] = useState(() => 'circular-' + Date.now());
  const [activityType, setActivityType] = useState('');
  const [internalDeadline, setInternalDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['全旅']);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['領袖']);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [user, setUser] = useState<{ userId: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);

    // 載入支部列表
    fetchPublicBootstrap().then(res => {
      if (res.success && res.data?.branches) {
        const list = res.data.branches.map((b: any) => ({ id: b.id || b.branchId, name: b.name }));
        setBranches(list);
      }
    });
  }, []);

  const toggleBranch = (name: string) => {
    if (name === '全旅') {
      setSelectedBranches(['全旅']);
      return;
    }
    setSelectedBranches(prev => {
      const next = prev.filter(p => p !== '全旅');
      if (next.includes(name)) return next.filter(p => p !== name);
      return [...next, name];
    });
  };

  const toggleAudience = (name: string) => {
    setSelectedAudiences(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const submit = async (status: 'new' | 'converted') => {
    if (!user) {
      setError('請先登入');
      return;
    }
    setLoading(true);
    setError('');

    // 用 GET 發送，避免 CORS
    const params = new URLSearchParams({
      action: 'addLibraryBookmark',
      circularKey,
      title: source.title,
      sourceSite: source.sourceSite,
      region: source.region,
      circularDate: source.circularDate,
      sourceUrl: source.sourceUrl,
      attachmentUrl: source.attachmentUrl,
      officialDeadline: source.officialDeadline,
      targetText: source.targetText,
      fee: source.fee,
      status,
      branchTags: selectedBranches.join(','),
      audienceTags: selectedAudiences.join(','),
      activityType,
      internalDeadline,
      ownerUserId: user.userId,
      notes,
      createdBy: user.userId,
    });

    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/library'), 1000);
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
          <p className="muted">正在跳轉...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 720, margin: '0 auto' }}>
      <section className="hero">
        <span className="badge gold">加入本旅圖書館</span>
        <h1>{source.title || '新通告'}</h1>
        <p className="muted">{source.sourceSite} · {source.region} · 官方截止：{source.officialDeadline || '-'}</p>
        <div className="row" style={{ gap: 8 }}>
          {source.sourceUrl && <a href={source.sourceUrl} target="_blank" className="btn">開啟來源</a>}
          {source.attachmentUrl && <a href={source.attachmentUrl} target="_blank" className="btn primary">開啟附件</a>}
        </div>
      </section>

      <form onSubmit={e => { e.preventDefault(); submit('new'); }} className="stack">
        <section className="card stack">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="muted" style={{ fontSize: 13 }}>處理狀態</label>
              <div className="card" style={{ background: '#f8fafc', padding: '10px 14px' }}>待處理</div>
            </div>
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
            <div>
              <label className="muted" style={{ fontSize: 13 }}>負責人</label>
              <div className="card" style={{ background: '#f8fafc', padding: '10px 14px' }}>{user.name}</div>
            </div>
          </div>

          <div>
            <label className="muted" style={{ fontSize: 13 }}>適用支部</label>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className={`btn ${selectedBranches.includes('全旅') ? 'primary' : ''}`} onClick={() => toggleBranch('全旅')}>全旅</button>
              {branches.map(b => (
                <button key={b.id} type="button" className={`btn ${selectedBranches.includes(b.name) ? 'primary' : ''}`} onClick={() => toggleBranch(b.name)}>{b.name.replace('支部', '')}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="muted" style={{ fontSize: 13 }}>對象</label>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {AUDIENCE_OPTIONS.map(a => (
                <button key={a} type="button" className={`btn ${selectedAudiences.includes(a) ? 'primary' : ''}`} onClick={() => toggleAudience(a)}>{a}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="muted" style={{ fontSize: 13 }}>備註</label>
            <textarea className="w-full" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="給其他領袖的內部備註..." />
          </div>
        </section>

        {error && (
          <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
            <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
          </section>
        )}

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <a href="/library" className="btn">返回圖書館</a>
          <div className="row" style={{ gap: 10 }}>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? '處理中...' : '加入本旅收藏'}
            </button>
            <button type="button" className="btn gold" onClick={() => submit('converted')} disabled={loading}>
              {loading ? '處理中...' : '加入並標記為活動草稿'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
