export default function BadgesPage() {
  return <div className="stack">
    <section className="hero">
      <span className="badge blue">專科徽章報考</span>
      <h1>接入 DBS 系統</h1>
      <p>此頁先作 UI 入口及接口預留。下一階段會討論如何由 ScoutSystem 帶入成員資料、家長資料及支部資料，再跳轉或同步到你原本的 DBS 專科徽章報考系統。</p>
      <div className="row"><a className="btn primary" href="https://dbs-teal-iota.vercel.app/" target="_blank">開啟現有 DBS 系統</a><a className="btn" href="/member">返回成員頁面</a></div>
    </section>
    <section className="grid">
      <div className="card"><h3>成員報考</h3><p className="muted">日後可從成員頁直接帶入姓名、支部、成員編號，減少重複輸入。</p></div>
      <div className="card"><h3>家長確認</h3><p className="muted">可沿用 DBS 家長確認流程，或改為 ScoutSystem 站內確認。</p></div>
      <div className="card"><h3>領袖 / 團長確認</h3><p className="muted">由 ScoutSystem 的支部權限判斷誰可確認申請。</p></div>
      <div className="card"><h3>狀態回寫</h3><p className="muted">完成後可把報考狀態回寫成員紀錄，形成活動及專章履歷。</p></div>
    </section>
  </div>;
}
