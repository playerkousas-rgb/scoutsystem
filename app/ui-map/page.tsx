import Link from 'next/link';

const screens = [
  { area: '身份入口', items: [
    { name: '首頁', path: '/', note: '身份規則及主要入口。' },
    { name: '登入 / 身份切換', path: '/login', note: 'Demo 切換超級管理員、管理員、領袖、家長、成員。' },
  ]},
  { area: '後台', items: [
    { name: '後台控制台', path: '/admin', note: '超級管理員 / 管理員，全支部資料、管理員帳戶、批核中心。' },
  ]},
  { area: '領袖', items: [
    { name: '領袖頁面', path: '/leader', note: '團長、支部領袖、教練員統一入口，按支部限制權限。' },
    { name: '領袖帳戶申請', path: '/leader/apply', note: '自由申請；團長由管理員批核，支部領袖 / 教練員由團長批核。' },
  ]},
  { area: '家長 / 成員', items: [
    { name: '家長頁面', path: '/parent', note: '編輯子女資料、看相關支部 / 旅活動、回覆報名。' },
    { name: '成員頁面', path: '/member', note: '查看自己支部資料及相關活動。' },
  ]},
  { area: '活動及接口', items: [
    { name: '活動頁面', path: '/activities', note: '旅 / 支部 / 總部 / 地域區 / 訓練班；童軍圖書館接口預留。' },
    { name: '專科徽章報考', path: '/badges', note: '接入 DBS 系統入口。' },
    { name: 'MVP 說明', path: '/guide', note: '後續 Google Sheet / Apps Script 接入方向。' },
  ]},
];

export default function UIMapPage() {
  return <div className="stack">
    <section className="hero"><span className="badge gold">UI Map</span><h1>身份及控制台 UI 地圖</h1><p>本頁用來逐頁確認畫面。今次重點是先固定各身份入口及權限邏輯，再接 Google Sheet / Apps Script。</p></section>
    <section className="card stack">{screens.map(section => <div key={section.area}><h2>{section.area}</h2><table className="table"><thead><tr><th>畫面</th><th>用途</th><th></th></tr></thead><tbody>{section.items.map(item => <tr key={item.path}><td><strong>{item.name}</strong><br /><span className="muted">{item.path}</span></td><td>{item.note}</td><td><Link className="btn" href={item.path}>查看</Link></td></tr>)}</tbody></table></div>)}</section>
    <section className="card"><h2>下一步接入順序建議</h2><ol><li>Google Sheet 建立 Users / Branches / LeaderApplications。</li><li>接後台：超級管理員初始化、管理員建立。</li><li>接領袖申請及批核流程。</li><li>接家長 / 成員資料。</li><li>接活動、DBS 及童軍圖書館接口。</li></ol></section>
  </div>;
}
