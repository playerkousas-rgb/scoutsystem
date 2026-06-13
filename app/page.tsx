import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 區 */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ScoutSystem 旅團管理與協作系統
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            整合成員管理、活動報名、圖書館通告與專科徽章的數位平台
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              登入系統
            </Link>
            <Link 
              href="/apply" 
              className="px-8 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              申請加入
            </Link>
          </div>
        </div>
      </div>

      {/* 公開功能卡片區 */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900">公開功能</h2>
          <p className="text-gray-600 mt-2">無需登入即可使用</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 公開行事曆 */}
          <Link href="/calendar" className="group">
            <div className="bg-white rounded-2xl p-8 border hover:shadow-xl transition-all h-full">
              <div className="text-5xl mb-5">📆</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600">公開行事曆</h3>
              <p className="text-gray-600 mb-6">查看全旅近期活動日期與時間。</p>
              <div className="inline-block px-5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium group-hover:bg-blue-100">
                查看行事曆
              </div>
            </div>
          </Link>

          {/* 活動與通告 */}
          <Link href="/activities" className="group">
            <div className="bg-white rounded-2xl p-8 border hover:shadow-xl transition-all h-full">
              <div className="text-5xl mb-5">📋</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600">活動與通告</h3>
              <p className="text-gray-600 mb-6">查看最新活動及領袖已標記的圖書館通告。</p>
              <div className="inline-block px-5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium group-hover:bg-blue-100">
                查看活動與通告
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
