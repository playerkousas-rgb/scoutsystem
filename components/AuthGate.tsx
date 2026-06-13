'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser, roleLabel, type Role, type User } from '@/lib/troupeStore';

export default function AuthGate({
  children,
  roles,
  title = '需要登入才能使用此頁面',
  applyHref = '/leader/apply',
}: {
  children: React.ReactNode;
  roles?: Role[];
  title?: string;
  applyHref?: string;
}) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => setUser(getCurrentUser() || null), []);

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="split">
        <section className="card stack">
          <span className="badge gold">Login Required</span>
          <h2>{title}</h2>
          <p className="muted">為保障成員及家長私隱，功能頁面需要先登入。瀏覽器會記錄你上一次選擇的 Demo 帳戶，正式版會改為帳戶密碼 / session 登入。</p>
          <div className="row">
            <Link className="btn primary" href="/login">登入 / 選擇帳戶</Link>
            <Link className="btn gold" href={applyHref}>申請加入系統</Link>
          </div>
        </section>
        <aside className="card">
          <h3>沒有帳戶？</h3>
          <ul className="muted">
            <li>領袖 / 教練員 / 成員：可先提交加入系統申請，由相關負責人批核。</li>
            <li>家長：可用家長註冊申請綁定子女。</li>
            <li>超級管理員：不能申請，只能由 Google Sheet 初始化。</li>
          </ul>
          <div className="row">
            <Link className="btn" href="/register">家長註冊</Link>
            <Link className="btn" href="/leader/apply">系統加入申請</Link>
          </div>
        </aside>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card stack">
        <span className="badge red">權限不足</span>
        <h2>目前身份不能使用此頁面</h2>
        <p className="muted">目前登入：{user.name}（{roleLabel[user.role]}）。請切換到合適身份。</p>
        <Link className="btn primary" href="/login">切換身份</Link>
      </div>
    );
  }

  return <>{children}</>;
}
