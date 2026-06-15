'use client';
import React from 'react';
import { TROOP_REGISTRY } from '@/lib/troops';

export default function LandingPage() {
  const troops = Object.values(TROOP_REGISTRY);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="max-w-[800px] w-full bg-white rounded-[3rem] shadow-2xl p-16 border border-gray-100">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">這個功能需要先選擇旅團</h1>
          <p className="text-gray-400 text-lg">
            由於每個旅團都有自己獨立的 Google Sheet / Apps Script 後台，請先選擇你所屬旅團，再繼續使用報考、查詢或主考相關功能。
          </p>
        </header>

        <div className="space-y-6">
          {troops.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-8 border border-gray-50 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-blue-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                  <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase">已開通</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">旅團代碼: {t.id} | {t.note}</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('current_troop_id', t.id);
                  window.location.href = '/dashboard';
                }}
                className="bg-blue-600 text-white px-10 py-4 rounded-[1.25rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                進入系統
              </button>
            </div>
          ))}
        </div>

        <footer className="mt-20 pt-10 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-300 tracking-[0.3em] font-bold uppercase">
            © 2026 ScoutSystem Portal powered by YOUR_TEAM
          </p>
        </footer>
      </div>
    </div>
  );
}
