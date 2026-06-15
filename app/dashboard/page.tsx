'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import CardItem from '@/components/CardItem';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [troopInfo, setTroopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const troopId = localStorage.getItem('current_troop_id');
      if (!storedUser || !troopId) {
        window.location.href = '/';
        return;
      }
      setUser(storedUser);
      const [tRes, cRes] = await Promise.all([
        api.getTroopInfo(),
        api.getTroopCards()
      ]);
      if (tRes.success) setTroopInfo(tRes);
      if (cRes.success) setCards(cRes.data);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">正在進入控制台...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#001f3f]">{troopInfo?.troopName}</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">旅團代碼: {troopInfo?.troopId}</p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {cards.map((card: any) => (
          <CardItem key={card.id} card={card} troopId={troopInfo?.troopId} />
        ))}
        <CardItem card={{ id: 'market', title: '外掛市集', icon: '🏪', tier: 1, path: '/market', description: '探索與安裝新功能' }} troopId={troopInfo?.troopId} />
      </div>
    </div>
  );
}
