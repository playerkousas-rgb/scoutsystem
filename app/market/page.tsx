'use client';

import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

interface Plugin {
  id: string;
  title: string;
  icon: string;
  description: string;
  tier: number;
  url?: string;
  path?: string;
}

export default function MarketplacePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMarketRegistry()
      .then(data => {
        if (data && data.plugins) {
          setPlugins(data.plugins);
        }
      })
      .catch(err => console.error("加載市集失敗", err))
      .finally(() => setLoading(false));
  }, []);

  const handleInstall = async (plugin: Plugin) => {
    try {
      const res = await api.installPlugin(plugin);
      if (res.success) {
        alert(`${plugin.title} 安裝成功！`);
      } else {
        alert(`安裝失敗: ${res.error || '未知錯誤'}`);
      }
    } catch (err) {
      alert("請求失敗，請檢查網絡連線");
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">正在獲取市集元件...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-black text-blue-900 tracking-tight">旅團外掛市集</h1>
        <p className="text-gray-400 mt-2 text-sm">從中央轉駁器探索並掛載新功能</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plugins.length > 0 ? plugins.map((p) => (
          <div key={p.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="text-5xl mb-6">{p.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{p.title}</h2>
            <div className="flex gap-2 mb-4">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.tier === 2 ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                Tier {p.tier}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-8 flex-grow leading-relaxed">{p.description}</p>
            <button
              onClick={() => handleInstall(p)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-50"
            >
              安裝到本旅系統
            </button>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-300">市集暫無可用元件</p>
          </div>
        )}
      </div>
    </div>
  );
}
