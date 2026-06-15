'use client';
import React from 'react';
import Link from 'next/link';

interface CardProps {
  card: any;
  troopId: string; // 這是該旅團在 GS 裡定義的 ID
}

export default function CardItem({ card, troopId }: CardProps) {
  // 核心轉駁邏輯：如果是獨立系統 (Tier 3)，跳轉時帶上 ?t=旅團代碼
  let finalUrl = card.url || card.path;
  
  if (card.tier === 3 || card.type === 'jump') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}t=${troopId}`;
  }

  const isExternal = finalUrl.startsWith('http');

  return (
    <Link 
      href={finalUrl} 
      target={isExternal ? "_blank" : "_self"}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
        {card.icon || '🧩'}
      </div>
      <h3 className="font-bold text-gray-800">{card.title}</h3>
      <p className="text-xs text-gray-400 mt-1">{card.description || ''}</p>
    </Link>
  );
}
