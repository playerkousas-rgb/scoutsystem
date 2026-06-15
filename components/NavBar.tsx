'use client';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-[#001f3f] text-white px-10 py-3 shadow-2xl">
      <div className="flex items-center space-x-12">
        <Link href="/" className="font-black text-2xl tracking-tighter">ScoutSystem</Link>
        <div className="flex items-center space-x-8 text-[12px] font-bold uppercase tracking-widest opacity-90">
          <Link href="/activities" className="hover:text-blue-400">📅 行事曆</Link>
          <Link href="/market" className="hover:text-blue-400">🏪 元件市集</Link>
          <Link href="/setup" className="hover:text-blue-400">⚙️ 旅團接入</Link>
          <Link href="/download" className="hover:text-blue-400">⬇️ 下載</Link>
          <Link href="/update" className="hover:text-blue-400">📢 更新</Link>
          <Link href="/live" className="hover:text-blue-400">🌍 使用地區</Link>
        </div>
      </div>
      <Link href="/login" className="bg-[#007bff] hover:bg-blue-600 px-8 py-1.5 rounded-full text-sm font-black transition-all">登入系統</Link>
    </nav>
  );
}
