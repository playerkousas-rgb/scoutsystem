'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `${APPS_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      const data = await res.json();

      if (data.success) {
        // 登入成功，儲存使用者資訊
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // 跳轉到後台
        router.push('/admin');
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (err) {
      setError('無法連線到伺服器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">登入系統</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">電子郵件</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:bg-gray-400"
        >
          {loading ? '登入中...' : '登入'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        目前僅開放超級管理員登入
      </p>
    </div>
  );
}
