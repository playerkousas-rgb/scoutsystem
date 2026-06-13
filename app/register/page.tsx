'use client';

import Link from 'next/link';
import { useState } from 'react';
import { registerParentAccount } from '@/lib/troupeStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ym, setYm] = useState('');
  const [childNames, setChildNames] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    registerParentAccount(name.trim(), email.trim(), ym.split(/[\n,， ]+/).filter(Boolean), phone.trim());
    setDone(true);
  };

  return (
    <div className="split">
      <section className="card stack">
        <span className="badge gold">Parent Account Application</span>
        <h2>家長申請加入系統</h2>
        <p className="muted">初版只收最少資料：家長姓名、電話、電郵、子女 YMIS / 成員編號。子女姓名可不填，以減低私隱資料收集。</p>

        {done ? (
          <div className="stack">
            <div className="notice">申請已建立。管理端核准後，家長即可登入查看已綁定子女及相關通告 / 活動。</div>
            <div className="row">
              <Link className="btn primary" href="/admin">到管理後台審核</Link>
              <Link className="btn" href="/login">返回登入</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="stack">
            <label><span className="label">家長姓名 *</span><input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="例如：陳太" /></label>
            <label><span className="label">電話 *</span><input className="input" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="例如：9123 4567" /></label>
            <label><span className="label">登入電郵 *</span><input className="input" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@example.com" /></label>
            <label><span className="label">子女 YMIS / 成員編號 *（可多個，以空格、逗號或換行分隔）</span><textarea className="textarea" required value={ym} onChange={e => setYm(e.target.value)} placeholder="例如：YM001 YM002" /></label>
            <label><span className="label">子女姓名，可不填</span><textarea className="textarea" value={childNames} onChange={e => setChildNames(e.target.value)} placeholder="如旅團需要人手核對才填寫；系統初版不會儲存此欄位。" /></label>
            <button className="btn primary" type="submit">送出申請</button>
          </form>
        )}
      </section>

      <aside className="card stack">
        <h3>私隱設計</h3>
        <ul className="muted">
          <li>子女識別以 YMIS / 成員編號為主。</li>
          <li>子女姓名不是必須，旅團可選擇不收集。</li>
          <li>正式版會把申請與核准紀錄寫入 Google Sheet。</li>
        </ul>
      </aside>
    </div>
  );
}
