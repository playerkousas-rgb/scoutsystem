'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const leaderRoles: string[] = ['group_leader', 'branch_leader', 'coach'];

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

function LeaderInner() {
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

  const canApprove = user?.role === 'group_leader' || user?.role === 'branch_leader';

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
        <span className="badge blue">領袖控制台</span>
        <h1>{user?.role === 'group_leader' ? '團長' : user?.role === 'branch_leader' ? '支部領袖' : '教練員'}控制台</h1>
        <p>管理所屬支部的活動、成員及申請。</p>
      </section>

      {error && (
        <section className="card" style={{ background: '#fff0f0', border: '1px solid #ffcccc' }}>
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
        </section>
      )}

      {stats && (
        <section className="grid">
          <div className="card"><span className="badge blue">成員</span><h2>{stats.totalMembers || 0}</h2><p className="muted">所屬支部成員</p></div>
          <div className="card"><span className="badge green">活動</span><h2>{stats.totalEvents || 0}</h2><p className="muted">已發布活動</p></div>
          <div className="card"><span className="badge red">待審批</span><h2>{stats.pendingApplications || 0}</h2><p className="muted">待處理申請</p></div>
        </section>
      )}

      {canApprove && applications.length > 0 && (
        <section className="card stack">
          <h2>待審批申請</h2>
          {applications.map(app => (
            <div key={app.applicationId || app.id} className="card" style={{ boxShadow: 'none' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h3>{app.name}</h3>
                  <p className="muted">{app.email} · {app.role} · {app.branchId}</p>
                </div>
                <button className="btn primary" onClick={() => approve(app.applicationId || app.id)}>審批</button>
              </div>
              {app.experience && <p>{app.experience}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="grid">
        <FeatureCard title="活動管理" icon="🗓️" text="管理所屬支部的活動。" href="/admin/events" />
        <FeatureCard title="圖書館標記" icon="📚" text="標記本旅需要的通告。" href="/library" />
        <FeatureCard title="成員資料" icon="👥" text="查看所屬支部成員。" href="/admin/members" />
      </section>
    </div>
  );
}

export default function LeaderDashboard() {
  return (
    <AuthGate roles={leaderRoles as any} title="需要領袖權限">
      <LeaderInner />
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
