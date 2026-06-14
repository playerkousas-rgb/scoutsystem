'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser, roleLabel, type Role, type User } from '@/lib/troupeStore';

const CURRENT_USER_KEY = 'currentUser';

function getSessionUser(): User | null | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // 優先讀 troupeStore 的 SESSION_KEY
  const stored = getCurrentUser();
  if (stored) return stored;

  // 其次讀 login 頁寫入的 currentUser
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.userId) {
        return {
          id: parsed.userId,
          userId: parsed.userId,
          name: parsed.name,
          email: parsed.email,
          role: parsed.role,
          approved: true,
        } as User;
      }
    }
  } catch {}

  return null;
}

export default function AuthGate({
  children,
  roles,
  title = '需要登入才能使用此頁面',
  applyHref = '/apply',
}: {
  children: React.ReactNode;
  roles?: Role[];
  title?: string;
  applyHref?: string;
}) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // ★ 直接讀 currentUser（login 頁寫入的），不依賴 troupeStore 的 mock data
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.userId) {
          setUser({
            id: parsed.userId,
            userId: parsed.userId,
            name: parsed.name,
            email: parsed.email,
            role: parsed.role,
            branchId: parsed.branchId,
            approved: true,
          } as User);
          return;
        }
      }
    } catch {}
    setUser(null);
  }, []);

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="stack" style={{ maxWidth: 560, margin: '60px auto' }}>
        <section className="card">
          <span className="badge red">Login Required</span>
          <h2>{title}</h2>
          <p className="muted">為保障成員及家長私隱，功能頁面需要先登入。瀏覽器會記錄你上一次選擇的帳戶。</p>
          <div className="row" style={{ marginTop: 16 }}>
            <Link href="/login" className="btn primary">登入 / 選擇帳戶</Link>
            <Link href={applyHref} className="btn">申請加入系統</Link>
          </div>
        </section>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="stack" style={{ maxWidth: 560, margin: '60px auto' }}>
        <section className="card">
          <span className="badge red">權限不足</span>
          <h2>目前身份不能使用此頁面</h2>
          <p className="muted">目前登入：{user.name}（{roleLabel[user.role]}）。請切換到合適身份。</p>
          <div className="row" style={{ marginTop: 16 }}>
            <Link href="/login" className="btn primary">切換身份</Link>
          </div>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}
