'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="stack">
      {/* Hero 區 */}
      <section className="hero">
        <span className="badge gold">超級管理員控制台</span>
        <h1>後台總覽</h1>
        <p>您擁有系統最高權限，可管理所有功能。</p>
      </section>

      {/* 功能卡片區 */}
      <section className="grid">
        <FeatureCard 
          title="總覽 Dashboard" 
          icon="📊" 
          text="查看全旅統計數據、待處理事項與近期活動。" 
          href="/admin" 
        />
        <FeatureCard 
          title="支部管理" 
          icon="🏢" 
          text="管理所有支部資料、新增或編輯支部。" 
          href="/admin/branches" 
        />
        <FeatureCard 
          title="成員資料庫" 
          icon="👥" 
          text="查看及管理所有支部的成員資料。" 
          href="/admin/members" 
        />
        <FeatureCard 
          title="家長審核" 
          icon="✅" 
          text="審核家長申請及子女綁定請求。" 
          href="/admin/parents" 
        />
        <FeatureCard 
          title="活動管理" 
          icon="🗓️" 
          text="新增、發布及管理全旅活動。" 
          href="/admin/events" 
        />
        <FeatureCard 
          title="圖書館標記" 
          icon="📚" 
          text="標記本旅需要的圖書館通告。" 
          href="/library" 
        />
        <FeatureCard 
          title="通告管理" 
          icon="📄" 
          text="上傳及管理通告檔案。" 
          href="/notices" 
        />
        <FeatureCard 
          title="系統設定" 
          icon="⚙️" 
          text="管理 SystemConfig、Roles、FieldSettings 等系統設定。" 
          href="/admin/settings" 
        />
        <FeatureCard 
          title="使用者管理" 
          icon="👤" 
          text="查看及管理所有使用者帳號。" 
          href="/admin/users" 
        />
        <FeatureCard 
          title="審核紀錄" 
          icon="📜" 
          text="查看所有申請與操作紀錄。" 
          href="/admin/audit" 
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, text, icon, href }: { 
  title: string; 
  text: string; 
  icon: string; 
  href: string;
}) {
  return (
    <Link href={href} className="card stack group">
      <h3 className="flex items-center gap-2">
        <span>{icon}</span> 
        <span>{title}</span>
      </h3>
      <p className="muted">{text}</p>
      <div className="btn block text-center mt-auto group-hover:bg-blue-600 group-hover:text-white transition">
        進入
      </div>
    </Link>
  );
}
