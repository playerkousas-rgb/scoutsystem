export default function GuidePage() {
  return (
    <div className="stack">
      <section className="hero">
        <span className="badge blue">MVP Scope</span>
        <h1>旅團管理與協作系統 · 第一版說明</h1>
        <p>此 MVP 先驗證核心行政流程與權限模型：管理端建立活動、系統產生家長回覆任務、家長以單一帳號查看跨支部子女、後台即時統計結果。</p>
      </section>

      <section className="grid">
        <div className="card">
          <h3>🛡️ 權限模型</h3>
          <ul className="muted">
            <li>旅長：全旅檢視與管理。</li>
            <li>團長：僅限所屬支部。</li>
            <li>領袖：僅限所屬支部。</li>
            <li>家長：只可查看已綁定子女與相關活動。</li>
          </ul>
        </div>
        <div className="card">
          <h3>📣 通知策略</h3>
          <p className="muted">目前建立活動時會自動建立站內通知 / future channel 佇列；正式版可接 Email、WhatsApp、短訊或其他服務。</p>
        </div>
        <div className="card">
          <h3>🗓️ 活動時效</h3>
          <p className="muted">後台與家長入口預設只列出未來且未歸檔活動，過期活動不干擾日常操作。</p>
        </div>
        <div className="card">
          <h3>👪 家長註冊</h3>
          <p className="muted">家長可提交註冊申請；管理端審核後才可登入。註冊時可輸入多個成員編號以申請綁定。</p>
        </div>
      </section>

      <section className="card">
        <h2>目前技術狀態</h2>
        <table className="table">
          <tbody>
            <tr><th>前端</th><td>Next.js App Router + React + TypeScript，沿用 DBS 專案方向。</td></tr>
            <tr><th>資料</th><td>localStorage Demo 資料庫，方便在無後端情況下驗證流程。</td></tr>
            <tr><th>後端建議</th><td>可延續 DBS 的 Google Apps Script + Google Sheet，或升級為 Supabase / PostgreSQL。</td></tr>
            <tr><th>外部 YMIS</th><td>不接入；所有資料由後台手動建立或日後匯入初始化。</td></tr>
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>下一階段建議</h2>
        <ol>
          <li>確認正式資料表：branches、users、members、parent_links、events、event_replies、notifications、audit_logs。</li>
          <li>加入真正登入與 session 保護。</li>
          <li>把 localStorage store 換成 API 層，並建立伺服器端權限檢查。</li>
          <li>整合通知發送器，先支援 Email，再視需要加入 WhatsApp / SMS。</li>
        </ol>
      </section>
    </div>
  );
}
