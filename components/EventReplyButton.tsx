'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  event: any;
  user: any;
  childrenData?: any[];
  onSuccess?: () => void;
}

export default function EventReplyButton({ event, user, childrenData, onSuccess }: Props) {
  const [showModal, setShowModal] = useState(false);
  
  const isParent = user.role === 'parent';
  const isAdultMember = user.role === 'member' && (user.age >= 18);

  const handleReply = async (targetId: string, type: 'interested' | 'registered') => {
    try {
      const res = await api.setEventReply({
        eventId: event.eventId || event.id,
        targetId: targetId,
        userId: user.userId,
        userName: user.name,
        type: type
      });
      if (res.success) {
        alert('操作成功！');
        setShowModal(false);
        if (onSuccess) onSuccess();
      } else {
        alert('錯誤: ' + res.error);
      }
    } catch (err) {
      alert('系統異常，請稍後再試');
    }
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={() => isParent ? setShowModal(true) : handleReply(user.memberId || user.userId, 'interested')}
        className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
      >
        ❤️ 感興趣
      </button>

      {(isParent || isAdultMember) ? (
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm font-bold"
        >
          💰 立即報名
        </button>
      ) : (
        <div className="text-[10px] text-gray-300 self-center italic">需由家長代為報名</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-gray-800">活動參與確認</h3>
            <div className="space-y-3">
              {isParent ? (
                <>
                  <p className="text-sm text-gray-400 mb-4">請選擇要為哪位子女報名：</p>
                  {childrenData && childrenData.length > 0 ? childrenData.map((child: any) => (
                    <button 
                      key={child.id}
                      onClick={() => handleReply(child.id, 'registered')}
                      className="w-full text-left p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all flex justify-between items-center group"
                    >
                      <span className="font-bold text-gray-700">{child.name}</span>
                      <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">點擊報名</span>
                    </button>
                  )) : <p className="text-sm text-red-400">未找到關聯的子女資料</p>}
                </>
              ) : (
                <button 
                  onClick={() => handleReply(user.memberId || user.userId, 'registered')}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  確認本人報名
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowModal(false)} 
              className="mt-6 w-full text-gray-400 text-sm py-2 hover:text-gray-600"
            >
              返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
