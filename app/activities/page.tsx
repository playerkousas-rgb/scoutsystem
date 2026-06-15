'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import EventReplyButton from '@/components/EventReplyButton';

export default function ActivitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!storedUser) {
          setLoading(false);
          return;
        }
        setUser(storedUser);

        // 獲取活動資料
        const res = await api.getCalendar(storedUser.userId);
        if (res.success) {
          setEvents(res.data);
        }

        // 如果是家長，獲取子女資訊供報名按鈕使用
        if (storedUser.role === 'parent') {
          const dRes = await api.getDashboardData({ userId: storedUser.userId });
          if (dRes.success) {
            setDashboardData(dRes.data);
          }
        }
      } catch (err) {
        console.error('初始化失敗', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshEvents = () => {
    if (user?.userId) {
      api.getCalendar(user.userId).then(res => {
        if (res.success) setEvents(res.data);
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">載入中...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900">活動公告</h1>
      <div className="space-y-6">
        {events.length > 0 ? (
          events.map((e) => (
            <div key={e.eventId || e.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{e.title}</h2>
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                  {e.date}
                </span>
              </div>
              <p className="text-gray-600 mb-6">{e.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="text-sm text-gray-400">
                  地點: {e.location || '另行通知'} | 費用: ${e.fee || 0}
                </div>
                {/* 報名按鈕組件 */}
                {user && (
                  <EventReplyButton 
                    event={e} 
                    user={user} 
                    childrenData={dashboardData?.children || []} 
                    onSuccess={refreshEvents}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-12 border-2 border-dashed rounded-2xl">目前沒有公開活動</p>
        )}
      </div>
    </div>
  );
}
