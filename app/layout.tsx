import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: '旅團管理與協作系統',
  description: 'Scout Troupe Management and Collaboration System MVP'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="topbar">
          <Link className="brand" href="/">🏕️ ScoutSystem</Link>
          
          <nav className="nav">
            {/* 公共連結 */}
            <Link href="/calendar">行事曆</Link>
            <Link href="/activities">活動與通告</Link>
          </nav>

          {/* 右側：登入 / 登出 + 個人入口 */}
          <div className="nav">
            <Link href="/login">登入</Link>
            {/* 登入後才顯示的個人入口（之後再用條件渲染） */}
            {/* <Link href="/admin">後台</Link> */}
          </div>
        </header>

        <main className="shell">{children}</main>

        <footer className="footer">
          © 2026 SKWSCOUT
        </footer>
      </body>
    </html>
  );
}
