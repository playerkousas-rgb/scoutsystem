'use client';

import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { adminRoles, getData, saveData, type AppData, type FieldSetting } from '@/lib/troupeStore';

export default function SettingsPage() {
  return <AuthGate roles={adminRoles} title="欄位設定需要後台登入"><SettingsInner /></AuthGate>;
}

function SettingsInner() {
  const [data, setData] = useState<AppData | null>(null);
  useEffect(() => setData(getData()), []);
  if (!data) return null;

  const update = (key: FieldSetting['key'], patch: Partial<FieldSetting>) => {
    const next = { ...data, memberFieldSettings: data.memberFieldSettings.map(f => f.key === key ? { ...f, ...patch, required: f.required || patch.required || false, enabled: f.required ? true : (patch.enabled ?? f.enabled) } : f) };
    saveData(next); setData(next);
  };

  return <div className="stack">
    <section className="hero">
      <span className="badge gold">欄位設定</span>
      <h1>最少資料 + YMIS Sheet 同格式</h1>
      <p>不是直接接入 YMIS 系統，而是提供與 YMIS 接入 Sheet 相同 / 相容的欄位格式，方便領袖如有需要可一次過整理兩邊資料。</p>
    </section>

    <section className="card stack">
      <h2>成員資料欄位</h2>
      <div className="notice">目前先做必須欄位：<strong>YMIS / 成員編號、姓名</strong>。其他欄位之後按旅團需要逐步啟用。</div>
      <table className="table">
        <thead><tr><th>欄位</th><th>類型</th><th>啟用</th><th>必須</th><th>備註</th></tr></thead>
        <tbody>{data.memberFieldSettings.map(field => <tr key={field.key}>
          <td><strong>{field.label}</strong><br /><span className="muted">{field.key}</span></td>
          <td><span className={field.source === 'core' ? 'badge blue' : field.source === 'ymis' ? 'badge gold' : 'badge'}>{field.source === 'core' ? '核心' : field.source === 'ymis' ? 'YMIS Sheet 格式' : '可選'}</span></td>
          <td><input type="checkbox" checked={field.enabled} disabled={field.required} onChange={e => update(field.key, { enabled: e.target.checked })} /></td>
          <td><input type="checkbox" checked={field.required} disabled={field.source === 'core'} onChange={e => update(field.key, { required: e.target.checked, enabled: e.target.checked || field.enabled })} /></td>
          <td className="muted">{field.source === 'core' ? '初版必須，不可關閉' : '稍後按旅團需要啟用'}</td>
        </tr>)}</tbody>
      </table>
    </section>

    <section className="grid">
      <div className="card"><h3>家長帳戶最少欄位</h3><p className="muted">家長姓名、電話、電郵、子女 YMIS。子女姓名可選擇不填。</p></div>
      <div className="card"><h3>領袖帳戶最少欄位</h3><p className="muted">姓名、電話、電郵、希望使用身份、相關支部。</p></div>
      <div className="card"><h3>YMIS Sheet 格式</h3><p className="muted">日後根據你提供的 Sheet 欄位建立 mapping，不做 live sync，只做格式相容。</p></div>
    </section>
  </div>;
}
