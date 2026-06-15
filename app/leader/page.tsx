'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { branchName } from '@/lib/branches';

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

/** 大小寫不敏感取值 */
function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) {
      if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key];
    }
  }
  return '';
}

function LeaderInner() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  // 只有團長、支部領袖可審批（教練員不能）
  const canApprove = user?.role === 'group_leader' || user?.role === 'branch_leader';

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const dashRes = await fetch(`${APPS_SCRIPT_URL}?action=getDashboardData&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' });
        const dashData = await dashRes.json();
        if (dashData.success) setStats(dashData.data);
      } catch (err: any) {
        setError(err.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

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
          {/* 教練員看不到待審批 */}
          {canApprove && (
            <Link href="/admin/parents" className="card group" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="badge red">待審批</span>
              <h2>{stats.pendingApplications || 0}</h2>
              <p className="muted">待處理申請 → 前往審核</p>
            </Link>
          )}
        </section>
      )}

      {/* 教練員不顯示申請管理卡片 */}
      <section className="grid">
        <FeatureCard title="活動管理" icon="🗓️" text="管理所屬支部的活動。" href="/admin/events" />
        <FeatureCard title="圖書館標記" icon="📚" text="標記本旅需要的通告。" href="/library" />
        <FeatureCard title="成員資料" icon="👥" text="查看所屬支部成員。" href="/admin/members" />
        {canApprove && (
          <FeatureCard title="家長審核 / 申請管理" icon="✅" text="審核家長註冊申請（含子女姓名及 YMIS）。" href="/admin/parents" />
        )}
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
