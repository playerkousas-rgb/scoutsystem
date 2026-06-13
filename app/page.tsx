import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">Step 1 · 身份及控制台 UI</span>
        <h1>ScoutSystem 旅團管理與協作系統</h1>
        <p>
          這一版先建立各身份入口及控制台：超級管理員、管理員、團長、支部領袖、教練員、家長、成員。
          後台暫用 localStorage 模擬，下一步會逐 Part 接入 Google Sheet 與 Apps Script。
        </p>
        <div className="row">
          <Link className="btn primary" href="/login">🚀 進入身份 Demo</Link>
          <Link className="btn gold" href="/admin">🔐 後台</Link>
          <Link className="btn" href="/leader">🧭 領袖頁面</Link>
        </div>
      </section>

      <section className="grid">
        <Feature title="後台" icon="🔐" text="超級管理員由 Google Sheet 初始化；可建立管理員。管理員可查看及管理所有支部。" href="/admin" />
        <Feature title="領袖頁面" icon="🧭" text="團長、支部領袖、教練員統一入口；依支部限制管理權限。" href="/leader" />
        <Feature title="家長頁面" icon="👪" text="家長可編輯子女資料，查看相關支部及全旅活動，回覆活動報名。" href="/parent" />
        <Feature title="成員頁面" icon="🧒" text="成員查看自己支部資料、領袖資料及相關活動。" href="/member" />
        <Feature title="活動頁面" icon="🗓️" text="展示旅、支部、總部、地域區及訓練班未來活動；童軍圖書館接口預留。" href="/activities" />
        <Feature title="公開行事曆" icon="📆" text="只作公開查看用途，標記哪一天有活動，不處理報名及行政流程。" href="/calendar" />
        <Feature title="圖書館頁面" icon="📚" text="顯示領袖按本旅需要標記的通告，並保留外部全港圖書館連結。" href="/library" />
        <Feature title="通告管理" icon="📄" text="支援上傳通告檔案，並預留自動抽取日期、時間、地點及費用。" href="/notices" />
        <Feature title="專科徽章報考" icon="🎖️" text="接入現有 DBS 系統，日後可帶入成員及支部資料。" href="/badges" />
      </section>

      <section className="card">
        <h2>本輪先確認的身份規則</h2>
        <ol>
          <li>超級管理員不能申請，只能在 Google Sheet 起始設定帳戶及密碼。</li>
          <li>超級管理員登入後台後，可建立管理員帳戶及密碼。</li>
          <li>管理員可登入後台，查看及管理所有支部資料。</li>
          <li>團長、支部領袖、教練員統稱領袖頁面；申請團長由管理員 / 超級管理員批核。</li>
          <li>支部領袖及教練員可自由申請，由相關支部團長批核。</li>
          <li>家長可編輯子女資料及查看相關支部 / 旅資料。</li>
          <li>成員只查看自己支部資料。</li>
        </ol>
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
