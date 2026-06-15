'use client';

import AuthGate from '@/components/AuthGate';
import { adminRoles, leaderRoles } from '@/lib/troupeStore';

export default function NoticesPage() {
  return <AuthGate roles={[...adminRoles, ...leaderRoles]} title="通告管理需要領袖或後台登入"><NoticesInner /></AuthGate>;
}

function NoticesInner() {
  return <div className="stack">
    <section className="hero">
      <span className="badge gold">通告管理</span>
      <h1>通告上傳與資料抽取</h1>
      <p>通告屬正式資訊，建議以「Word / DOCX 模板 + 人工確認」作為主流程。系統可先抽取重點，但發布前必須由領袖確認。</p>
    </section>

    <section className="grid">
      <div className="card stack">
        <span className="badge green">最建議</span>
        <h3>Word / DOCX</h3>
        <p className="muted">如果通告是由旅團自己製作，DOCX 最適合抽資料，因為文字和段落結構較完整。若使用固定模板，準確率會最高。</p>
        <table className="table"><tbody>
          <tr><th>抽取準確度</th><td>高，尤其固定模板</td></tr>
          <tr><th>適合資料</th><td>日期、時間、地點、費用、集合 / 解散、對象</td></tr>
          <tr><th>建議</th><td>建立旅團標準通告模板</td></tr>
        </tbody></table>
      </div>

      <div className="card stack">
        <span className="badge gold">可支援</span>
        <h3>PDF</h3>
        <p className="muted">如果 PDF 是由 Word 匯出、仍保留文字層，抽取可以接受；如果是掃描 PDF 或版面複雜，準確度會下降。</p>
        <table className="table"><tbody>
          <tr><th>抽取準確度</th><td>中至低，視 PDF 類型</td></tr>
          <tr><th>問題</th><td>掃描、表格、雙欄、多附件會較不穩</td></tr>
          <tr><th>建議</th><td>作為原始附件保存，不作唯一資料來源</td></tr>
        </tbody></table>
      </div>

      <div className="card stack">
        <span className="badge">後備</span>
        <h3>圖片 JPG / PNG</h3>
        <p className="muted">圖片需要 OCR，準確度受清晰度、字體、傾斜、手寫、背景影響。適合後備，不建議作主流程。</p>
        <table className="table"><tbody>
          <tr><th>抽取準確度</th><td>中至低</td></tr>
          <tr><th>優點</th><td>手機拍照方便</td></tr>
          <tr><th>缺點</th><td>必須人工確認</td></tr>
        </tbody></table>
      </div>
    </section>

    <section className="card stack">
      <h2>建議混合流程</h2>
      <ol>
        <li>領袖上傳 DOCX 通告，或貼上圖書館通告連結。</li>
        <li>系統抽取日期、時間、地點、費用、集合 / 解散、對象。</li>
        <li>系統建立活動 / 通告草稿。</li>
        <li>領袖人工確認重點資料。</li>
        <li>發布後家長頁只看摘要；需要時才打開完整通告。</li>
      </ol>
      <div className="notice">結論：你說 Word 會較好，我同意。若要系統抽資料準，DOCX + 標準模板會比 PDF / 圖片穩定很多。</div>
    </section>

    <section className="card stack">
      <h2>標準通告模板欄位</h2>
      <div className="grid">
        <input className="input" placeholder="通告標題，例如：童軍露營通告" />
        <input className="input" placeholder="活動日期，例如：2026-07-15" />
        <input className="input" placeholder="集合時間 / 地點" />
        <input className="input" placeholder="解散時間 / 地點" />
        <input className="input" placeholder="費用" />
        <input className="input" placeholder="對象支部 / 對象成員" />
      </div>
      <textarea className="textarea" placeholder="摘要 / 注意事項"></textarea>
      <div className="row"><button className="btn primary">建立通告草稿</button><button className="btn">上傳 DOCX 預留</button><button className="btn gold">從圖書館連結匯入預留</button></div>
    </section>
  </div>;
}
