'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrivacyConsent, { usePrivacyConsent } from '@/components/PrivacyConsent';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [childYmNumbers, setChildYmNumbers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 用 ref 保存最後一次表單資料，待私隱同意後再送出
  const pendingSubmit = useRef<(() => void) | null>(null);

  const doSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const url = APPS_SCRIPT_URL
        + '?action=registerParent'
        + '&name=' + encodeURIComponent(name)
        + '&email=' + encodeURIComponent(email)
        + '&phone=' + encodeURIComponent(phone)
        + '&password=' + encodeURIComponent(password)
        + '&childYmNumbers=' + encodeURIComponent(childYmNumbers);

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || '註冊失敗');
      }
    } catch (err: any) {
      setError(err.message || '連線失敗');
    } finally {
      setLoading(false);
    }
  };

  // 私隱同意流程
  const { open, requestConsent, agree, close } = usePrivacyConsent(() => {
    if (pendingSubmit.current) pendingSubmit.current();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }
    if (password.length < 4) {
      setError('密碼長度至少 4 位');
      return;
    }

    // 先彈出私隱說明；同意後才送出
    pendingSubmit.current = doSubmit;
    requestConsent();
  };

  if (success) {
    return (
      <div className="stack" style={{ maxWidth: 480, margin: '60px auto' }}>
        <section className="card" style={{ background: '#f0fff4', border: '1px solid #ccffcc' }}>
          <span className="badge green">註冊成功</span>
          <h2>申請已提交</h2>
          <p className="muted">你的家長帳戶申請已提交，請等待管理員或團長審批。審批通過後即可用電郵和密碼登入。</p>
          <button className="btn primary" onClick={() => router.push('/login')}>前往登入</button>
        </section>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 480, margin: '60px auto' }}>
      <section className="card">
        <h1>家長註冊</h1>
        <p className="muted">註冊後需等待領袖審批。請準確填寫子女 YM 編號以便系統自動關聯。</p>

        {/* 私隱摘要（常駐顯示） */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 8 }}>
          🔒 本系統不收集敏感資料，資料僅用作系統內部用途，並儲存於 Google 雲端硬碟內。提交時將再顯示完整聲明。
        </div>

        <form onSubmit={handleSubmit} className="stack">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電子郵件（登入用）</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電話</label>
            <input className="w-full border rounded-lg px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">子女 YM 編號（多個用逗號分隔）</label>
            <input className="w-full border rounded-lg px-3 py-2" value={childYmNumbers} onChange={e => setChildYmNumbers(e.target.value)} placeholder="YM001, YM002" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密碼</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">確認密碼</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          {error && (
            <div className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
              <p style={{ color: 'var(--red)' }}>{error}</p>
            </div>
          )}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? '提交中...' : '提交註冊申請'}
          </button>
        </form>
        <div className="row" style={{ marginTop: 16 }}>
          <a href="/login" className="btn">已有帳戶？登入</a>
        </div>
      </section>

      <PrivacyConsent open={open} onAgree={agree} onClose={close} />
    </div>
  );
}
