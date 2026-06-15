'use client';
import Link from 'next/link';

export default function CardItem({ card, troopId }: { card: any, troopId: string }) {
  let finalUrl = card.url || card.path;
  if (card.tier === 3 || card.type === 'jump') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}t=${troopId}`;
  }
  const isExternal = finalUrl.startsWith('http');
  return (
    <Link href={finalUrl} target={isExternal ? "_blank" : "_self"} className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:shadow-2xl transition-all flex flex-col items-center text-center group">
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{card.icon || '🧩'}</div>
      <h3 className="font-bold text-gray-800 text-lg">{card.title}</h3>
      <div className="mt-3 px-3 py-1 bg-gray-50 text-[9px] text-gray-400 rounded-full font-bold uppercase">Tier {card.tier}</div>
    </Link>
  );
}
