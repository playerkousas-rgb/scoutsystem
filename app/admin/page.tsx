'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import AnnouncementManager from '@/components/AnnouncementManager';
import { branchName } from '@/lib/branches';

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

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    parent: '家長', leader: '領袖', member: '成員',
    admin: '管理員', super_admin: '超級管理員',
    group_leader: '團長', branch_leader: '支部領袖', coach: '教練員',
  };
  return map[String(role).toLowerCase()] || role;
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
          fetch(`${APPS_SCRIPT_URL}?action=getTableData&table=Applications`, { cache: 'no-store' }),
        ]);
        const dashData = await dashRes.json();
        const appData = await appRes.json();

        if (dashData.success) setStats(dashData.data);
        if (appData.success) {
          // 只顯示 pending
          setApplications((appData.data || []).filter((a: any) => {
            const st = String(val(a, 'status') || '').trim().toLowerCase();
            const alt = String(val(a, 'approvedAt') || '').trim().toLowerCase();
            return st === 'pending' || alt === 'pending' || (!st && !alt);
          }));
        }
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

      {/* 待審批快速預覽 — 純展示，按「前往審核頁面」到內頁操作（不會誤觸） */}
      {applications.length > 0 && (
        <section className="card stack">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>待審批申請（{applications.length}）</h2>
            <Link href="/admin/parents" className="btn primary" style={{ fontSize: 14 }}>前往審核頁面 →</Link>
          </div>
          {applications.slice(0, 5).map(app => {
            const id = String(val(app, 'applicationId', 'id'));
            return (
              <div key={id} className="card" style={{ boxShadow: 'none', background: '#f9fafb' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{val(app, 'name')}</h3>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                    {val(app, 'email')} · {roleLabel(val(app, 'applicantType', 'requestedRole', 'role'))} · {branchName(val(app, 'branchId'))}
                  </p>
                  {val(app, 'ymNumbers') && <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>👶 子女 YM：{val(app, 'ymNumbers')}{val(app, 'childNames') && ` · ${val(app, 'childNames')}`}</p>}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <AnnouncementManager />

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
