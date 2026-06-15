'use client';
import { getAccessibleCards } from '@/lib/registry';
import Link from 'next/link';

export default function DashboardPage({ user, activeModules }: { user: any, activeModules: string[] }) {
  // 根據角色和啟用的模組，動態計算卡片陣列
  const cards = getAccessibleCards(user.role, activeModules);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">歡迎回來, {user.name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.id} href={card.path} target={card.tier === 3 ? "_blank" : "_self"}>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">{card.icon}</span>
              <h3 className="font-semibold text-gray-800">{card.title}</h3>
              <p className="text-xs text-gray-400 mt-1">Tier {card.tier}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
