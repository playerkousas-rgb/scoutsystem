'use client';

import { useState } from 'react';
import { branchName } from '@/lib/branches';

// ==================== 類型定義 ====================

export type EventReply = {
  replyId: string;
  eventId: string;
  memberId: string;
  memberName: string;
  branchId: string;
  parentUserId: string;
  operatedBy: string;
  type: 'interested' | 'registered' | 'declined';
  paid: boolean | string;
  cancelled: boolean | string;
  createdAt: string;
  updatedAt: string;
  memberAge?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

export type ChildInfo = {
  id?: string;
  memberId?: string;
  name?: string;
  nameChinese?: string;
  ymNumber?: string;
  branchId?: string;
  patrol?: string;
  rank?: string;
  dateOfBirth?: string;
  age?: string;
  registeredCount?: number;
  interestedCount?: number;
  declinedCount?: number;
  unrespondedCount?: number;
  unrespondedEvents?: any[];
  registeredEvents?: any[];
  interestedEvents?: any[];
  declinedEvents?: any[];
};

export type RegistrationSummary = {
  event: {
    eventId: string;
    title: string;
    date: string;
    scope: string;
    branchId: string;
    fee: string;
  };
  registered: EventReply[];
  interested: EventReply[];
  declined: EventReply[];
  unresponded: {
    id: string;
    name: string;
    ymNumber: string;
    branchId: string;
    patrol: string;
    rank: string;
    age: number;
    dateOfBirth: string;
  }[];
  summary: {
    totalTarget: number;
    registeredCount: number;
    interestedCount: number;
    declinedCount: number;
    unrespondedCount: number;
    paidCount: number;
  };
};

// ==================== 家長代子女報名面板 ====================

export function ParentRegisterPanel({
  event,
  children,
  onRegistered,
}: {
  event: any;
  children: ChildInfo[];
  onRegistered?: () => void;
}) {
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const user = getUser();

  const handleRegister = async () => {
    if (!selectedChild) return alert('請先選擇子女');
    setLoading(true);
    setMessage('');
    try {
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
      const params = new URLSearchParams({
        action: 'setEventReply',
        eventId: event.id || event.eventId,
        memberId: selectedChild,
        userId: user?.userId || '',
        parentUserId: user?.userId || '',
        type: 'registered',
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ 報名成功！');
        onRegistered?.();
      } else {
        setMessage('❌ ' + (data.error || '報名失敗'));
      }
    } catch (err: any) {
      setMessage('❌ 連線失敗：' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const eventId = event.id || event.eventId || '';

  // 檢查每個子女對此活動的狀態
  const getChildStatus = (child: ChildInfo): string => {
    const declined = child.declinedEvents || [];
    const registered = child.registeredEvents || [];
    const interested = child.interestedEvents || [];

    const isInDeclined = declined.some((e: any) => (e.eventId || e.id) === eventId);
    const isInRegistered = registered.some((e: any) => (e.eventId || e.id) === eventId);
    const isInInterested = interested.some((e: any) => (e.eventId || e.id) === eventId);

    if (isInRegistered) return 'registered';
    if (isInDeclined) return 'declined';
    if (isInInterested) return 'interested';
    return 'unresponded';
  };

  if (!children || children.length === 0) {
    return <p className="muted">暫無子女資料。</p>;
  }

  const handleSetReply = async (type: 'registered' | 'declined', childId: string) => {
    setLoading(true);
    setMessage('');
    try {
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
      const params = new URLSearchParams({
        action: 'setEventReply',
        eventId: eventId,
        memberId: childId,
        userId: user?.userId || '',
        parentUserId: user?.userId || '',
        type: type,
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMessage(type === 'registered' ? '✅ 已確認參加！' : '❌ 已確認不參加');
        onRegistered?.();
      } else {
        setMessage('❌ ' + (data.error || '操作失敗'));
      }
    } catch (err: any) {
      setMessage('❌ 連線失敗：' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 12 }}>
      <h3 style={{ margin: 0 }}>為子女回覆：{event.title}</h3>

      {children.map((child) => {
        const childId = child.memberId || child.id || '';
        const status = getChildStatus(child);
        return (
          <div key={childId} className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', padding: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{child.name || child.nameChinese || '未命名'}</strong>
                <span className="muted" style={{ marginLeft: 8 }}>
                  {branchName(child.branchId)} · {child.ymNumber || '-'}
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {status === 'registered' && (
                  <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>✅ 已參加</span>
                )}
                {status === 'declined' && (
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>❌ 不參加</span>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '2px 8px' }}
                      disabled={loading}
                      onClick={() => handleSetReply('registered', childId)}
                    >
                      改為參加
                    </button>
                  </div>
                )}
                {status === 'interested' && (
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>❤️ 有興趣</span>
                    <button
                      className="btn primary"
                      style={{ fontSize: 12, padding: '2px 10px' }}
                      disabled={loading}
                      onClick={() => handleSetReply('registered', childId)}
                    >
                      ✅ 參加
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '2px 10px', color: '#dc2626' }}
                      disabled={loading}
                      onClick={() => handleSetReply('declined', childId)}
                    >
                      ❌ 不參加
                    </button>
                  </div>
                )}
                {status === 'unresponded' && (
                  <div className="row" style={{ gap: 6 }}>
                    <button
                      className="btn primary"
                      style={{ fontSize: 12, padding: '4px 12px' }}
                      disabled={loading}
                      onClick={() => handleSetReply('registered', childId)}
                    >
                      ✅ 參加
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '4px 12px', color: '#dc2626' }}
                      disabled={loading}
                      onClick={() => handleSetReply('declined', childId)}
                    >
                      ❌ 不參加
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {message && (
        <div className="card" style={{ background: message.includes('✅') ? '#f0fff4' : message.includes('❌ 已確認不') ? '#fef2f2' : '#fff0f0', border: `1px solid ${message.includes('✅') ? '#ccffcc' : '#ffcccc'}` }}>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}
    </div>
  );
}

// ==================== 領袖報名管理面板 ====================

export function LeaderRegistrationPanel({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const [summary, setSummary] = useState<RegistrationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
      const params = new URLSearchParams({
        action: 'getEventRegistrationSummary',
        eventId,
        userId,
      });
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.error || '載入失敗');
      }
    } catch (err: any) {
      setError(err.message || '連線失敗');
    } finally {
      setLoading(false);
    }
  };

  // 初次載入
  if (loading && !summary) {
    // 用 setTimeout 避免在 render 中觸發 state update
    setTimeout(loadSummary, 0);
    return <div className="muted" style={{ padding: 20 }}>載入報名資料...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ background: '#fff0f0' }}>
        <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        <button className="btn" onClick={loadSummary}>重試</button>
      </div>
    );
  }

  if (!summary) return null;

  const { event, registered, interested, declined, unresponded, summary: s } = summary;

  const togglePaid = async (reply: EventReply) => {
    const currentPaid = String(reply.paid).toLowerCase() === 'true';
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
    const params = new URLSearchParams({
      action: 'setReplyPaid',
      eventId: reply.eventId,
      memberId: reply.memberId,
      paid: String(!currentPaid),
    });
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) loadSummary();
      else alert(data.error || '更新失敗');
    } catch {
      alert('連線失敗');
    }
  };

  const cancelReply = async (reply: EventReply) => {
    if (!confirm(`確定取消「${reply.memberName}」的報名？`)) return;
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';
    const params = new URLSearchParams({
      action: 'cancelEventReply',
      eventId: reply.eventId,
      memberId: reply.memberId,
    });
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) loadSummary();
      else alert(data.error || '取消失敗');
    } catch {
      alert('連線失敗');
    }
  };

  // 匯出 CSV
  const exportCSV = () => {
    const headers = ['姓名', 'YMIS', '支部', '小隊', '狀態', '已付款', '操作者', '緊急聯絡人', '緊急電話'];
    const rows = [
      ...registered.map(r => [r.memberName, r.memberId, branchName(r.branchId), '', '✅ 參加', String(r.paid) === 'true' ? '是' : '否', r.operatedBy === 'parent' ? '家長' : '成員', r.emergencyContactName || '', r.emergencyContactPhone || '']),
      ...interested.map(r => [r.memberName, r.memberId, branchName(r.branchId), '', '❤️ 有興趣', '-', r.operatedBy === 'parent' ? '家長' : '成員', r.emergencyContactName || '', r.emergencyContactPhone || '']),
      ...declined.map(r => [r.memberName, r.memberId, branchName(r.branchId), '', '❌ 不參加', '-', r.operatedBy === 'parent' ? '家長' : '成員', r.emergencyContactName || '', r.emergencyContactPhone || '']),
      ...unresponded.map(m => [m.name, m.ymNumber, branchName(m.branchId), m.patrol, '⚠️ 未回覆', '-', '-', '', '']),
    ];
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}_報名名單.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack">
      {/* 摘要 */}
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
        <div className="card"><span className="badge blue">應到</span><h2>{s.totalTarget}</h2></div>
        <div className="card"><span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>✅ 參加</span><h2>{s.registeredCount}</h2></div>
        <div className="card"><span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>❤️ 有興趣</span><h2>{s.interestedCount}</h2></div>
        <div className="card"><span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>❌ 不參加</span><h2>{s.declinedCount}</h2></div>
        <div className="card"><span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>⚠️ 未回覆</span><h2>{s.unrespondedCount}</h2></div>
        <div className="card"><span className="badge" style={{ background: '#dbeafe', color: '#2563eb' }}>💰 已付款</span><h2>{s.paidCount}/{s.registeredCount}</h2></div>
      </section>

      {/* 工具列 */}
      <div className="row" style={{ gap: 8 }}>
        <button className="btn" onClick={loadSummary}>↻ 重新整理</button>
        <button className="btn primary" onClick={exportCSV}>📥 匯出名單 (CSV)</button>
      </div>

      {/* 已報名 */}
      <section className="card stack">
        <h2>✅ 已報名（{registered.length}）</h2>
        {registered.length === 0 && <p className="muted">暫無</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>姓名</th>
              <th style={{ textAlign: 'left', padding: 8 }}>支部</th>
              <th style={{ textAlign: 'left', padding: 8 }}>操作者</th>
              <th style={{ textAlign: 'left', padding: 8 }}>緊急聯絡人</th>
              <th style={{ textAlign: 'left', padding: 8 }}>緊急電話</th>
              <th style={{ textAlign: 'center', padding: 8 }}>付款</th>
              <th style={{ textAlign: 'right', padding: 8 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {registered.map((r, i) => {
              // 找出成員的緊急聯絡人
              const mId = r.memberId;
              const member = (summary as any)._allMembers?.find?.((m: any) => (m.id || m.memberId) === mId);
              const ecName = member?.emergencyContactName || member?.parentGuardianName || '';
              const ecPhone = member?.emergencyContactPhone || member?.emergencyPhone || '';
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: 8 }}>{r.memberName}</td>
                  <td style={{ padding: 8 }}>{branchName(r.branchId)}</td>
                  <td style={{ padding: 8 }}>{r.operatedBy === 'parent' ? '👨‍👩‍👦 家長' : '👤 成員'}</td>
                  <td style={{ padding: 8 }}>{ecName || '-'}</td>
                  <td style={{ padding: 8 }}>{ecPhone || '-'}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '2px 8px', background: String(r.paid).toLowerCase() === 'true' ? '#dcfce7' : '#fee2e2' }}
                      onClick={() => togglePaid(r)}
                    >
                      {String(r.paid).toLowerCase() === 'true' ? '✅ 已付' : '❌ 未付'}
                    </button>
                  </td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <button className="btn" style={{ fontSize: 12, padding: '2px 8px', color: 'var(--red)' }} onClick={() => cancelReply(r)}>取消</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* 有興趣 */}
      <section className="card stack">
        <h2>❤️ 有興趣（{interested.length}）</h2>
        {interested.length === 0 && <p className="muted">暫無</p>}
        {interested.map((r, i) => (
          <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{r.memberName} · {branchName(r.branchId)}</span>
            <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>等待家長確認</span>
          </div>
        ))}
      </section>

      {/* 不參加 */}
      <section className="card stack">
        <h2>❌ 不參加（{declined.length}）</h2>
        {declined.length === 0 && <p className="muted">暫無</p>}
        {declined.map((r, i) => (
          <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{r.memberName} · {branchName(r.branchId)}</span>
            <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>已確認不參加</span>
          </div>
        ))}
      </section>

      {/* 未回覆 */}
      <section className="card stack">
        <h2>⚠️ 未回覆（{unresponded.length}）</h2>
        {unresponded.length === 0 && <p className="muted">全部已回覆！</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>姓名</th>
              <th style={{ textAlign: 'left', padding: 8 }}>YMIS</th>
              <th style={{ textAlign: 'left', padding: 8 }}>支部</th>
              <th style={{ textAlign: 'left', padding: 8 }}>小隊</th>
              <th style={{ textAlign: 'left', padding: 8 }}>年齡</th>
            </tr>
          </thead>
          <tbody>
            {unresponded.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: 8 }}>{m.name}</td>
                <td style={{ padding: 8 }}>{m.ymNumber}</td>
                <td style={{ padding: 8 }}>{branchName(m.branchId)}</td>
                <td style={{ padding: 8 }}>{m.patrol || '-'}</td>
                <td style={{ padding: 8 }}>{m.age >= 0 ? m.age : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ==================== Helper ====================

function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return p;
    }
  } catch {}
  return null;
}
