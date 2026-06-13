import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 - 優化版 */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-blue-600">ScoutSystem</div>
            <div className="text-sm text-gray-500 hidden md:block">82nd HKG</div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              登入
            </Link>
            <Link 
              href="/apply" 
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              申請加入
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 區 */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          ScoutSystem<br />旅團管理與協作系統
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          整合成員管理、活動報名、圖書館通告與專科徽章的數位平台
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition text-lg"
          >
            登入系統
          </Link>
          <Link 
            href="/apply" 
            className="px-8 py-3.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-100 transition text-lg"
          >
            申請加入
          </Link>
        </div>
      </div>

      {/* 公開功能區 - 保留卡片風格 */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900">公開功能</h2>
          <p className="text-gray-600 mt-2">無需登入即可查看</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* 公開行事曆卡片 */}
          <Link href="/calendar" className="group">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all h-full flex flex-col">
              <div className="text-5xl mb-6">📆</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600 transition">公開行事曆</h3>
              <p className="text-gray-600 flex-1">
                查看全旅近期活動日期與時間，不需登入即可瀏覽。
              </p>
              <div className="mt-6 text-blue-600 font-medium flex items-center gap-1">
                查看行事曆 →
              </div>
            </div>
          </Link>

          {/* 活動與通告卡片 */}
          <Link href="/activities" className="group">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all h-full flex flex-col">
              <div className="text-5xl mb-6">📋</div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600 transition">活動與通告</h3>
              <p className="text-gray-600 flex-1">
                查看最新活動資訊，以及領袖已標記的圖書館通告。
              </p>
              <div className="mt-6 text-blue-600 font-medium flex items-center gap-1">
                查看活動與通告 →
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 頁尾 */}
      <footer className="border-t py-8 text-center text-sm text-gray-500 bg-white">
        © 2026 82nd Hong Kong Group ScoutSystem
      </footer>
    </div>
  );
}
