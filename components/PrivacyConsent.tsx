'use client';

import { useState } from 'react';

const PRIVACY_KEY = 'scout-privacy-consented-v1';

export function hasPrivacyConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PRIVACY_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 私隱說明彈窗。
 * 使用方式：
 *   const { open, requestConsent, agreed } = usePrivacyConsent(onAgreed);
 *   <PrivacyConsent open={open} onClose={...} onAgree={...} />
 */
export default function PrivacyConsent({
  open,
  onAgree,
  onClose,
}: {
  open: boolean;
  onAgree: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card stack"
        style={{ maxWidth: 520, width: '100%', background: '#fff', animation: 'pop .15s ease' }}
        onClick={ev => ev.stopPropagation()}
      >
        <span className="badge blue">🔒 私隱及資料使用聲明</span>
        <h2 style={{ marginTop: 8 }}>提交申請前，請先閱讀</h2>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: '#444' }}>
          <p style={{ margin: '4px 0' }}>
            ✅ 本系統<strong>不收集任何敏感個人資料</strong>（如身份證號碼、銀行帳戶、信用卡等）。
          </p>
          <p style={{ margin: '4px 0' }}>
            ✅ 你所提交的資料（姓名、電郵、電話、子女編號等）<strong>僅用作本系統內部運作</strong>，包括帳戶建立、活動通知及成員管理，不會外傳或作商業用途。
          </p>
          <p style={{ margin: '4px 0' }}>
            ✅ 系統資料<strong>儲存於 Google 雲端硬碟（Google Drive）</strong>內的試算表，受 Google 帳戶保護，僅授權管理員可存取。
          </p>
          <p style={{ margin: '4px 0' }}>
            ✅ 你可隨時聯絡管理員要求查閱、更正或刪除你的資料。
          </p>
        </div>
        <div className="row" style={{ marginTop: 12, gap: 12 }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={onAgree}>
            我已閱讀並同意，繼續申請
          </button>
          <button className="btn" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
      <style>{`@keyframes pop{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

/** Helper hook：回傳 open 狀態及觸發函式 */
export function usePrivacyConsent(onAgreed: () => void) {
  const [open, setOpen] = useState(false);

  const requestConsent = () => {
    if (hasPrivacyConsent()) {
      onAgreed();
    } else {
      setOpen(true);
    }
  };

  const agree = () => {
    try {
      localStorage.setItem(PRIVACY_KEY, 'true');
    } catch {}
    setOpen(false);
    onAgreed();
  };

  return { open, requestConsent, agree, close: () => setOpen(false) };
}
