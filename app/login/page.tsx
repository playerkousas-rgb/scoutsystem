'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminRoles, getCurrentUser, getData, leaderRoles, logout, resetData, roleLabel, setCurrentUser, type AppData, type Role, type User } from '@/lib/troupeStore';

function landing(role?: Role) {
  if (!role) return '/';
  if (adminRoles.includes(role)) return '/admin';
  if (leaderRoles.includes(role)) return '/leader';
  if (role === 'parent') return '/parent';
  if (role === 'member') return '/member';
  return '/';
}

export default function LoginPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [current, setCurrent] = useState<User | undefined>();

  useEffect(() => {
    const d = getData();
    setData(d);
    setCurrent(getCurrentUser());
  }, []);

  const choose = (id: string) => {
    setCurrentUser(id);
    setCurrent(getData().users.find(u => u.id === id));
  };

  const doReset = () => {
    const d = resetData();
    logout();
    setData(d);
    setCurrent(undefined);
  };

  if (!data) return null;

  const sections = [
    { title: '後台帳戶', hint: '超級管理員只能由 Google Sheet 初始化；管理員由超級管理員建立。', users: data.users.filter(u => adminRoles.includes(u.role) && u.approved !== false) },
    { title: '領袖頁面帳戶', hint: '團長 / 支部領袖 / 教練員統一進入領袖頁面，依支部限制權限。', users: data.users.filter(u => leaderRoles.includes(u.role) && u.approved !== false) },
    { title: '家長 / 成員帳戶', hint: '家長管理子女資料；成員查看自己支部及個人資料。', users: data.users.filter(u => ['parent', 'member'].includes(u.role) && u.approved !== false) },
  ];

  return (
    <div className="split">
      <section className="card stack">
        <div>
          <span className="badge blue">Demo Identity Console</span>
          <h2>登入 / 切換身份</h2>
          <p className="muted">現階段先用 Demo 按鈕模擬登入。下一步接 Google Sheet 後，超級管理員帳戶會只在 Sheet 直接設定，不能由前台申請。</p>
        </div>

        {current ? <div className="notice">目前身份：<strong>{current.name}</strong>（{roleLabel[current.role]}）</div> : <div className="notice">尚未登入。請選擇一個身份開始檢視 UI。</div>}

        {sections.map(section => (
          <div key={section.title} className="stack">
            <h3>{section.title}</h3>
            <p className="muted">{section.hint}</p>
            <div className="grid">
              {section.users.map(user => (
                <button key={user.id} className="btn block" onClick={() => choose(user.id)}>
                  {adminRoles.includes(user.role) ? '🔐' : leaderRoles.includes(user.role) ? '🧭' : user.role === 'parent' ? '👪' : '🧒'} {user.name} · {roleLabel[user.role]}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="row">
          <Link className="btn primary" href={landing(current?.role)}>進入目前身份控制台</Link>
          <button className="btn" onClick={() => { logout(); setCurrent(undefined); }}>登出</button>
          <button className="btn red" onClick={doReset}>重置 Demo 資料</button>
        </div>
      </section>

      <aside className="card stack">
        <h3>身份及入口規則</h3>
        <table className="table">
          <tbody>
            <tr><th>超級管理員</th><td>不能申請，只能由 Google Sheet 開始設定帳戶及密碼。</td></tr>
            <tr><th>管理員</th><td>由超級管理員在後台建立，可看及管理所有支部。</td></tr>
            <tr><th>團長</th><td>可自由申請，由管理員 / 超級管理員批核。</td></tr>
            <tr><th>支部領袖 / 教練員</th><td>可自由申請，由相關支部團長批核。</td></tr>
            <tr><th>家長</th><td>管理子女資料及查看相關支部 / 全旅活動。</td></tr>
            <tr><th>成員</th><td>查看自己支部資料及個人活動。</td></tr>
          </tbody>
        </table>
        <Link className="btn gold block" href="/leader/apply">申請領袖 / 教練員帳戶</Link>
      </aside>
    </div>
  );
}
