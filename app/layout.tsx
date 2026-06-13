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
          <Link className="brand" href="/">🏕️ ScoutSystem 旅團管理系統</Link>
          <nav className="nav">
            <Link href="/login">登入 / 身份</Link>
            <Link href="/admin">後台</Link>
            <Link href="/leader">領袖頁面</Link>
            <Link href="/parent">家長頁面</Link>
            <Link href="/member">成員頁面</Link>
            <Link href="/activities">活動</Link>
            <Link href="/badges">專科徽章</Link>
            <Link href="/ui-map">UI 地圖</Link>
          </nav>
        </header>
        <main className="shell">{children}</main>
        <footer className="footer">UI Prototype · Google Sheet / Apps Script 將逐 Part 接入 · DBS / 童軍圖書館接口預留</footer>
      </body>
    </html>
  );
}
