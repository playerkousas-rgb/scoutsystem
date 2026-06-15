'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <NavBar />
        <main style={{ padding: '24px 20px 80px', maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

function NavBar() {
  const [user, setUser] = useState<{ name: string; role: string; dashboard: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) {
          setUser({
            name: parsed.name,
            role: parsed.role,
            dashboard: parsed.dashboard || '/',
          });
          return;
        }
      }
    } catch {}
    setUser(null);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('scout-system-session-v2');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header style={{ borderBottom: '1px solid var(--line)', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="row" style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: 'var(--blue)', textDecoration: 'none' }}>
          ScoutSystem
        </Link>
        <div className="row" style={{ gap: 10 }}>
          <Link href="/calendar" className="btn" style={{ padding: '6px 12px', fontSize: 14 }}>行事曆</Link>
          <Link href="/activities" className="btn" style={{ padding: '6px 12px', fontSize: 14 }}>活動</Link>
          <Link href="/library" className="btn" style={{ padding: '6px 12px', fontSize: 14 }}>圖書館</Link>
          {user ? (
            <div className="row" style={{ gap: 8 }}>
              <Link href={user.dashboard} className="btn primary" style={{ padding: '6px 12px', fontSize: 14 }}>
                控制台
              </Link>
              <span className="badge blue" style={{ fontSize: 12, padding: '4px 8px' }}>{user.name}</span>
              <button className="btn" style={{ padding: '6px 12px', fontSize: 14 }} onClick={handleLogout}>登出</button>
            </div>
          ) : (
            <Link href="/login" className="btn primary" style={{ padding: '6px 12px', fontSize: 14 }}>登入</Link>
          )}
        </div>
      </div>
      {/* 通告橫幅 — 登入後顯示 */}
      {user && <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}><AnnouncementBanner /></div>}
    </header>
  );
}
