'use client';

import './globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // 簡單模擬登入狀態（之後會改成真實 session）
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(loggedIn);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  // 根據角色決定個人入口
  const getPersonalLink = () => {
    if (!userRole) return null;
    if (['super_admin', 'admin'].includes(userRole)) return { href: '/admin', label: '後台' };
    if (['group_leader', 'branch_leader', 'coach'].includes(userRole)) return { href: '/leader', label: '領袖頁面' };
    if (userRole === 'parent') return { href: '/parent', label: '家長頁面' };
    if (userRole === 'member') return { href: '/member', label: '成員頁面' };
    return null;
  };

  const personalLink = getPersonalLink();

  return (
    <html lang="zh-HK">
      <body className="bg-gray-50 text-gray-900">
        {/* 頂欄 - 深藍色風格 */}
        <nav className="bg-[#1e3a5f] text-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* 左側 Logo + 公共連結 */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                ScoutSystem
              </Link>
              <div className="hidden md:flex items-center gap-5 text-sm">
                <Link href="/calendar" className="hover:text-blue-300">行事曆</Link>
                <Link href="/activities" className="hover:text-blue-300">活動與通告</Link>
              </div>
            </div>

            {/* 右側：登入/登出 + 個人入口 */}
            <div className="flex items-center gap-3 text-sm">
              {isLoggedIn && personalLink && (
                <Link 
                  href={personalLink.href} 
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  {personalLink.label}
                </Link>
              )}

              {isLoggedIn ? (
                <button 
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-lg hover:bg-white/10"
                >
                  登出
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  登入
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 主要內容 */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
          © 2026 SKWSCOUT
        </footer>
      </body>
    </html>
  );
}
