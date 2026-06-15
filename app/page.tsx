'use client';
import React from 'react';
import { TROOP_REGISTRY } from '@/lib/troops';

export default function Home() {
  const troops = Object.values(TROOP_REGISTRY);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-[850px] w-full bg-white rounded-[3rem] shadow-2xl p-16 border border-gray-100">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-[#001f3f] mb-4 tracking-tight">這個功能需要先選擇旅團</h1>
          <p className="text-gray-500 leading-relaxed text-lg">
            由於每個旅團都有自己獨立的 Google Sheet / Apps Script 後台，請先選擇你所屬旅團，再繼續使用功能。
          </p>
        </header>
        <div className="grid gap-6">
          {troops.map((t: any) => (
            <div key={t.id} onClick={() => { localStorage.setItem('current_troop_id', t.id); window.location.href = '/dashboard'; }}
                 className="flex items-center justify-between p-8 border border-gray-100 rounded-[2rem] hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-[#003366] group-hover:text-blue-600">{t.name}</h3>
                  <span className="text-[10px] bg-[#e6f4ea] text-[#1e7e34] px-3 py-1 rounded-md font-black uppercase">已開通</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">代碼: {t.id} | {t.note}</p>
              </div>
              <button className="bg-[#003366] text-white px-10 py-4 rounded-[1.25rem] font-bold shadow-xl shadow-blue-100 group-hover:bg-blue-600">進入系統</button>
            </div>
          ))}
        </div>
        <footer className="mt-20 pt-10 border-t border-gray-50 text-center text-[10px] text-gray-300 tracking-[0.4em] font-bold uppercase">
          © 2026 ScoutSystem Portal powered by SKWSCOUT SYSTEM
        </footer>
      </div>
    </div>
  );
}
