'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function EventRegistrationManager({ eventId, branchId }: { eventId: string, branchId?: string }) {
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    const res = await api.getEventReport(eventId, branchId);
    if (res.success) setReport(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [eventId]);

  const togglePaid = async (targetId: string, currentPaid: boolean) => {
    await api.setEventReply({ eventId, targetId, userId: 'admin', type: 'registered', paid: !currentPaid });
    fetchReport();
  };

  const exportCSV = () => {
    const headers = "姓名, YMIS, 支部, 狀態, 已付費\n";
    const rows = report.map(r => `${r.name}, ${r.ymNumber}, ${r.patrol}, ${r.status}, ${r.paid ? '是' : '否'}`).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `活動報名表_${eventId}.csv`);
    link.click();
  };

  if (loading) return <div>載入中...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">報名名單管理</h3>
        <button onClick={exportCSV} className="bg-green-600 text-white px-3 py-1 rounded text-sm">匯出 CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">姓名 (YMIS)</th>
              <th className="py-2">狀態</th>
              <th className="py-2">付款</th>
            </tr>
          </thead>
          <tbody>
            {report.map(r => (
              <tr key={r.memberId} className="border-b">
                <td className="py-2">{r.name} ({r.ymNumber})</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${r.status === 'registered' ? 'bg-blue-100 text-blue-800' : r.status === 'interested' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                    {r.status === 'registered' ? '已報名' : r.status === 'interested' ? '感興趣' : '未填寫'}
                  </span>
                </td>
                <td className="py-2">
                  {r.status === 'registered' && (
                    <button 
                      onClick={() => togglePaid(r.memberId, r.paid)}
                      className={`px-2 py-1 rounded text-xs ${r.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {r.paid ? '已付' : '未付'}
                    </button>
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
