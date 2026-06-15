'use client';
import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

export default function MarketPage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMarketRegistry()
      .then(data => { if (data && data.plugins) setPlugins(data.plugins); })
      .finally(() => setLoading(false));
  }, []);

  const handleInstall = async (plugin: any) => {
    const res = await api.installTroopPlugin(plugin);
    if (res.success) alert(`${plugin.title} 安裝成功！`);
  };

  if (loading) return <div className="p-20 text-center">正在獲取市集元件...</div>;

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black text-[#001f3f] mb-12">旅團元件市集</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plugins.map(p => (
          <div key={p.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div className="text-6xl mb-6">{p.icon}</div>
            <h2 className="text-2xl font-bold mb-4">{p.title}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{p.description}</p>
            <button onClick={() => handleInstall(p)} className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black">一鍵安裝</button>
          </div>
        ))}
      </div>
    </div>
  );
}
