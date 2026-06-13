import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Hero 區 */}
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 mb-4">
          Step 1 · 身份及控制台 UI
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] mb-4">
          ScoutSystem 旅團管理與協作系統
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          這一版先建立各身份入口及控制台，後台暫用 localStorage 模擬。
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/login" className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#162d4a]">
            登入系統
          </Link>
          <Link href="/apply" className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-100">
            申請加入
          </Link>
        </div>
      </div>

      {/* 公開功能卡片區 */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          {/* 公開行事曆 */}
          <Link href="/calendar" className="group">
            <div className="bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-lg transition-all h-full flex flex-col">
              <div className="text-4xl mb-4">📆</div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">公開行事曆</h3>
              <p className="text-gray-600 flex-1 text-sm leading-relaxed">
                只作公開查看用途，標記哪一天有活動，不處理報名及行政流程。
              </p>
              <div className="mt-6">
                <span className="inline-block px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gray-200">
                  查看
                </span>
              </div>
            </div>
          </Link>

          {/* 活動與通告 */}
          <Link href="/activities" className="group">
            <div className="bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-lg transition-all h-full flex flex-col">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">活動與通告</h3>
              <p className="text-gray-600 flex-1 text-sm leading-relaxed">
                展示旅、支部活動及領袖已標記的圖書館通告。
              </p>
              <div className="mt-6">
                <span className="inline-block px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gray-200">
                  查看
                </span>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
