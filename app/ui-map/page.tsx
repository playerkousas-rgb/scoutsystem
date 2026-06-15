import Link from 'next/link';

const screens = [
  { area: '公開入口', items: [
    { name: '首頁', path: '/', note: '身份規則及主要入口。未登入也可看。' },
    { name: '登入 / 身份切換', path: '/login', note: 'Demo 切換超級管理員、管理員、領袖、家長、成員。瀏覽器記錄上次帳戶。' },
    { name: '申請加入系統', path: '/leader/apply', note: '簡化申請：只是申請使用系統，不代表總會正式資格。' },
    { name: '家長註冊', path: '/register', note: '家長申請帳戶及子女綁定。' },
    { name: '公開行事曆', path: '/calendar', note: '只作查看用途，標記哪一天有活動。不處理報名、付款或提醒。' },
    { name: '本旅通告圖書館', path: '/library', note: '公開查看領袖已按本旅需要標記的通告；保留外部全港圖書館連結。' },
  ]},
  { area: '後台', items: [
    { name: '後台控制台', path: '/admin', note: '超級管理員 / 管理員，全支部資料、管理員帳戶、批核中心。需要登入。' },
    { name: '欄位設定', path: '/settings', note: '設定必須欄位與可選欄位，處理私隱及 YMIS Sheet 格式。需要後台登入。' },
  ]},
  { area: '領袖', items: [
    { name: '領袖頁面', path: '/leader', note: '團長、支部領袖、教練員統一入口，按支部限制權限。需要登入。' },
  ]},
  { area: '家長 / 成員', items: [
    { name: '家長頁面', path: '/parent', note: '編輯子女資料、看相關支部 / 旅活動、回覆報名。需要登入。' },
    { name: '成員頁面', path: '/member', note: '查看自己支部資料及相關活動。需要登入。' },
  ]},
  { area: '活動、通告及接口', items: [
    { name: '活動頁面', path: '/activities', note: '旅 / 支部 / 總部 / 地域區 / 訓練班。需要登入。' },
    { name: '圖書館加入流程', path: '/library/import', note: '由全港圖書館「加入 ScoutSystem」進入，領袖登入後標記。' },
    { name: '通告管理', path: '/notices', note: '上傳檔案或系統抽取日期、時間、地點、費用。需要領袖登入。' },
    { name: '專科徽章報考', path: '/badges', note: '接入 DBS 系統入口。需要登入。' },
    { name: 'MVP 說明', path: '/guide', note: '後續 Google Sheet / Apps Script 接入方向。' },
  ]},
];

export default function UIMapPage() {
  return <div className="stack">
    <section className="hero"><span className="badge gold">UI Map</span><h1>身份、私隱、圖書館及行事曆 UI 地圖</h1><p>圖書館及行事曆是公開查看；加入本旅收藏、標記、活動管理、回覆及付款則需要登入。</p></section>
    <section className="card stack">{screens.map(section => <div key={section.area}><h2>{section.area}</h2><table className="table"><thead><tr><th>畫面</th><th>用途</th><th></th></tr></thead><tbody>{section.items.map(item => <tr key={item.path}><td><strong>{item.name}</strong><br /><span className="muted">{item.path}</span></td><td>{item.note}</td><td><Link className="btn" href={item.path}>查看</Link></td></tr>)}</tbody></table></div>)}</section>
    <section className="card"><h2>下一步接入順序建議</h2><ol><li>Google Sheet Part 1：讀取 SystemConfig / Roles / Branches / FieldSettings。</li><li>公開資料 API：讀取已發布活動及已標記通告。</li><li>登入及 session。</li><li>領袖標記圖書館、活動、回覆、付款。</li></ol></section>
  </div>;
}
