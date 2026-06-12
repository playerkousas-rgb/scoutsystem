'use client';

import Link from 'next/link';
import { useState } from 'react';
import { registerParentAccount } from '@/lib/troupeStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ym, setYm] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    registerParentAccount(name.trim(), email.trim(), ym.split(/[\n,， ]+/).filter(Boolean));
    setDone(true);
  };

  return (
    <div className="split">
      <section className="card stack">
        <span className="badge gold">Parent Self Registration</span>
        <h2>家長自行註冊</h2>
        <p className="muted">提交後帳號會進入「待審」狀態。管理端核准後，家長即可用單一帳號查看已綁定子女。</p>

        {done ? (
          <div className="stack">
            <div className="notice">註冊申請已建立。請到管理後台以旅長 / 團長身份審核。</div>
            <div className="row">
              <Link className="btn primary" href="/admin">到管理後台審核</Link>
              <Link className="btn" href="/login">返回登入</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="stack">
            <label><span className="label">家長姓名</span><input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="例如：陳太" /></label>
            <label><span className="label">登入電郵</span><input className="input" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@example.com" /></label>
            <label><span className="label">子女成員編號（可多個，以空格、逗號或換行分隔）</span><textarea className="textarea" value={ym} onChange={e => setYm(e.target.value)} placeholder="例如：YM001 YM002" /></label>
            <button className="btn primary" type="submit">送出註冊申請</button>
          </form>
        )}
      </section>

      <aside className="card">
        <h3>設計重點</h3>
        <ul className="muted">
          <li>家長可註冊，但不會立即取得資料存取權。</li>
          <li>系統以成員編號輔助綁定；正式版可加入一次性驗證碼或人工核對。</li>
          <li>同一帳號可跨支部綁定多名子女。</li>
        </ul>
      </aside>
    </div>
  );
}
