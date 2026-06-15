'use client';
import React from 'react';
import { TROOP_REGISTRY } from '@/lib/troops';

export default function Home() {
  const troops = Object.values(TROOP_REGISTRY);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-[850px] w-full bg-white rounded-[2.5rem] shadow-2xl p-16 border border-gray-100">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">這個功能需要先選擇旅團</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            由於每個旅團都有自己獨立的 Google Sheet / Apps Script 後台，請先選擇你所屬旅團，再繼續使用功能。
          </p>
        </header>

        <div className="space-y-6">
          {troops.map((t: any) => (
            <button 
              key={t.id} 
              onClick={() => {
                localStorage.setItem('current_troop_id', t.id);
                window.location.href = '/dashboard';
              }}
              className="w-full flex items-center justify-between p-8 border border-gray-50 rounded-[1.5rem] hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
            >
              <div>
                <h3 className="text-2xl font-black text-[#003366] group-hover:text-blue-600 transition-colors">{t.name}</h3>
                <p className="text-sm text-gray-400 mt-1 font-medium">代碼: {t.id} | 已開通接入</p>
              </div>
              <span className="bg-[#e6f4ea] text-[#1e7e34] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">已開通</span>
            </button>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-300 tracking-[0.4em] font-bold uppercase">
            © 2026 ScoutSystem Portal powered by SKWSCOUT SYSTEM
          </p>
        </footer>
      </div>
    </div>
  );
}
