'use client';
import React from 'react';
import { TROOP_REGISTRY } from '@/lib/troops';

export default function Home() {
  const troops = Object.values(TROOP_REGISTRY);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-2xl p-12 border border-gray-100">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-800 mb-2">這個功能需要先選擇旅團</h1>
          <p className="text-gray-400">由於每個旅團都有自己獨立的 Google Sheet / Apps Script 後台，請先選擇你所屬旅團，再繼續使用功能。</p>
        </header>

        <div className="space-y-4">
          {troops.map((t: any) => (
            <button 
              key={t.id} 
              onClick={() => {
                localStorage.setItem('current_troop_id', t.id);
                window.location.href = '/dashboard';
              }}
              className="w-full flex items-center justify-between p-6 border border-gray-100 rounded-3xl hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
            >
              <div>
                <h3 className="text-xl font-bold text-blue-900 group-hover:text-blue-600">{t.name}</h3>
                <p className="text-xs text-gray-400 mt-1">代碼: {t.id} | {t.note}</p>
              </div>
              <span className="bg-green-50 text-green-600 px-4 py-1 rounded-full text-xs font-black">已開通</span>
            </button>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-50 text-center text-[10px] text-gray-300 tracking-widest uppercase">
          © 2026 ScoutSystem Portal powered by YOUR_NAME
        </footer>
      </div>
    </div>
  );
}
