'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser, getData, logout, resetData, roleLabel, setCurrentUser, type AppData, type User } from '@/lib/troupeStore';

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

  const approvedUsers = data.users.filter(u => u.approved !== false);
  const pendingUsers = data.users.filter(u => u.approved === false);

  return (
    <div className="split">
      <section className="card stack">
        <div>
          <span className="badge blue">Demo Authentication</span>
          <h2>登入 / 切換身份</h2>
          <p className="muted">MVP 暫以 Demo 帳號模擬權限。日後可接駁正式登入與審核流程。</p>
        </div>

        {current ? (
          <div className="notice">
            目前身份：<strong>{current.name}</strong>（{roleLabel[current.role]}）
          </div>
        ) : (
          <div className="notice">尚未登入。請選擇一個 Demo 身份開始。</div>
        )}

        <div className="grid">
          {approvedUsers.map(user => (
            <button key={user.id} className="btn block" onClick={() => choose(user.id)}>
              {user.role === 'parent' ? '👪' : '🛡️'} {user.name} · {roleLabel[user.role]}
            </button>
          ))}
        </div>

        <div className="row">
          <Link className="btn primary" href={current?.role === 'parent' ? '/parent' : '/admin'}>進入對應入口</Link>
          <button className="btn" onClick={() => { logout(); setCurrent(undefined); }}>登出</button>
          <button className="btn red" onClick={doReset}>重置 Demo 資料</button>
        </div>
      </section>

      <aside className="card">
        <h3>待審家長帳號</h3>
        <p className="muted">家長可自行註冊，但需由管理後台審核後才能登入。</p>
        <table className="table">
          <tbody>
            {pendingUsers.map(user => (
              <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><span className="badge gold">待審</span></td></tr>
            ))}
            {pendingUsers.length === 0 && <tr><td className="muted">暫無待審帳號</td></tr>}
          </tbody>
        </table>
        <hr />
        <Link className="btn gold block" href="/register">建立家長註冊申請</Link>
      </aside>
    </div>
  );
}
