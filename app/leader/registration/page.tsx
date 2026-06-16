'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import { LeaderRegistrationPanel } from '@/components/EventRegistrationPanel';
import { branchName } from '@/lib/branches';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

const leaderRoles: string[] = ['super_admin', 'admin', 'group_leader', 'branch_leader', 'coach'];

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

function RegistrationPageInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const [eventInfo, setEventInfo] = useState<any>(null);
  const user = getUser();

  useEffect(() => {
    if (!eventId) return;
    // 取得活動資訊
    async function loadEvent() {
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getPublicCalendarItems`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data?.events) {
          const ev = data.data.events.find((e: any) => (e.id || e.eventId) === eventId);
          if (ev) setEventInfo(ev);
        }
      } catch {}
    }
    loadEvent();
  }, [eventId]);

  if (!eventId) {
    return (
      <div className="stack">
        <section className="card">
          <h2>請從控制台選擇一個活動</h2>
          <p className="muted">返回<a href="/leader" className="btn" style={{ marginLeft: 8 }}>領袖控制台</a></p>
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      {eventInfo && (
        <section className="hero">
          <span className="badge blue">報名管理</span>
          <h1>{eventInfo.title}</h1>
          <p className="muted">
            {eventInfo.date} · {eventInfo.location} · {branchName(eventInfo.branchId)} · 費用：{eventInfo.fee || '-'}
          </p>
        </section>
      )}

      {!eventInfo && (
        <div className="muted">載入活動資料...</div>
      )}

      {user && (
        <LeaderRegistrationPanel eventId={eventId} userId={user.userId} />
      )}

      <a href="/leader" className="btn" style={{ alignSelf: 'flex-start' }}>← 返回控制台</a>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <AuthGate roles={leaderRoles as any} title="需要領袖或管理員權限">
      <Suspense fallback={<div className="muted" style={{ padding: 40 }}>載入中...</div>}>
        <RegistrationPageInner />
      </Suspense>
    </AuthGate>
  );
}
