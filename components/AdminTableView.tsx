'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

// 每個資料表的中繼資料：ID 欄位、新增時 ID 前綴、可編輯欄位、需隱藏欄位
type TableMeta = {
  idColumn: string;
  idPrefix?: string;
  editable?: string[];      // 可編輯欄位白名單（空 = 全部可編輯）
  hidden?: string[];        // 顯示時隱藏的欄位（如密碼）
  addable?: boolean;        // 是否允許新增
};

const TABLE_META: Record<string, TableMeta> = {
  Branches: { idColumn: 'branchId', idPrefix: 'b', editable: ['name', 'shortName', 'section'], addable: true },
  Members: { idColumn: 'id', idPrefix: 'm', hidden: ['passwordHash', 'password'], addable: true },
  Events: { idColumn: 'eventId', idPrefix: 'e', editable: ['title', 'date', 'endDate', 'location', 'scope', 'branchId', 'quota', 'fee', 'description', 'status'], addable: true },
  Users: { idColumn: 'userId', hidden: ['passwordHash', 'password'], addable: false },
  Applications: { idColumn: 'applicationId', addable: false },
  LibraryBookmarks: { idColumn: 'bookmarkId', addable: true },
  Roles: { idColumn: 'roleId', idPrefix: 'role', addable: true },
  SystemConfig: { idColumn: 'key', idPrefix: 'cfg', editable: ['key', 'value', 'description'], addable: true },
  FieldSettings: { idColumn: 'key', editable: ['key', 'label', 'required', 'enabled', 'source'], addable: true },
};

function getMeta(tableName: string): TableMeta {
  return TABLE_META[tableName] || { idColumn: 'id', idPrefix: 'row', addable: true };
}

