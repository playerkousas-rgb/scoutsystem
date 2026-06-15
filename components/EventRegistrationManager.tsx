'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ReportItem {
  memberId: string;
  name: string;
  ymNumber: string;
  patrol: string;
  rank: string;
  status: string;
  paid: boolean;
  updatedAt: string;
}

export default function EventRegistrationManager({ eventId, branchId }: { eventId: string, branchId?: string }) {
  const [report, setReport] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getEventReport(eventId, branchId);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error("抓取報表失敗", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchReport();
  }, [eventId, branchId]);

  const togglePaid = async (targetId: string, currentPaid: boolean) => {
    const res = await api.setEventReply({
      eventId,
      targetId,
      userId: 'admin_sync',
      type: 'registered',
      paid: !currentPaid
    });
    if (res.success) fetchReport();
  };

  const exportCSV = () => {
    const headers = "姓名,YMIS,小隊,職級,狀態,已付費\n";
    const rows = report.map(r => 
      `${r.name},${r.ymNumber},${r.patrol},${r.rank},${r.status === 'registered' ? '已報名' : r.status === 'interested' ? '感興趣' : '未回覆'},${r.paid ? '是' : '否'}`
    ).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `活動報名表_${eventId}.csv`);
    link.click();
  };

  if (loading) return <div className="p-4 text-gray-400">正在生成名單...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">參與名單管理</h3>
        <button 
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
        >
          匯出 CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-50">
              <th className="pb-3 font-medium">成員資訊</th>
              <th className="pb-3 font-medium text-center">狀態</th>
              <th className="pb-3 font-medium text-right">付款操作</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r) => (
              <tr key={r.memberId} className="border-b border-gray-50 last:border-0">
                <td className="py-4">
                  <div className="font-bold text-gray-700">{r.name}</div>
                  <div className="text-xs text-gray-400">YMIS: {r.ymNumber} | {r.patrol} {r.rank}</div>
                </td>
                <td className="py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    r.status === 'registered' ? 'bg-blue-50 text-blue-600' : 
                    r.status === 'interested' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {r.status === 'registered' ? '已報名' : r.status === 'interested' ? '感興趣' : '待回覆'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {r.status === 'registered' ? (
                    <button 
                      onClick={() => togglePaid(r.memberId, r.paid)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        r.paid ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      {r.paid ? '✓ 已付' : '標記付款'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
