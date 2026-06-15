'use client';

import { useEffect, useState, useCallback } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAeVCs-C4T_e5-eTrQqfYuSQvCa9eZFKqdT6y4E50TR44zXYRgMzDxFKtWZrhhqV1rqA/exec';

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

function val(row: any, ...keys: string[]) {
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    for (const key in row) {
      if (String(key).toLowerCase() === lower && row[key] !== '' && row[key] != null) return row[key];
    }
  }
  return '';
}

/**
 * 報名回覆 Hook — 後端持久化方案
 * 管理員/超管能看到所有東西
 */
export function useEventReplies(eventId: string) {
  const [myReplies, setMyReplies] = useState<Record<string, any>>({});
  const [eventReplies, setEventReplies] = useState<{ interested: any[]; registered: any[] }>({ interested: [], registered: [] });
  const user = getUser();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isLeader = user?.role === 'group_leader' || user?.role === 'branch_leader' || isAdmin;

  const loadMyReplies = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getEventReplies&userId=${encodeURIComponent(user.userId)}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        const map: Record<string, any> = {};
        (d.data || []).forEach((r: any) => {
          map[val(r, 'eventId')] = r;
        });
        setMyReplies(map);
      }
    } catch {}
  }, [user]);

  const loadEventReplies = useCallback(async () => {
    if (!isLeader || !eventId) return;
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getEventReplies&eventId=${encodeURIComponent(eventId)}&userId=${encodeURIComponent(user?.userId || '')}`, { cache: 'no-store' });
      const d = await res.json();
      if (d.success) {
        setEventReplies({
          interested: d.data?.interested || [],
          registered: d.data?.registered || [],
        });
      }
    } catch {}
  }, [eventId, isLeader, user]);

  useEffect(() => {
    loadMyReplies();
    if (isLeader) loadEventReplies();
  }, [loadMyReplies, loadEventReplies, isLeader]);

  const setReply = async (type: 'interested' | 'registered') => {
    if (!user) return;
    try {
      const params = new URLSearchParams({
        action: 'setEventReply',
        userId: user.userId,
        eventId: eventId,
        type: type,
      });
      await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      await loadMyReplies();
    } catch {}
  };

  const cancelReply = async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams({
        action: 'cancelEventReply',
        userId: user.userId,
        eventId: eventId,
      });
      await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      await loadMyReplies();
    } catch {}
  };

  const setPaid = async (targetUserId: string, paid: boolean) => {
    try {
      const params = new URLSearchParams({
        action: 'setReplyPaid',
        userId: targetUserId,
        eventId: eventId,
        paid: String(paid),
      });
      await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      await loadEventReplies();
    } catch {}
  };

  const cancelUserReply = async (targetUserId: string) => {
    try {
      const params = new URLSearchParams({
        action: 'cancelEventReply',
        userId: targetUserId,
        eventId: eventId,
      });
      await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { cache: 'no-store' });
      await loadEventReplies();
    } catch {}
  };

  const myReply = myReplies[eventId];
  const myType = myReply ? val(myReply, 'type') : '';

  return {
    myType,
    setReply,
    cancelReply,
    eventReplies,
    setPaid,
    cancelUserReply,
    reload: () => { loadMyReplies(); if (isLeader) loadEventReplies(); },
    isLeader,
  };
}
