'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => { setIsLoggedIn(!!localStorage.getItem('user')); }, []);
  return (
    <nav className="flex items-center justify-between bg-[#001f3f] text-white px-10 py-3 shadow-xl sticky top-0 z-50">
      <div className="flex items-center space-x-10">
        <Link href="/" className="font-black text-2xl tracking-tighter">ScoutSystem</Link>
        <div className="flex space-x-6 text-[11px] font-bold uppercase tracking-widest opacity-80">
          <Link href="/setup">⚙️ 接入</Link>
          <Link href="/download">⬇️ 下載</Link>
          <Link href="/update">📢 更新</Link>
          {isLoggedIn && <Link href="/market" className="text-yellow-400">🏪 市集</Link>}
        </div>
      </div>
      <Link href="/login" className="bg-[#007bff] px-6 py-1.5 rounded-full text-xs font-black">登入系統</Link>
    </nav>
  );
}
