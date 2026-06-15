'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => { setIsLoggedIn(!!localStorage.getItem('user')); }, []);

  return (
    <nav className="flex items-center justify-between bg-[#001f3f] text-white px-10 py-3 shadow-xl sticky top-0 z-50">
      <div className="flex items-center space-x-12">
        <Link href="/" className="font-black text-2xl tracking-tighter">ScoutSystem</Link>
        <div className="flex items-center space-x-6 text-[11px] font-bold uppercase tracking-widest opacity-80">
          <Link href="/setup" className="hover:text-blue-400">⚙️ 接入</Link>
          <Link href="/download" className="hover:text-blue-400">⬇️ 下載</Link>
          <Link href="/update" className="hover:text-blue-400">📢 更新</Link>
          {isLoggedIn && <Link href="/market" className="text-yellow-400 font-black">🏪 市集</Link>}
        </div>
      </div>
      <div className="flex gap-4">
        {isLoggedIn ? (
          <button onClick={() => { localStorage.removeItem('user'); window.location.href='/'; }} className="text-xs font-bold opacity-60">登出</button>
        ) : (
          <Link href="/login" className="bg-[#007bff] px-8 py-2 rounded-full text-[11px] font-black">登入系統</Link>
        )}
      </div>
    </nav>
  );
}