function getLocalUser() {
  const u = getCurrentUser();
  if (u) return u;
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/** 大小寫不敏感取值 */
function val(row: any, key: string) {
  const lower = String(key).toLowerCase();
  for (const k in row) {
    if (String(k).toLowerCase() === lower) return row[k];
  }
  return '';
}

export default function AdminTableView({
  tableName,
  title,
  description,
}: {
  tableName: string;
  title: string;
  description?: string;
}) {
  const meta = getMeta(tableName);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<any | null>(null);   // 正在編輯的列
  const [adding, setAdding] = useState(false);                 // 新增模式
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const user = getLocalUser();
  const isSuperAdmin = String(user?.role).toLowerCase() === 'super_admin';

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`${APPS_SCRIPT_URL}?action=getTableData&table=${encodeURIComponent(tableName)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data || []);
        else setError(d.error || '載入失敗');
      })
      .catch(err => setError(err.message || '連線失敗'))
      .finally(() => setLoading(false));
  }, [tableName]);

  useEffect(() => {
    load();
  }, [load]);

  // ===== 權限 / 顯示過濾 =====
  let displayData = data;

  // 使用者管理：非超管隱藏 super_admin 資料（保護超管帳號）
  if (tableName === 'Users' && !isSuperAdmin) {
    displayData = displayData.filter(r => String(val(r, 'role')).toLowerCase() !== 'super_admin');
  }

  // 搜尋
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    displayData = displayData.filter(r =>
      Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }

  // 計算顯示用欄位
  const allHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const hiddenCols = new Set([...(meta.hidden || []), 'password', 'passwordHash']);
  const visibleHeaders = allHeaders.filter(h => !hiddenCols.has(h));

  const startEdit = (row: any) => {
    setEditing(row);
    setFormValues({ ...row });
  };

  const startAdd = () => {
    setAdding(true);
    setFormValues({});
  };

  const saveEdit = async () => {
    const id = val(editing, meta.idColumn) || val(editing, 'id');
    if (!id) return alert('找不到此列的 ID');
    setBusy(true);
    try {
      // 只送出已變更 / 允許編輯的欄位
      const fields: Record<string, any> = {};
      const allowed = meta.editable && meta.editable.length > 0 ? meta.editable : allHeaders;
      for (const h of allowed) {
        if (hiddenCols.has(h)) continue;
        fields[h] = formValues[h] !== undefined ? formValues[h] : '';
      }
      const params = new URLSearchParams({
        action: 'updateRow',
        table: tableName,
        id: String(id),
        idColumn: meta.idColumn,
        fields: JSON.stringify(fields),
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        setEditing(null);
        load();
      } else {
        alert('儲存失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const saveAdd = async () => {
    setBusy(true);
    try {
      const fields: Record<string, any> = {};
      const allowed = meta.editable && meta.editable.length > 0 ? meta.editable : visibleHeaders;
      for (const h of allowed) {
        fields[h] = formValues[h] !== undefined ? formValues[h] : '';
      }
      const params = new URLSearchParams({
        action: 'addRow',
        table: tableName,
        idColumn: meta.idColumn,
        idPrefix: meta.idPrefix || 'row',
        fields: JSON.stringify(fields),
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        setAdding(false);
        load();
      } else {
        alert('新增失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: any) => {
    const id = val(row, meta.idColumn) || val(row, 'id');
    const name = val(row, 'name') || val(row, 'title') || id;
    if (!confirm(`確定刪除「${name}」？\n此操作無法復原。`)) return;
    setBusy(true);
    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=deleteRow&table=${encodeURIComponent(tableName)}&id=${encodeURIComponent(String(id))}&idColumn=${encodeURIComponent(meta.idColumn)}`,
        { cache: 'no-store' }
      );
      const d = await res.json();
      if (d.success) {
        load();
      } else {
        alert('刪除失敗：' + (d.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗：' + (err.message || ''));
    } finally {
      setBusy(false);
    }
  };

  // 編輯/新增表單欄位
  const formFields = (editing || adding)
    ? (meta.editable && meta.editable.length > 0
        ? meta.editable.filter(h => !hiddenCols.has(h))
        : (adding ? visibleHeaders : visibleHeaders))
    : [];

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">管理後台</span>
        <h1>{title}</h1>
        <p className="muted">{description || `共 ${displayData.length} 筆資料`}</p>
      </section>

      {tableName === 'Users' && !isSuperAdmin && (
        <section className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <p style={{ margin: 0, fontSize: 14 }}>🔒 基於權限設定，超級管理員帳號資料已隱藏。如需管理超管帳號，請以超級管理員身份登入。</p>
        </section>
      )}

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}

      {/* 工具列 */}
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="w-full border rounded-lg px-3 py-2"
          style={{ maxWidth: 280, flex: 1 }}
          placeholder="搜尋..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {meta.addable && (
          <button className="btn primary" onClick={startAdd}>+ 新增</button>
        )}
        <button className="btn" onClick={load}>↻ 重新整理</button>
      </div>

      {/* 表格 */}
      <section className="card" style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40 }} className="muted">載入中...</div>
        ) : displayData.length === 0 ? (
          <p className="muted" style={{ padding: 24 }}>暫無資料</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {visibleHeaders.map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--line)', whiteSpace: 'nowrap', position: 'sticky', top: 0 }}>
                    {h}
                  </th>
                ))}
                <th style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '2px solid var(--line)', whiteSpace: 'nowrap' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, i) => {
                const id = val(row, meta.idColumn) || val(row, 'id') || i;
                const isSuper = tableName === 'Users' && String(val(row, 'role')).toLowerCase() === 'super_admin';
                return (
                  <tr key={String(id)}>
                    {visibleHeaders.map(h => (
                      <td key={h} style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(val(row, h) ?? '').slice(0, 120)}
                      </td>
                    ))}
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <button className="btn" style={{ fontSize: 13, padding: '4px 10px', marginRight: 6 }} onClick={() => startEdit(row)}>編輯</button>
                      {/* 超管帳號只允許超管自己刪除 */}
                      {!(isSuper && !isSuperAdmin) && (
                        <button
                          className="btn"
                          style={{ fontSize: 13, padding: '4px 10px', color: 'var(--red)' }}
                          disabled={busy}
                          onClick={() => remove(row)}
                        >
                          刪除
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 編輯 / 新增 Modal */}
      {(editing || adding) && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
          onClick={() => { setEditing(null); setAdding(false); }}
        >
          <div className="card stack" style={{ maxWidth: 600, width: '100%', margin: '40px 0' }} onClick={ev => ev.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{adding ? '➕ 新增資料' : '✏️ 編輯資料'}</h2>
              <button className="btn" style={{ padding: '4px 12px' }} onClick={() => { setEditing(null); setAdding(false); }}>✕</button>
            </div>
            <form
              onSubmit={e => { e.preventDefault(); adding ? saveAdd() : saveEdit(); }}
              className="stack"
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
              {formFields.map(h => (
                <div key={h}>
                  <label className="block text-sm font-medium mb-1">{h}</label>
                  {String(h).toLowerCase().includes('description') || String(h).toLowerCase().includes('notes') ? (
                    <textarea
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      value={formValues[h] !== undefined ? formValues[h] : ''}
                      onChange={e => setFormValues(v => ({ ...v, [h]: e.target.value }))}
                    />
                  ) : (
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      value={formValues[h] !== undefined ? formValues[h] : ''}
                      onChange={e => setFormValues(v => ({ ...v, [h]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div className="row" style={{ gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn primary" style={{ flex: 1 }} disabled={busy}>
                  {busy ? '儲存中...' : '儲存'}
                </button>
                <button type="button" className="btn" onClick={() => { setEditing(null); setAdding(false); }}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
