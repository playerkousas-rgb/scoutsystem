import Link from 'next/link';

const screens = [
  { area: '公開入口', items: [
    { name: '首頁', path: '/', note: '身份規則及主要入口。未登入也可看。' },
    { name: '登入 / 身份切換', path: '/login', note: 'Demo 切換超級管理員、管理員、領袖、家長、成員。瀏覽器記錄上次帳戶。' },
    { name: '申請加入系統', path: '/leader/apply', note: '簡化申請：只是申請使用系統，不代表總會正式資格。' },
    { name: '家長註冊', path: '/register', note: '家長申請帳戶及子女綁定。' },
  ]},
  { area: '後台', items: [
    { name: '後台控制台', path: '/admin', note: '超級管理員 / 管理員，全支部資料、管理員帳戶、批核中心。需要登入。' },
    { name: '欄位設定', path: '/settings', note: '設定必須欄位與可選欄位，處理私隱及 YMIS 接入欄位。需要後台登入。' },
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
    { name: '圖書館頁面', path: '/library', note: '童軍圖書館 / 活動資料庫接入設計。需要登入。' },
    { name: '通告管理', path: '/notices', note: '上傳檔案或系統抽取日期、時間、地點、費用。需要領袖登入。' },
    { name: '專科徽章報考', path: '/badges', note: '接入 DBS 系統入口。需要登入。' },
    { name: 'MVP 說明', path: '/guide', note: '後續 Google Sheet / Apps Script 接入方向。' },
  ]},
];

export default function UIMapPage() {
  return <div className="stack">
    <section className="hero"><span className="badge gold">UI Map</span><h1>身份、私隱、圖書館及通告 UI 地圖</h1><p>本頁用來逐頁確認畫面。功能頁原則上需要登入；未登入時會顯示「登入 / 申請帳戶」提示。</p></section>
    <section className="card stack">{screens.map(section => <div key={section.area}><h2>{section.area}</h2><table className="table"><thead><tr><th>畫面</th><th>用途</th><th></th></tr></thead><tbody>{section.items.map(item => <tr key={item.path}><td><strong>{item.name}</strong><br /><span className="muted">{item.path}</span></td><td>{item.note}</td><td><Link className="btn" href={item.path}>查看</Link></td></tr>)}</tbody></table></div>)}</section>
    <section className="card"><h2>下一步接入順序建議</h2><ol><li>Google Sheet 建立 Users / Branches / Applications / FieldSettings。</li><li>接登入檢查與瀏覽器 session。</li><li>接欄位設定及成員資料欄位 mapping。</li><li>接領袖 / 家長 / 成員申請及批核。</li><li>接通告檔案、活動、DBS 及童軍圖書館接口。</li></ol></section>
  </div>;
}
