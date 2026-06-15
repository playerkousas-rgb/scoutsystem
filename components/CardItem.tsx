'use client';
import React from 'react';
import Link from 'next/link';

export default function CardItem({ card, troopId }: { card: any, troopId: string }) {
  let finalUrl = card.url || card.path;
  
  // Tier 3 獨立系統跳轉：由 Portal 自動附加旅團代碼 t=xxx
  if (card.tier === 3 || card.type === 'jump') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}t=${troopId}`;
  }

  const isExternal = finalUrl.startsWith('http');

  return (
    <Link 
      href={finalUrl} 
      target={isExternal ? "_blank" : "_self"}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col items-center text-center group"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
        {card.icon || '🧩'}
      </div>
      <h3 className="font-bold text-gray-800 text-lg">{card.title}</h3>
      <p className="text-xs text-gray-400 mt-2">{card.description || '旅團功能模組'}</p>
    </Link>
  );
}
