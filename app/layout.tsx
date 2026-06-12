import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: '旅團管理與協作系統',
  description: 'Troupe Management and Collaboration System MVP'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="topbar">
          <Link className="brand" href="/">🏕️ 旅團管理與協作系統</Link>
          <nav className="nav">
            <Link href="/login">登入 / 切換身份</Link>
            <Link href="/register">家長註冊</Link>
            <Link href="/parent">家長入口</Link>
            <Link href="/admin">管理後台</Link>
            <Link href="/ui-map">UI 地圖</Link>
            <Link href="/guide">MVP 說明</Link>
          </nav>
        </header>
        <main className="shell">{children}</main>
        <footer className="footer">MVP Prototype · 無外部 YMIS 接入 · 通知接口預留</footer>
      </body>
    </html>
  );
}
