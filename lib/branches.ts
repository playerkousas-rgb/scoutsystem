// 支部名稱對照（b1-b5 → 中文名稱）
export const BRANCH_NAMES: Record<string, string> = {
  b1: '小童軍',
  b2: '幼童軍',
  b3: '童軍',
  b4: '深資童軍',
  b5: '樂行童軍',
};

export function branchName(id?: string): string {
  if (!id || id === '') return '—';
  return BRANCH_NAMES[id] || id;
}

export function branchFullName(id?: string): string {
  const map: Record<string, string> = {
    b1: '小童軍支部',
    b2: '幼童軍支部',
    b3: '童軍支部',
    b4: '深資童軍支部',
    b5: '樂行童軍支部',
  };
  if (!id || id === '') return '—';
  return map[id] || id;
}
