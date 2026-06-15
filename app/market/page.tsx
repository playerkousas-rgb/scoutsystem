'use client';
import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';

export default function Marketplace() {
  const [plugins, setPlugins] = useState([]);

  useEffect(() => {
    api.getMarketRegistry().then(data => setPlugins(data.plugins));
  }, []);

  const handleInstall = async (plugin) => {
    const res = await api.installPlugin(plugin);
    if (res.success) alert(`${plugin.title} 安裝成功！`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">旅團外掛市集</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plugins.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-2">{p.icon}</div>
            <h2 className="font-bold">{p.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{p.description}</p>
            <button 
              onClick={() => handleInstall(p)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              安裝到本旅系統
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
