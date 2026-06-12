'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getBranchName, getCurrentUser, getData, isFutureEvent, saveData, setCurrentUser, type AppData, type ReplyStatus, type User } from '@/lib/troupeStore';

const replyText: Record<ReplyStatus, string> = { pending: '未回覆', yes: '出席', no: '不出席' };

export default function ParentPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    const d = getData();
    const current = getCurrentUser() || d.users.find(u => u.role === 'parent' && u.approved !== false);
    if (current) setCurrentUser(current.id);
    setData(d);
    setUser(current);
  }, []);

  const parentUsers = data?.users.filter(u => u.role === 'parent' && u.approved !== false) || [];

  const children = useMemo(() => {
    if (!data || !user) return [];
    return data.members.filter(m => m.parentUserId === user.id);
  }, [data, user]);

  const rows = useMemo(() => {
    if (!data || !user) return [];
    const childIds = new Set(children.map(c => c.id));
    return data.replies
      .filter(r => childIds.has(r.memberId))
      .map(reply => ({
        reply,
        event: data.events.find(e => e.id === reply.eventId),
        member: data.members.find(m => m.id === reply.memberId),
      }))
      .filter(row => row.event && isFutureEvent(row.event))
      .sort((a, b) => String(a.event!.date).localeCompare(String(b.event!.date)));
  }, [data, user, children]);

  const updateReply = (replyId: string, status: ReplyStatus) => {
    if (!data) return;
    const next = {
      ...data,
      replies: data.replies.map(r => r.id === replyId ? { ...r, status, updatedAt: new Date().toISOString() } : r),
      notifications: data.notifications.map(n => n.parentUserId === user?.id ? { ...n, status: 'read' as const } : n),
    };
    saveData(next);
    setData(next);
  };

  if (!data || !user) return <LoginHint />;
  if (user.role !== 'parent') return <LoginHint message="目前登入身份不是家長，請切換到家長帳號。" />;
  if (user.approved === false) return <LoginHint message="此家長帳號尚未審批，暫不能查看成員資料。" />;

  const unread = data.notifications.filter(n => n.parentUserId === user.id && n.status === 'queued').length;

  return (
    <div className="stack">
      <section className="card row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="badge blue">家長入口</span>
          <h2 style={{ marginBottom: 4 }}>你好，{user.name}</h2>
          <p className="muted">集中管理所有已綁定子女，不需切換支部帳號。</p>
        </div>
        <div className="row">
          <select className="select" style={{ width: 220 }} value={user.id} onChange={e => { const u = data.users.find(x => x.id === e.target.value); setCurrentUser(e.target.value); setUser(u); }}>
            {parentUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <Link className="btn" href="/register">新增註冊</Link>
        </div>
      </section>

      <section className="grid">
        <div className="card"><span className="badge">已綁定成員</span><h2>{children.length}</h2><p className="muted">可跨支部顯示</p></div>
        <div className="card"><span className="badge gold">待回覆活動</span><h2>{rows.filter(r => r.reply.status === 'pending').length}</h2><p className="muted">未來活動預設顯示</p></div>
        <div className="card"><span className="badge blue">通知佇列</span><h2>{unread}</h2><p className="muted">外部推播接口預留</p></div>
      </section>

      <section className="card">
        <h3>我的子女</h3>
        <div className="grid">
          {children.map(member => (
            <div key={member.id} className="card" style={{ boxShadow: 'none' }}>
              <strong>{member.name}</strong>
              <p className="muted">{getBranchName(data, member.branchId)} · {member.patrol || '未分隊'} · {member.ymNumber}</p>
            </div>
          ))}
          {children.length === 0 && <p className="muted">此帳號尚未綁定成員。</p>}
        </div>
      </section>

      <section className="card stack">
        <h3>未來活動與回覆</h3>
        {rows.map(({ reply, event, member }) => (
          <div key={reply.id} className="card" style={{ boxShadow: 'none' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <span className={reply.status === 'yes' ? 'badge green' : reply.status === 'no' ? 'badge red' : 'badge gold'}>{replyText[reply.status]}</span>
                <h3 style={{ marginBottom: 6 }}>{event!.title}</h3>
                <p className="muted">{event!.date} · {event!.location} · {getBranchName(data, event!.branchId)} · 成員：{member?.name}</p>
                <p>{event!.description}</p>
              </div>
              <div className="row">
                <button className="btn green" onClick={() => updateReply(reply.id, 'yes')}>出席</button>
                <button className="btn red" onClick={() => updateReply(reply.id, 'no')}>不出席</button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="muted">暫無需要回覆的未來活動。</p>}
      </section>
    </div>
  );
}

function LoginHint({ message = '請先登入家長帳號。' }: { message?: string }) {
  return <div className="card stack"><h2>{message}</h2><Link className="btn primary" href="/login">前往登入</Link></div>;
}
