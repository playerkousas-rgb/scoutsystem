'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import CardItem from '@/components/CardItem';

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [troopInfo, setTroopInfo] = useState<any>(null);

  useEffect(() => {
    api.getTroopInfo().then(res => setTroopInfo(res));
    api.getTroopActiveCards().then(res => res.success && setCards(res.data));
  }, []);

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-12 bg-gradient-to-r from-blue-50 to-white p-10 rounded-[3rem] border border-blue-100 shadow-sm">
        <h1 className="text-4xl font-black text-[#001f3f] mb-2">{troopInfo?.troopName || '載入中...'}</h1>
        <p className="text-blue-600 font-medium tracking-wide">目前地區：{troopInfo?.troopId} | 已連通</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {cards.length > 0 ? cards.map((c: any) => (
          <CardItem key={c.id} card={c} troopId={troopInfo?.troopId} />
        )) : (
          <CardItem card={{id:'market', title:'前往市集安裝功能', icon:'➕', path:'/market', tier:1}} troopId={troopInfo?.troopId} />
        )}
      </div>
    </div>
  );
}
