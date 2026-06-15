'use client';
import React from 'react';
import { TROOP_REGISTRY } from '@/lib/troops';

export default function Home() {
  const troops = Object.values(TROOP_REGISTRY);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="max-w-[800px] w-full bg-white rounded-[2.5rem] shadow-2xl p-16 border border-gray-50 text-center md:text-left">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-[#001f3f] mb-4">這個功能需要先選擇旅團</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            由於每個旅團都有自己獨立的 Google Sheet / Apps Script 後台，請先選擇你所屬旅團，再繼續使用報考、查詢或主考相關功能。
          </p>
        </header>

        <div className="space-y-6">
          {troops.map((t: any) => (
            <div 
              key={t.id} 
              onClick={() => {
                localStorage.setItem('current_troop_id', t.id);
                window.location.href = '/dashboard';
              }}
              className="flex flex-col md:flex-row items-center justify-between p-10 border border-gray-100 rounded-[2rem] hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <div className="text-left flex-grow">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-2xl font-black text-[#003366] group-hover:text-blue-600 transition-colors">{t.name}</h3>
                  <span className="bg-[#e6f4ea] text-[#1e7e34] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">已開通</span>
                </div>
                <p className="text-sm text-gray-400">旅團代碼: {t.id}</p>
                <p className="text-xs text-gray-300 mt-2 font-medium">{t.note || '首個已接入及實際使用旅團。'}</p>
              </div>
              <button className="mt-6 md:mt-0 bg-[#001f3f] text-white px-10 py-4 rounded-[1.25rem] font-bold shadow-xl shadow-blue-100 group-hover:bg-blue-600 active:scale-95 transition-all">
                進入系統
              </button>
            </div>
          ))}
        </div>

        <footer className="mt-20 pt-10 border-t border-gray-50">
          <p className="text-[10px] text-gray-300 tracking-[0.4em] font-bold uppercase mb-2">
            © 2026 ScoutSystem Portal powered by YOUR_TEAM
          </p>
          <p className="text-[9px] text-gray-200 tracking-widest uppercase">
            Multi-district platform powered by SKWSCOUT SYSTEM
          </p>
        </footer>
      </div>
    </div>
  );
}
