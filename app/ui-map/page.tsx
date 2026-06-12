import Link from 'next/link';

const screens = [
  {
    area: '共用入口',
    items: [
      { name: '首頁', path: '/', status: '已完成 UI', note: '系統定位、核心入口、驗收流程。' },
      { name: '登入 / 切換身份', path: '/login', status: '已完成 UI', note: 'Demo 身份切換，日後替換為正式登入。' },
      { name: 'UI 地圖', path: '/ui-map', status: '目前頁面', note: '方便我們邊看邊改，確認所有畫面範圍。' },
    ],
  },
  {
    area: '管理端',
    items: [
      { name: '管理後台總覽', path: '/admin', status: '已完成 UI', note: '旅長 / 團長 / 領袖權限視角、KPI、待辦。' },
      { name: '活動管理', path: '/admin', status: '已完成 UI', note: '3 步驟新增活動、選擇成員、發布、統計報名。' },
      { name: '成員資料庫', path: '/admin', status: '已完成 UI', note: '支部權限隔離、成員列表、新增成員。' },
      { name: '家長審核', path: '/admin', status: '已完成 UI', note: '審批自行註冊家長帳號。' },
    ],
  },
  {
    area: '家長端',
    items: [
      { name: '家長註冊', path: '/register', status: '已完成 UI', note: '家長提交註冊與成員編號綁定申請。' },
      { name: '家長入口', path: '/parent', status: '已完成 UI', note: '跨支部子女、未來活動、出席 / 不出席回覆。' },
    ],
  },
  {
    area: '文件與交付',
    items: [
      { name: 'MVP 說明', path: '/guide', status: '已完成 UI', note: '權限、通知、時效、後端建議。' },
    ],
  },
];

const nextParts = [
  '先固定所有 UI 畫面與用字，包括按鈕、表格欄位、活動狀態、家長回覆文字。',
  '確認 Google Sheet 欄位設計：Branches、Users、Members、Events、EventReplies、Notifications。',
  '把目前 localStorage 的 troupeStore.ts 拆成 API 介面，先不改 UI。',
  '逐個 Part 接駁 Apps Script：登入 / 成員 / 活動 / 回覆 / 通知佇列。',
  '加入正式權限驗證、審計紀錄及錯誤處理。',
];

export default function UIMapPage() {
  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">Step 1 · UI Construction</span>
        <h1>UI 建構檢視板</h1>
        <p>
          這一頁用來確認目前所有前端畫面。建議我們先把畫面、流程、欄位及文案定好，再逐 Part 加入 Google Sheet 和 Apps Script，避免後端先做完後又大幅改 UI。
        </p>
        <div className="row">
          <Link className="btn primary" href="/login">開始試用 Demo</Link>
          <Link className="btn" href="/admin">管理端</Link>
          <Link className="btn" href="/parent">家長端</Link>
        </div>
      </section>

      <section className="card">
        <h2>目前 UI 範圍</h2>
        <div className="stack">
          {screens.map(section => (
            <div key={section.area}>
              <h3>{section.area}</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>畫面</th>
                    <th style={{ width: '16%' }}>狀態</th>
                    <th>用途</th>
                    <th style={{ width: '120px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map(item => (
                    <tr key={`${section.area}-${item.name}`}>
                      <td><strong>{item.name}</strong><br /><span className="muted">{item.path}</span></td>
                      <td><span className={item.status === '目前頁面' ? 'badge blue' : 'badge green'}>{item.status}</span></td>
                      <td>{item.note}</td>
                      <td><Link className="btn" href={item.path}>查看</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h3>🛡️ 管理端 UI 驗收點</h3>
          <ul className="muted">
            <li>旅長看到全旅資料。</li>
            <li>團長 / 領袖只看到所屬支部資料。</li>
            <li>活動新增不超過 3 步。</li>
            <li>報名統計可即時看見出席、不出席、未回覆。</li>
          </ul>
        </div>
        <div className="card">
          <h3>👪 家長端 UI 驗收點</h3>
          <ul className="muted">
            <li>單一帳號看到跨支部子女。</li>
            <li>登入後優先看到待回覆活動。</li>
            <li>活動卡片資訊清楚，不顯示多餘行政欄位。</li>
            <li>回覆動作簡單明確。</li>
          </ul>
        </div>
        <div className="card">
          <h3>📣 通知 UI 驗收點</h3>
          <ul className="muted">
            <li>活動發布後產生通知佇列。</li>
            <li>暫不接外部服務，但 UI 保留通知狀態。</li>
            <li>日後可加入 Email / WhatsApp 發送狀態。</li>
          </ul>
        </div>
      </section>

      <section className="card">
        <h2>下一步：逐 Part 加入 Google Sheet / Apps Script</h2>
        <ol>
          {nextParts.map(part => <li key={part}>{part}</li>)}
        </ol>
        <div className="notice">
          建議做法：UI 固定後，不直接在畫面中寫 Apps Script 邏輯，而是先建立一層 API adapter。這樣日後由 Google Sheet 轉 Supabase 或 SQL，也不用重寫整個 UI。
        </div>
      </section>
    </div>
  );
}
