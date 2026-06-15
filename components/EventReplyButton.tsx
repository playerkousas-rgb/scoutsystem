'use client';

import { useState } from 'react';
import { useEventReplies } from '@/components/useEventReplies';

/**
 * 活動報名按鈕組
 * - 成員/家長：可按 ❤️ 有興趣、💰 已報名
 * - 領袖/管理員：可展開看報名名單、標記付費、取消報名
 * - 管理員/超管能看到所有東西
 */
export default function EventReplyButton({ eventId }: { eventId: string }) {
  const { myType, setReply, cancelReply, eventReplies, setPaid, cancelUserReply, reload, isLeader } = useEventReplies(eventId);
  const [showList, setShowList] = useState(false);

  const isInterested = myType === 'interested';
  const isRegistered = myType === 'registered';

  return (
    <div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => isInterested ? cancelReply() : setReply('interested')}
          className="btn"
          style={{
            fontSize: 14, padding: '6px 14px',
            background: isInterested ? '#fee2e2' : '#f5f5f5',
            border: isInterested ? '2px solid #ef4444' : '1px solid #ddd',
          }}
        >
          {isInterested ? '❤️ 有興趣' : '🤍 有興趣'}
        </button>
        <button
          onClick={() => isRegistered ? cancelReply() : setReply('registered')}
          className="btn"
          style={{
            fontSize: 14, padding: '6px 14px',
            background: isRegistered ? '#fef3c7' : '#f5f5f5',
            border: isRegistered ? '2px solid #f59e0b' : '1px solid #ddd',
          }}
        >
          {isRegistered ? '💰 已報名' : '🪙 報名'}
        </button>
        {isLeader && (
          <button
            onClick={() => { setShowList(!showList); reload(); }}
            className="btn primary"
            style={{ fontSize: 14, padding: '6px 14px' }}
          >
            📋 報名名單 ({eventReplies.interested.length + eventReplies.registered.length})
          </button>
        )}
      </div>

      {/* 領袖/管理員：報名名單 */}
      {isLeader && showList && (
        <div className="card" style={{ boxShadow: 'none', background: '#f9fafb', marginTop: 12, fontSize: 14 }}>
          {/* 已報名 */}
          {eventReplies.registered.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>💰 已報名（{eventReplies.registered.length}）</h4>
              {eventReplies.registered.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                  <span>
                    {r.userName || r.userId}
                    {r.role && <span className="muted"> ({r.role === 'parent' ? '家長' : r.role === 'member' ? '成員' : r.role})</span>}
                  </span>
                  <span className="row" style={{ gap: 6 }}>
                    <button
                      className="btn"
                      style={{ fontSize: 12, padding: '2px 8px',
                        background: String(r.paid).toLowerCase() === 'true' ? '#dcfce7' : '#f5f5f5',
                        color: String(r.paid).toLowerCase() === 'true' ? '#15803d' : '#666',
                      }}
                      onClick={() => setPaid(r.userId, !(String(r.paid).toLowerCase() === 'true'))}
                    >
                      {String(r.paid).toLowerCase() === 'true' ? '✓ 已付費' : '未付費'}
                    </button>
                    <button className="btn" style={{ fontSize: 12, padding: '2px 8px', color: '#b91c1c' }} onClick={() => cancelUserReply(r.userId)}>
                      取消
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 有興趣 */}
          {eventReplies.interested.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>❤️ 有興趣（{eventReplies.interested.length}）</h4>
              {eventReplies.interested.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                  <span>
                    {r.userName || r.userId}
                    {r.role && <span className="muted"> ({r.role === 'parent' ? '家長' : r.role === 'member' ? '成員' : r.role})</span>}
                  </span>
                  <button className="btn" style={{ fontSize: 12, padding: '2px 8px', color: '#b91c1c' }} onClick={() => cancelUserReply(r.userId)}>
                    移除
                  </button>
                </div>
              ))}
            </div>
          )}

          {eventReplies.registered.length === 0 && eventReplies.interested.length === 0 && (
            <p className="muted">暫無人報名或有興趣。</p>
          )}
        </div>
      )}
    </div>
  );
}
