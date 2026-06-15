'use client';
import React, { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  event: any;
  user: any; // 登入用戶資訊
  childrenData?: any[]; // 僅家長角色有此資料
  onSuccess?: () => void;
}

export default function EventReplyButton({ event, user, childrenData, onSuccess }: Props) {
  const [showModal, setShowModal] = useState(false);
  const isParent = user.role === 'parent';
  const isAdultMember = user.role === 'member' && user.age >= 18;

  const handleReply = async (targetId: string, type: 'interested' | 'registered') => {
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
    }
  };

  return (
    <div className="flex gap-2">
      {/* 感興趣按鈕 (❤️) - 所有人可用 */}
      <button 
        onClick={() => isParent ? setShowModal(true) : handleReply(user.memberId || user.userId, 'interested')}
        className="flex items-center gap-1 bg-white border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50"
      >
        <span>❤️</span> 感興趣
      </button>

      {/* 報名按鈕 (💰) */}
      {(isParent || isAdultMember) ? (
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          <span>💰</span> 報名
        </button>
      ) : (
        <div className="text-xs text-gray-400 self-center">需由家長報名</div>
      )}

      {/* 報名選擇彈窗 (針對家長) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">請選擇參與者</h3>
            <div className="space-y-3">
              {isParent ? (
                childrenData?.map(child => (
                  <button 
                    key={child.id}
                    onClick={() => handleReply(child.id, 'registered')}
                    className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between"
                  >
                    <span>{child.name}</span>
                    <span className="text-blue-600">確認報名</span>
                  </button>
                ))
              ) : (
                <button 
                  onClick={() => handleReply(user.memberId || user.userId, 'registered')}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  本人報名
                </button>
              )}
            </div>
            <button onClick={() => setShowModal(false)} className="mt-4 w-full text-gray-500">取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
