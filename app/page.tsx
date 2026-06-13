import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <nav className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">ScoutSystem</div>
          <div className="flex gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              登入
            </Link>
            <Link 
              href="/apply" 
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              申請加入
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 區 */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          ScoutSystem<br />旅團管理與協作系統
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          整合成員管理、活動報名、圖書館通告與專科徽章的數位平台
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            登入系統
          </Link>
          <Link 
            href="/apply" 
            className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
          >
            申請加入
          </Link>
        </div>
      </div>

      {/* 公開功能區 */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
          公開功能
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* 公開行事曆 */}
          <Link href="/calendar" className="group">
            <div className="bg-white rounded-2xl p-8 border hover:border-blue-300 transition-all h-full">
              <div className="text-4xl mb-4">📆</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">公開行事曆</h3>
              <p className="text-gray-600">查看全旅近期活動日期，不需登入即可瀏覽。</p>
            </div>
          </Link>

          {/* 活動與通告 */}
          <Link href="/activities" className="group">
            <div className="bg-white rounded-2xl p-8 border hover:border-blue-300 transition-all h-full">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">活動與通告</h3>
              <p className="text-gray-600">查看最新活動及領袖已標記的圖書館通告。</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 頁尾 */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © 2026 82nd HKG ScoutSystem
      </footer>
    </div>
  );
}
