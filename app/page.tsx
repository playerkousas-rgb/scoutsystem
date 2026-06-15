'use client';
import React from 'react';
import { TROOP_REGISTRY } from '@/lib/troops';
export default function Home() {
  const troops = Object.values(TROOP_REGISTRY);
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="max-w-[850px] w-full bg-white rounded-[2.5rem] shadow-2xl p-16 border border-gray-100">
        <h1 className="text-3xl font-black text-[#001f3f] mb-4">這個功能需要先選擇旅團</h1>
        <p className="text-gray-400 mb-10 text-lg">由於每個旅團都有獨立的後台，請先選擇你所屬旅團，再繼續使用報名、管理或市集功能。</p>
        <div className="space-y-6">
          {troops.map((t: any) => (
            <button key={t.id} onClick={() => { localStorage.setItem('current_troop_id', t.id); window.location.href = '/login'; }}
                    className="w-full flex items-center justify-between p-10 border border-gray-100 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50 transition-all group text-left">
              <div>
                <h3 className="text-2xl font-black text-[#003366] group-hover:text-blue-600 transition-colors">{t.name}</h3>
                <p className="text-sm text-gray-400 mt-1">代碼: {t.id} | 已開通全能接入</p>
              </div>
              <span className="bg-[#e6f4ea] text-[#1e7e34] px-5 py-2 rounded-full text-xs font-black uppercase">已開通</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
