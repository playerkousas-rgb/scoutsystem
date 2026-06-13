import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="stack">
      {/* Hero 區 */}
      <section className="hero">
        <span className="badge gold">Step 1 · 身份及控制台 UI</span>
        <h1>ScoutSystem 旅團管理與協作系統</h1>
        <p>
          整合成員管理、活動報名、圖書館通告與專科徽章的數位平台。
          後台暫用 localStorage 模擬，下一步會逐 Part 接入 Google Sheet 與 Apps Script。
        </p>
        <div className="row">
          <Link className="btn primary" href="/login">🚀 登入系統</Link>
          <Link className="btn gold" href="/apply">申請加入</Link>
        </div>
      </section>

      {/* 公開功能卡片區 */}
      <section className="grid">
        <Feature 
          title="公開行事曆" 
          icon="📆" 
          text="只作公開查看用途，標記哪一天有活動，不處理報名及行政流程。" 
          href="/calendar" 
        />
        <Feature 
          title="活動與通告" 
          icon="📋" 
          text="展示全旅未來活動，以及領袖已標記的圖書館通告。" 
          href="/activities" 
        />
      </section>
    </div>
  );
}

function Feature({ title, text, icon, href }: { title: string; text: string; icon: string; href: string }) {
  return (
    <div className="card stack">
      <h3>{icon} {title}</h3>
      <p className="muted">{text}</p>
      <Link className="btn block" href={href}>查看</Link>
    </div>
  );
}
