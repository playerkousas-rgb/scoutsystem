'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const adminRoles: string[] = ['super_admin', 'admin'];

function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.userId) return p;
    }
  } catch {}
  return null;
}

function AdminInner() {
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [dashRes, appRes] = await Promise.all([
          fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' }),
          fetch(`${APPS_SCRIPT_URL}?action=getPendingApplications&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' }),
        ]);
        const dashData = await dashRes.json();
        const appData = await appRes.json();

        if (dashData.success) setStats(dashData.data);
        if (appData.success) setApplications(appData.data || []);
      } catch (err: any) {
        setError(err.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const approve = async (appId: string) => {
    if (!confirm('確定審批此申請？')) return;
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=approveApplication&applicationId=${encodeURIComponent(appId)}&approvedBy=${encodeURIComponent(user.userId)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.filter(a => a.applicationId !== appId && a.id !== appId));
        alert('已審批並創建用戶');
      } else {
        alert('審批失敗：' + (data.error || ''));
      }
    } catch (err: any) {
      alert('連線失敗');
    }
  };

  if (loading) return <div className="stack" style={{ padding: 40 }}>載入中...</div>;

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge gold">{user?.role === 'super_admin' ? '超級管理員' : '管理員'}控制台</span>
        <h1>後台總覽</h1>
        <p>您擁有系統管理權限，可管理所有功能。</p>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}

      {stats && (
        <section className="grid">
          <div className="card"><span className="badge blue">用戶</span><h2>{stats.totalUsers || 0}</h2><p className="muted">總用戶數</p></div>
          <Link href="/admin/parents" className="card group" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="badge red">待審批</span>
            <h2>{stats.pendingApplications || 0}</h2>
            <p className="muted">待處理申請 → 前往審核</p>
          </Link>
          <div className="card"><span className="badge green">活動</span><h2>{stats.totalEvents || 0}</h2><p className="muted">已發布活動</p></div>
          <div className="card"><span className="badge gold">通告</span><h2>{stats.totalBookmarks || 0}</h2><p className="muted">圖書館收藏</p></div>
          <div className="card"><span className="badge blue">成員</span><h2>{stats.totalMembers || 0}</h2><p className="muted">總成員數</p></div>
        </section>
      )}

      {applications.length > 0 && (
        <section className="card stack">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>待審批申請</h2>
            <Link href="/admin/parents" className="btn" style={{ fontSize: 14 }}>查看全部 / 申請管理 →</Link>
          </div>
          {applications.map(app => (
            <div key={app.applicationId || app.id} className="card" style={{ boxShadow: 'none' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h3>{app.name}</h3>
                  <p className="muted">{app.email} · {app.applicantType || app.role} · {app.branchId}</p>
                </div>
                <button className="btn primary" onClick={() => approve(app.applicationId || app.id)}>審批</button>
              </div>
              {app.experience && <p>{app.experience}</p>}
              {app.ymNumbers && <p className="muted">子女 YM：{app.ymNumbers}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="grid">
        <FeatureCard title="支部管理" icon="🏢" text="管理所有支部資料、新增或編輯支部。" href="/admin/branches" />
        <FeatureCard title="成員資料庫" icon="👥" text="查看及管理所有支部的成員資料。" href="/admin/members" />
        <FeatureCard title="家長審核 / 申請管理" icon="✅" text="審核家長、領袖、成員的註冊申請，可批核或拒絕。" href="/admin/parents" />
        <FeatureCard title="活動管理" icon="🗓️" text="新增、發布及管理全旅活動。" href="/admin/events" />
        <FeatureCard title="圖書館標記" icon="📚" text="標記本旅需要的圖書館通告。" href="/library" />
        <FeatureCard title="通告管理" icon="📄" text="上傳及管理通告檔案。" href="/notices" />
        <FeatureCard title="系統設定" icon="⚙️" text="管理 SystemConfig、Roles、FieldSettings 等系統設定。" href="/admin/settings" />
        <FeatureCard title="使用者管理" icon="👤" text="查看及管理所有使用者帳號。" href="/admin/users" />
        <FeatureCard title="審核紀錄" icon="📜" text="查看所有申請與操作紀錄。" href="/admin/audit" />
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGate roles={adminRoles as any} title="需要管理員權限">
      <AdminInner />
    </AuthGate>
  );
}

function FeatureCard({ title, text, icon, href }: { title: string; text: string; icon: string; href: string; }) {
  return (
    <Link href={href} className="card stack group">
      <h3 className="flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <p className="muted">{text}</p>
      <div className="btn block text-center mt-auto group-hover:bg-blue-600 group-hover:text-white transition">進入</div>
    </Link>
  );
}
