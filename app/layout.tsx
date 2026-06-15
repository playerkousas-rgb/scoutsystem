import './globals.css';
import NavBar from '@/components/NavBar';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
