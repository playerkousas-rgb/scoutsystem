'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/troupeStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

/**
 * 系統鎖控制面板（僅後門帳號可見）
 * 隱藏在控制台底部，只有 sheep 登入才顯示
 */
export default function SystemLockPanel() {
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetch(`${APPS_SCRIPT_URL}?action=getSystemStatus`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setLocked(d.locked); })
      .catch(() => {});
  }, []);

  const toggle = () => {
    if (locked) {
      // 解鎖不需要二次確認
    } else {
      // 鎖定需要輸入確認文字
      if (confirmText !== 'LOCK') {
        alert('請輸入 LOCK 確認');
        return;
      }
    }
    setLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=toggleSystemLock&password=0728`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setLocked(d.locked);
          setConfirmText('');
          alert(d.message);
        } else {
          alert('操作失敗：' + (d.error || ''));
        }
      })
      .catch(() => alert('連線失敗'))
      .finally(() => setLoading(false));
  };

  return (
    <section className="card" style={{ background: '#1a1a2e', color: '#e0e0e0', marginTop: 24 }}>
      <div style={{ opacity: 0.6, fontSize: 11, marginBottom: 8 }}>SYSTEM CONTROL</div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff' }}>系統狀態</h3>
          <p style={{ margin: '4px 0 0', fontSize: 14 }}>
            {locked ? '🔴 已鎖定 — 除管理員外所有人無法登入' : '🟢 正常運作'}
          </p>
        </div>
        {!locked && (
          <input
            type="password"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="輸入 LOCK 確認鎖定"
            style={{ width: 180, padding: '6px 10px', borderRadius: 6, border: '1px solid #444', background: '#16213e', color: '#fff', fontSize: 13 }}
          />
        )}
        <button
          onClick={toggle}
          disabled={loading}
          className={locked ? 'btn' : 'btn'}
          style={{
            background: locked ? '#15803d' : '#dc2626',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {loading ? '...' : locked ? '🔓 解鎖系統' : '🔒 鎖定系統'}
        </button>
      </div>
    </section>
  );
}
