'use client';

import { useEffect, useState } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export default function AdminTableView({ tableName, title }: { tableName: string; title: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${APPS_SCRIPT_URL}?action=getTableData&table=${encodeURIComponent(tableName)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data || []);
        else setError(d.error || '載入失敗');
      })
      .catch(err => setError(err.message || '連線失敗'))
      .finally(() => setLoading(false));
  }, [tableName]);

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">管理後台</span>
        <h1>{title}</h1>
        <p className="muted">共 {data.length} 筆資料</p>
      </section>
      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}
      <section className="card" style={{ overflowX: 'auto' }}>
        {data.length === 0 ? (
          <p className="muted">暫無資料</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--line)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {headers.map(h => (
                    <td key={h} style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {String(row[h] || '').slice(0, 100)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
