// 支部名稱對照 — 統一顯示為「XX支部」格式
export const BRANCH_NAMES: Record<string, string> = {
  b1: '小童軍支部',
  b2: '幼童軍支部',
  b3: '童軍支部',
  b4: '深資童軍支部',
  b5: '樂行童軍支部',
  小童軍: '小童軍支部',
  幼童軍: '幼童軍支部',
  童軍: '童軍支部',
  深資童軍: '深資童軍支部',
  樂行童軍: '樂行童軍支部',
};

export function branchName(id?: string): string {
  if (!id || id === '') return '—';
  const key = String(id).trim();
  // 已有對照
  if (BRANCH_NAMES[key]) return BRANCH_NAMES[key];
  // 已包含「支部」
  if (key.includes('支部')) return key;
  // 嘗試加「支部」
  return key + '支部';
}

export function branchFullName(id?: string): string {
  return branchName(id);
}
