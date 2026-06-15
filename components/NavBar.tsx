'use client';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-[#001f3f] text-white px-10 py-4 shadow-xl">
      <div className="flex items-center space-x-10">
        <Link href="/" className="font-black text-2xl tracking-tighter">ScoutSystem</Link>
        <div className="flex items-center space-x-8 text-[13px] font-bold opacity-80 uppercase tracking-wide">
          <Link href="/activities" className="hover:opacity-100">📅 行事曆</Link>
          <Link href="/market" className="hover:opacity-100">🏪 外掛市集</Link>
          <Link href="/setup" className="hover:opacity-100">⚙️ 旅團接入</Link>
          <Link href="/download" className="hover:opacity-100">⬇️ 下載</Link>
          <Link href="/update" className="hover:opacity-100">📢 更新</Link>
        </div>
      </div>
      <Link href="/login" className="bg-blue-600 px-8 py-2 rounded-full text-sm font-black hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">登入</Link>
    </nav>
  );
}
