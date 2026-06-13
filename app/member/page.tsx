'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBranchName, getCurrentUser, getData, isFutureEvent, setCurrentUser, type AppData, type User } from '@/lib/troupeStore';

const DBS_URL = 'https://dbs-teal-iota.vercel.app/';

export default function MemberPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | undefined>();
  useEffect(() => { const d = getData(); const current = getCurrentUser(); if (current) setCurrentUser(current.id); setData(d); setUser(current); }, []);
  if (!data || !user || user.role !== 'member') return <div className="card stack"><h2>請先登入成員帳戶。</h2><Link className="btn primary" href="/login">前往登入</Link><Link className="btn gold" href="/apply">申請加入系統</Link></div>;

  const member = data.members.find(m => m.id === user.memberId);
  const branch = data.branches.find(b => b.id === user.branchId);
  const branchEvents = data.events.filter(e => isFutureEvent(e) && (e.scope === 'troop' || e.branchId === user.branchId || e.targetMemberIds.includes(user.memberId || '')));
  const branchLeaders = data.users.filter(u => u.branchId === user.branchId && ['group_leader', 'branch_leader', 'coach'].includes(u.role));
  const isScoutSection = branch?.section === '童軍';

  return <div className="stack">
    <section className="card row" style={{ justifyContent: 'space-between' }}>
      <div><span className="badge blue">成員頁面</span><h2>{member?.name || user.name}</h2><p className="muted">目標：日後可一鍵帶入資料填寫 PT/03 活動 / 訓練班報名表。</p></div>
      <div className="row"><Link className="btn" href="/login">身份切換</Link>{isScoutSection && <a className="btn gold" href={DBS_URL} target="_blank">🎖️ 專科徽章報考 DBS</a>}</div>
    </section>

    <section className="grid">
      <div className="card"><h3>我的支部</h3><p>{getBranchName(data, user.branchId)}</p><p className="muted">{member?.patrol} · {member?.rank}</p></div>
      <div className="card"><h3>成員編號</h3><p>{member?.ymNumber}</p><p className="muted">對應 PT/03 Scout ID / YMIS。</p></div>
      <div className="card"><h3>未來活動</h3><p style={{ fontSize: 32, margin: 0, color: 'var(--blue)' }}>{branchEvents.length}</p><p className="muted">支部 / 全旅活動</p></div>
    </section>

    <section className="card stack">
      <h3>PT/03 報名表資料庫</h3>
      <p className="muted">這裡集中保存報名表常用資料。日後如資料有變，成員 / 家長只需在系統更新一次，之後報名表即可一鍵帶入。</p>
      <table className="table"><tbody>
        <Row label="姓名（中文）" value={member?.nameChinese || member?.name} />
        <Row label="姓名（英文）" value={member?.nameEnglish} />
        <Row label="性別" value={member?.gender} />
        <Row label="出生日期" value={member?.dateOfBirth} />
        <Row label="身份證號碼" value={member?.hkidMasked ? '已記錄' : '未填 / 不收集'} />
        <Row label="通訊地址" value={member?.address} />
        <Row label="聯絡電話" value={member?.phone} />
        <Row label="電郵地址" value={member?.email || user.email} />
        <Row label="團 / Section" value={branch?.section} />
        <Row label="旅 / Group" value={member?.groupName} />
        <Row label="區 / District" value={member?.district} />
        <Row label="地域 / Region" value={member?.region} />
        <Row label="職位 / Rank" value={member?.rank} />
        <Row label="童軍成員編號 / Scout ID" value={member?.ymNumber} />
        <Row label="委任證 / 委任書編號" value={member?.appointmentNo} />
        <Row label="緊急事故聯絡人" value={member?.emergencyContactName} />
        <Row label="關係" value={member?.emergencyContactRelation} />
        <Row label="緊急聯絡電話" value={member?.emergencyContactPhone || member?.emergencyPhone} />
        <Row label="特別健康情況 / 醫療備註" value={member?.medicalNotes} />
        <Row label="過敏備註" value={member?.allergyNotes} />
        <Row label="附加資料" value={member?.additionalInfo} />
      </tbody></table>
      <div className="row"><button className="btn primary">編輯我的資料（接入後開放）</button><button className="btn">一鍵填寫 PT/03（預留）</button></div>
    </section>

    <section className="split"><div className="card stack"><h3>支部領袖</h3><table className="table"><tbody>{branchLeaders.map(l => <tr key={l.id}><td>{l.name}</td><td>{l.email}</td></tr>)}</tbody></table></div><div className="card stack"><h3>我的活動</h3>{branchEvents.map(e => <div className="card" style={{ boxShadow: 'none' }} key={e.id}><strong>{e.title}</strong><p className="muted">{e.date} · {e.location}</p><p>{e.description}</p></div>)}</div></section>
  </div>;
}

function Row({ label, value }: { label: string; value?: any }) {
  return <tr><th style={{ width: '32%' }}>{label}</th><td>{value || <span className="muted">未填</span>}</td></tr>;
}
