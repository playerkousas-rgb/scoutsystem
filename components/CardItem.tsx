'use client';
import Link from 'next/link';
export default function CardItem({ card, troopId }: { card: any, troopId: string }) {
  let finalUrl = card.url || card.path;
  if (card.tier === 3) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}t=${troopId}`;
  }
  const isExternal = finalUrl.startsWith('http');
  return (
    <Link href={finalUrl} target={isExternal ? "_blank" : "_self"} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center group">
      <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{card.icon || '🧩'}</div>
      <h3 className="font-bold text-gray-800 text-xl mb-2">{card.title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed mb-4">{card.description || '點擊進入模組'}</p>
      <div className="mt-auto px-4 py-1 bg-gray-50 text-[10px] text-gray-400 rounded-full font-black uppercase tracking-widest">Tier {card.tier}</div>
    </Link>
  );
}
