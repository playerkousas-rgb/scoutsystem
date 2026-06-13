import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'ScoutSystem 旅團管理與協作系統',
  description: '82nd HKG 童軍旅團管理平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body className="bg-gray-50 text-gray-900">
        {/* 全站頂欄（可選） */}
        <nav className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600">ScoutSystem</span>
              <span className="text-sm text-gray-500 hidden md:block">82nd HKG</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/calendar" className="text-gray-600 hover:text-gray-900">行事曆</Link>
              <Link href="/activities" className="text-gray-600 hover:text-gray-900">活動與通告</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">登入</Link>
              <Link 
                href="/apply" 
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                申請加入
              </Link>
            </div>
          </div>
        </nav>

        {/* 主要內容 */}
        <main>{children}</main>

        {/* 全站 Footer */}
        <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
          © 2026 SKWSCOUT ScoutSystem
        </footer>
      </body>
    </html>
  );
}
