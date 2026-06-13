'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getBranchName, getCurrentUser, getData, isFutureEvent, saveData, setCurrentUser, type AppData, type ReplyStatus, type User } from '@/lib/troupeStore';

const replyText: Record<ReplyStatus, string> = { pending: '未回覆', yes: '出席', no: '不出席' };

export default function ParentPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ school: '', emergencyPhone: '' });

  useEffect(() => {
    const d = getData();
    const current = getCurrentUser() || d.users.find(u => u.role === 'parent' && u.approved !== false);
    if (current) setCurrentUser(current.id);
    setData(d); setUser(current);
  }, []);

  const children = useMemo(() => (!data || !user) ? [] : data.members.filter(m => m.parentUserId === user.id), [data, user]);
  const branchIds = new Set(children.map(c => c.branchId));
  const rows = useMemo(() => {
    if (!data || !user) return [];
    const childIds = new Set(children.map(c => c.id));
    return data.replies.filter(r => childIds.has(r.memberId)).map(reply => ({ reply, event: data.events.find(e => e.id === reply.eventId), member: data.members.find(m => m.id === reply.memberId) })).filter(row => row.event && isFutureEvent(row.event)).sort((a, b) => String(a.event!.date).localeCompare(String(b.event!.date)));
  }, [data, user, children]);
  const visibleEvents = data?.events.filter(e => isFutureEvent(e) && (e.scope === 'troop' || (e.branchId && branchIds.has(e.branchId)))) || [];

  const updateReply = (replyId: string, status: ReplyStatus) => {
    if (!data) return;
    const next = { ...data, replies: data.replies.map(r => r.id === replyId ? { ...r, status, updatedAt: new Date().toISOString() } : r), notifications: data.notifications.map(n => n.parentUserId === user?.id ? { ...n, status: 'read' as const } : n) };
    saveData(next); setData(next);
  };
  const startEdit = (memberId: string) => { const m = data?.members.find(x => x.id === memberId); setEditing(memberId); setDraft({ school: m?.school || '', emergencyPhone: m?.emergencyPhone || '' }); };
  const saveChild = () => { if (!data || !editing) return; const next = { ...data, members: data.members.map(m => m.id === editing ? { ...m, school: draft.school, emergencyPhone: draft.emergencyPhone } : m) }; saveData(next); setData(next); setEditing(null); };

  if (!data || !user || user.role !== 'parent' || user.approved === false) return <div className="card stack"><h2>請先登入已核准家長帳戶。</h2><Link className="btn primary" href="/login">前往登入</Link></div>;

  return <div className="stack">
    <section className="card row" style={{ justifyContent: 'space-between' }}><div><span className="badge blue">家長頁面</span><h2>你好，{user.name}</h2><p className="muted">編輯子女資料，查看相關支部或全旅活動。</p></div><Link className="btn" href="/login">身份切換</Link></section>
    <section className="grid"><div className="card"><span className="badge">已綁定子女</span><h2>{children.length}</h2><p className="muted">可跨支部</p></div><div className="card"><span className="badge gold">待回覆</span><h2>{rows.filter(r => r.reply.status === 'pending').length}</h2><p className="muted">活動報名</p></div><div className="card"><span className="badge blue">相關活動</span><h2>{visibleEvents.length}</h2><p className="muted">支部 / 旅活動</p></div></section>
    <section className="card"><h3>子女資料</h3><div className="grid">{children.map(member => <div key={member.id} className="card" style={{ boxShadow: 'none' }}><strong>{member.name}</strong><p className="muted">{getBranchName(data, member.branchId)} · {member.patrol || '未分隊'} · {member.ymNumber}</p>{editing === member.id ? <div className="stack"><input className="input" placeholder="學校" value={draft.school} onChange={e => setDraft({ ...draft, school: e.target.value })} /><input className="input" placeholder="緊急電話" value={draft.emergencyPhone} onChange={e => setDraft({ ...draft, emergencyPhone: e.target.value })} /><button className="btn primary" onClick={saveChild}>儲存</button></div> : <><p>學校：{member.school || '-'}<br />緊急電話：{member.emergencyPhone || '-'}</p><button className="btn" onClick={() => startEdit(member.id)}>編輯子女資料</button></>}</div>)}</div></section>
    <section className="card stack"><h3>待回覆活動</h3>{rows.map(({ reply, event, member }) => <div key={reply.id} className="card" style={{ boxShadow: 'none' }}><div className="row" style={{ justifyContent: 'space-between' }}><div><span className={reply.status === 'yes' ? 'badge green' : reply.status === 'no' ? 'badge red' : 'badge gold'}>{replyText[reply.status]}</span><h3>{event!.title}</h3><p className="muted">{event!.date} · {event!.location} · 成員：{member?.name}</p><p>{event!.description}</p></div><div className="row"><button className="btn green" onClick={() => updateReply(reply.id, 'yes')}>出席</button><button className="btn red" onClick={() => updateReply(reply.id, 'no')}>不出席</button></div></div></div>)}{rows.length === 0 && <p className="muted">暫無需要回覆的活動。</p>}</section>
  </div>;
}
