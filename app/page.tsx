import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">MVP v0.1 · 參考 DBS 系統技術棧 Next.js</span>
        <h1>旅團行政、家長回覆、活動統計，一個入口完成。</h1>
        <p>
          本版本把「旅長 / 團長 / 領袖」三級權限、跨支部家長綁定、未來活動篩選、活動報名回覆與通知佇列設計成可操作原型。
          初版使用瀏覽器 localStorage 模擬資料庫，方便先驗證流程；之後可替換成 Google Apps Script / Supabase / SQL 後端。
        </p>
        <div className="row">
          <Link className="btn primary" href="/login">🚀 進入 Demo</Link>
          <Link className="btn gold" href="/admin">⚙️ 管理後台</Link>
          <Link className="btn" href="/parent">👪 家長入口</Link>
        </div>
      </section>

      <section className="grid">
        <Feature title="階層化管理後台" icon="🛡️" text="旅長可看全旅；團長與領袖只可操作所屬支部，畫面與資料邏輯隔離。" />
        <Feature title="家長單一入口" icon="👪" text="同一家長帳號可綁定跨支部成員，登入後集中查看子女活動狀態。" />
        <Feature title="活動報名自動化" icon="📣" text="建立活動時選擇目標成員，系統自動產生回覆紀錄與通知佇列。" />
        <Feature title="未來活動預設篩選" icon="🗓️" text="列表預設只顯示未來及未歸檔活動，過期活動自動淡出行政畫面。" />
      </section>

      <section className="card">
        <h2>建議驗收流程</h2>
        <ol>
          <li>到「登入 / 切換身份」選擇旅長、團長、領袖或家長 Demo 帳號。</li>
          <li>在管理後台新增一個活動，確認三步內完成：基本資料 → 選擇成員 → 發布。</li>
          <li>切換到家長帳號，查看跨支部子女活動，並提交出席 / 不出席回覆。</li>
          <li>回到管理後台查看報名統計即時更新。</li>
        </ol>
      </section>
    </div>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div className="card">
      <h3>{icon} {title}</h3>
      <p className="muted">{text}</p>
    </div>
  );
}
