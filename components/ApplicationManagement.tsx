'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

function getLocalUser() {
  const u = getCurrentUser();
  if (u) return u;
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return p;
    }
  } catch {}
  return null;
}

/** 大小寫不敏感取值 */
function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) {
      if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key];
    }
  }
  return '';
}

/**
 * 智慧狀態偵測。
 * 正常情況讀 status 欄；若資料因欄位錯位而 status 不是有效值，
 * 則檢查 approvedAt（錯位時 "pending" 可能跑到這裡），最後預設 pending。
 */
function detectStatus(row: any): string {
  const raw = String(val(row, 'status') || '').trim().toLowerCase();
  if (['pending', 'approved', 'rejected'].includes(raw)) return raw;

  // 資料可能錯位：approvedAt 欄可能存著實際的 status
  const alt = String(val(row, 'approvedAt') || '').trim().toLowerCase();
  if (['pending', 'approved', 'rejected'].includes(alt)) return alt;

  // 預設為 pending（未審批的申請）
  return 'pending';
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待審批', color: '#b45309', bg: '#fef3c7' },
  approved: { label: '已批核', color: '#15803d', bg: '#dcfce7' },
  rejected: { label: '已拒絕', color: '#b91c1c', bg: '#fee2e2' },
};

export default function ApplicationManagement() {
  const [allApps, setAllApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState('');
  const [expanded, setExpanded] = useState<string>('');
  const user = getLocalUser();

  // ★ 改用 getTableData（已驗證可從瀏覽器正常呼叫，不會有 CORS 問題）
  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`${APPS_SCRIPT_URL}?action=getTableData&table=Applications`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setAllApps(d.data || []);
        else setError(d.error || '載入失敗');
      })
      .catch(err => setError(err.message || '連線失敗'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 前端計算每筆申請的狀態
  const appsWithStatus = allApps.map(a => ({ ...a, _status: detectStatus(a) }));

  const counts = {
    pending: appsWithStatus.filter(a => a._status === 'pending').length,
    approved: appsWithStatus.filter(a => a._status === 'approved').length,
    rejected: appsWithStatus.filter(a => a._status === 'rejected').length,
  };

  // 前端篩選
  const filteredApps = filter === 'all'
    ? appsWithStatus
    : appsWithStatus.filter(a => a._status === filter);

  const approve = async (app: any) => {
    const id = val(app, 'applicationId', 'id');
    if (!confirm(`確定批核「${val(app, 'name')}」的申請？\n批核後將自動建立用戶帳號。`)) return;
    setBusyId(String(id));
    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=approveApplication&applicationId=${encodeURIComponent(id)}&approvedBy=${encodeURIComponent(user?.userId || '')}`,
        { cache: 'no-store' }
      );
      const d = await res.json();
      if (d.success) {
        alert('✅ 已批核並建立用戶');
        load();
      } else {
        alert('批核失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusyId('');
    }
  };

  const reject = async (app: any) => {
    const id = val(app, 'applicationId', 'id');
    const reason = prompt(`確定拒絕「${val(app, 'name')}」的申請？\n可輸入拒絕原因（可留空）：`);
    if (reason === null) return;
    setBusyId(String(id));
    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=rejectApplication&applicationId=${encodeURIComponent(id)}&approvedBy=${encodeURIComponent(user?.userId || '')}&rejectReason=${encodeURIComponent(reason || '')}`,
        { cache: 'no-store' }
      );
      const d = await res.json();
      if (d.success) {
        alert('已拒絕申請');
        load();
      } else {
        alert('操作失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusyId('');
    }
  };

  const FILTER_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'pending', label: '待審批' },
    { key: 'approved', label: '已批核' },
    { key: 'rejected', label: '已拒絕' },
    { key: 'all', label: '全部' },
  ];

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">管理後台</span>
        <h1>家長審核 / 申請管理</h1>
        <p className="muted">審核家長、領袖、成員及管理員的註冊申請。</p>
      </section>

      {/* 統計 */}
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
        <div className="card"><h2 style={{ color: '#b45309' }}>{counts.pending}</h2><p className="muted">待審批</p></div>
        <div className="card"><h2 style={{ color: '#15803d' }}>{counts.approved}</h2><p className="muted">已批核</p></div>
        <div className="card"><h2 style={{ color: '#b91c1c' }}>{counts.rejected}</h2><p className="muted">已拒絕</p></div>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}

      {/* 篩選 */}
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(t => {
          const n = t.key === 'all' ? allApps.length : counts[t.key];
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={active ? 'btn primary' : 'btn'}
              style={{ opacity: active ? 1 : 0.8 }}
            >
              {t.label} ({n})
            </button>
          );
        })}
        <button className="btn" onClick={load} style={{ marginLeft: 'auto' }}>↻ 重新整理</button>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="stack" style={{ padding: 40 }}>載入中...</div>
      ) : filteredApps.length === 0 ? (
        <section className="card"><p className="muted">此分類暫無申請</p></section>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {filteredApps.map((app, i) => {
            const id = String(val(app, 'applicationId', 'id') || i);
            const status = app._status;
            const meta = STATUS_META[status] || STATUS_META.pending;
            const isPending = status === 'pending';
            const isOpen = expanded === id;
            return (
              <section key={id} className="card stack" style={{ margin: 0 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>{val(app, 'name') || '（未命名）'}</h3>
                      <span style={{ background: meta.bg, color: meta.color, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="muted" style={{ margin: '4px 0 0' }}>
                      {val(app, 'email')} {val(app, 'phone') && `· ${val(app, 'phone')}`}
                    </p>
                    <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                      類型：{val(app, 'applicantType', 'requestedRole', 'role') || '—'}
                      {val(app, 'branchId') && ` · 支部 ${val(app, 'branchId')}`}
                    </p>
                  </div>
                  {isPending && (
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn primary" disabled={busyId === id} onClick={() => approve(app)}>
                        {busyId === id ? '...' : '✓ 批核'}
                      </button>
                      <button className="btn" style={{ color: 'var(--red)' }} disabled={busyId === id} onClick={() => reject(app)}>
                        ✕ 拒絕
                      </button>
                    </div>
                  )}
                </div>

                {/* 摘要 */}
                {(val(app, 'ymNumbers') || val(app, 'childNames') || val(app, 'notes')) && (
                  <div style={{ fontSize: 14 }}>
                    {val(app, 'ymNumbers') && <p style={{ margin: '2px 0' }}><strong>子女 YM 編號：</strong>{val(app, 'ymNumbers')}</p>}
                    {val(app, 'childNames') && <p style={{ margin: '2px 0' }}><strong>子女姓名：</strong>{val(app, 'childNames')}</p>}
                    {val(app, 'notes') && !isOpen && <p className="muted" style={{ margin: '2px 0' }}><strong>備註：</strong>{String(val(app, 'notes')).slice(0, 60)}{String(val(app, 'notes')).length > 60 && '…'}</p>}
                  </div>
                )}

                {/* 展開詳情 */}
                <button className="btn" style={{ alignSelf: 'flex-start', fontSize: 13, padding: '4px 12px' }} onClick={() => setExpanded(isOpen ? '' : id)}>
                  {isOpen ? '收起詳情 ▲' : '查看全部欄位 ▼'}
                </button>
                {isOpen && (
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, fontSize: 13 }}>
                    {Object.entries(app).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 8, padding: '2px 0', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontWeight: 600, minWidth: 120, color: '#555' }}>{k}</span>
                        <span style={{ wordBreak: 'break-all' }}>{String(v ?? '')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
