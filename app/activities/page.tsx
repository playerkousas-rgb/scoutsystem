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

        // 1. 獲取個人化活動清單
        const res = await api.getCalendar(storedUser.userId);
        if (res.success) {
          setEvents(res.data);
        }

        // 2. 如果是家長，獲取子女資料供報名使用
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

  if (loading) return <div className="p-12 text-center text-gray-400">正在加載活動...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-black mb-10 text-blue-900 tracking-tight">活動公告</h1>
      
      <div className="grid gap-8">
        {events.length > 0 ? (
          events.map((e) => (
            <div key={e.eventId || e.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{e.title}</h2>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>📅 {e.date}</span>
                    <span>📍 {e.location || '另行通知'}</span>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-bold">
                  ${e.fee || 0}
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                {e.description || '暫無活動詳情說明。'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="text-xs text-gray-300">
                  ID: {e.eventId || e.id}
                </div>
                
                {/* 報名連通組件 */}
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
          <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-300 text-lg">目前沒有任何公開活動</p>
          </div>
        )}
      </div>
    </div>
  );
}
