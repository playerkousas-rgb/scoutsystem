'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/troupeStore';
import { branchName } from '@/lib/branches';

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

function detectStatus(row: any): string {
  const raw = String(val(row, 'status') || '').trim().toLowerCase();
  if (['pending', 'approved', 'rejected'].includes(raw)) return raw;
  const alt = String(val(row, 'approvedAt') || '').trim().toLowerCase();
  if (['pending', 'approved', 'rejected'].includes(alt)) return alt;
  return 'pending';
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待審批', color: '#b45309', bg: '#fef3c7' },
  approved: { label: '已批核', color: '#15803d', bg: '#dcfce7' },
  rejected: { label: '已拒絕', color: '#b91c1c', bg: '#fee2e2' },
};

// 角色中文名稱
function roleLabel(role: string): string {
  const map: Record<string, string> = {
    parent: '家長', leader: '領袖', member: '成員',
    admin: '管理員', super_admin: '超級管理員',
    group_leader: '團長', branch_leader: '支部領袖', coach: '教練員',
  };
  return map[String(role).toLowerCase()] || role;
}

export default function ApplicationManagement() {
  const [allApps, setAllApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [reviewing, setReviewing] = useState<any | null>(null); // 審批 Modal
  const [busy, setBusy] = useState(false);
  const user = getLocalUser();

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`${APPS_SCRIPT_URL}?action=getTableData&table=Applications`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          let rows = d.data || [];
          // ★ 非管理員只看自己支部
          const role = String(user?.role || '').toLowerCase();
          if (role !== 'super_admin' && role !== 'admin' && user?.branchId) {
            rows = rows.filter((a: any) => val(a, 'branchId') === user.branchId);
          }
          setAllApps(rows);
        } else {
          setError(d.error || '載入失敗');
        }
      })
      .catch(err => setError(err.message || '連線失敗'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const appsWithStatus = allApps.map(a => ({ ...a, _status: detectStatus(a) }));

  const counts = {
    pending: appsWithStatus.filter(a => a._status === 'pending').length,
    approved: appsWithStatus.filter(a => a._status === 'approved').length,
    rejected: appsWithStatus.filter(a => a._status === 'rejected').length,
  };

  const filteredApps = filter === 'all'
    ? appsWithStatus
    : appsWithStatus.filter(a => a._status === filter);

  const approve = async (app: any) => {
    const id = val(app, 'applicationId', 'id');
    setBusy(true);
    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=approveApplication&applicationId=${encodeURIComponent(id)}&approvedBy=${encodeURIComponent(user?.userId || '')}`,
        { cache: 'no-store' }
      );
      const d = await res.json();
      if (d.success) {
        setReviewing(null);
        alert('✅ 已批核並建立用戶');
        load();
      } else {
        alert('批核失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const reject = async (app: any) => {
    const id = val(app, 'applicationId', 'id');
    setBusy(true);
    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=rejectApplication&applicationId=${encodeURIComponent(id)}&approvedBy=${encodeURIComponent(user?.userId || '')}`,
        { cache: 'no-store' }
      );
      const d = await res.json();
      if (d.success) {
        setReviewing(null);
        alert('已拒絕申請');
        load();
      } else {
        alert('操作失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusy(false);
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
        <p className="muted">審核家長、領袖、成員及管理員的註冊申請。點「審核」查看完整資料後再批核或拒絕。</p>
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
            <button key={t.key} onClick={() => setFilter(t.key)} className={active ? 'btn primary' : 'btn'} style={{ opacity: active ? 1 : 0.8 }}>
              {t.label} ({n})
            </button>
          );
        })}
        <button className="btn" onClick={load} style={{ marginLeft: 'auto' }}>↻ 重新整理</button>
      </div>

      {/* 列表 — 每列只有一個「審核」按鈕，避免誤觸 */}
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
            return (
              <section key={id} className="card" style={{ margin: 0 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>{val(app, 'name') || '（未命名）'}</h3>
                      <span style={{ background: meta.bg, color: meta.color, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                      {val(app, 'email')}
                    </p>
                    <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                      {roleLabel(val(app, 'applicantType', 'requestedRole', 'role') || '申請者')}
                      {' · '}
                      {branchName(val(app, 'branchId'))}
                      {val(app, 'ymNumbers') && (
                        val(app, 'applicantType', 'requestedRole') === 'member'
                          ? ` · 成員編號：${val(app, 'ymNumbers')}`
                          : ` · 子女 YM：${val(app, 'ymNumbers')}`
                      )}
                    </p>
                  </div>
                  {/* 只有一個按鈕 → 點擊後進入詳情 Modal，不會誤觸 */}
                  <button
                    className={isPending ? 'btn primary' : 'btn'}
                    onClick={() => setReviewing(app)}
                  >
                    {isPending ? '🔍 審核' : '📋 查看詳情'}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ===== 審核詳情 Modal ===== */}
      {reviewing && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
          onClick={() => !busy && setReviewing(null)}
        >
          <div className="card stack" style={{ maxWidth: 560, width: '100%', margin: '32px 0' }} onClick={ev => ev.stopPropagation()}>
            {/* 標題列 */}
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>
                🔍 審核申請
              </h2>
              <button className="btn" style={{ padding: '4px 12px' }} onClick={() => !busy && setReviewing(null)} disabled={busy}>✕</button>
            </div>

            {/* 申請者資訊 */}
            <div className="card" style={{ boxShadow: 'none', background: '#f9fafb' }}>
              <h3 style={{ margin: '0 0 8px' }}>{val(reviewing, 'name') || '（未命名）'}</h3>
              <div style={{ fontSize: 14, lineHeight: 2 }}>
                <div>📧 <strong>電郵：</strong>{val(reviewing, 'email')}</div>
                <div>📞 <strong>電話：</strong>{val(reviewing, 'phone') || '—'}</div>
                <div>👤 <strong>申請身份：</strong>{roleLabel(val(reviewing, 'applicantType', 'requestedRole', 'role'))}</div>
                <div>🏢 <strong>支部：</strong>{branchName(val(reviewing, 'branchId'))}</div>
                {/* 家長：顯示子女資訊；成員：顯示成員編號 */}
                {val(reviewing, 'ymNumbers') && (
                  val(reviewing, 'applicantType', 'requestedRole') === 'member'
                    ? <div>NUM <strong>成員編號（YMIS）：</strong>{val(reviewing, 'ymNumbers')}</div>
                    : <div>BABY <strong>子女 YMIS / 成員編號：</strong>{val(reviewing, 'ymNumbers')}</div>
                )}
                {val(reviewing, 'childNames') && (
                  <div>🧒 <strong>子女姓名：</strong>{val(reviewing, 'childNames')}</div>
                )}
                {val(reviewing, 'notes') && (
                  <div>📝 <strong>備註：</strong>{val(reviewing, 'notes')}</div>
                )}
                <div>📅 <strong>申請時間：</strong>{val(reviewing, 'createdAt') || '—'}</div>
                <div>📊 <strong>狀態：</strong>
                  <span style={{ background: (STATUS_META[detectStatus(reviewing)] || STATUS_META.pending).bg, color: (STATUS_META[detectStatus(reviewing)] || STATUS_META.pending).color, padding: '1px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    {(STATUS_META[detectStatus(reviewing)] || STATUS_META.pending).label}
                  </span>
                </div>
              </div>
            </div>

            {/* 所有欄位（摺疊） */}
            <details>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: '#666' }}>查看原始資料（全部欄位）</summary>
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8, fontSize: 13, marginTop: 4 }}>
                {Object.entries(reviewing).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, padding: '2px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: 600, minWidth: 120, color: '#555' }}>{k}</span>
                    <span style={{ wordBreak: 'break-all' }}>{String(v ?? '')}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* 操作按鈕：分開放、夠大、要確認 */}
            {detectStatus(reviewing) === 'pending' ? (
              <div className="row" style={{ gap: 12, marginTop: 8 }}>
                <button
                  className="btn primary"
                  style={{ flex: 2, fontSize: 16, padding: '12px' }}
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`確定批核「${val(reviewing, 'name')}」的申請？\n批核後將自動建立用戶帳號，此操作不可撤銷。`)) {
                      approve(reviewing);
                    }
                  }}
                >
                  {busy ? '處理中...' : '✓ 確認批核'}
                </button>
                <button
                  className="btn"
                  style={{ flex: 1, color: 'var(--red)', fontSize: 16, padding: '12px' }}
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`確定拒絕「${val(reviewing, 'name')}」的申請？`)) {
                      reject(reviewing);
                    }
                  }}
                >
                  ✕ 拒絕
                </button>
              </div>
            ) : (
              <p className="muted" style={{ textAlign: 'center', marginTop: 8 }}>此申請已處理完畢</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
