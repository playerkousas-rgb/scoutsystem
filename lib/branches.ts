// 支部名稱對照
// 新資料直接儲存中文名稱（小童軍 / 幼童軍 / 童軍 / 深資童軍 / 樂行童軍）
// 舊資料可能是 b1-b5，這裡作 fallback 轉換
export const BRANCH_NAMES: Record<string, string> = {
  b1: '小童軍',
  b2: '幼童軍',
  b3: '童軍',
  b4: '深資童軍',
  b5: '樂行童軍',
};

export function branchName(id?: string): string {
  if (!id || id === '') return '—';
  // 如果已經是中文名稱，直接回傳
  if (BRANCH_NAMES[id]) return BRANCH_NAMES[id];
  return id;
}

export function branchFullName(id?: string): string {
  const map: Record<string, string> = {
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
  if (!id || id === '') return '—';
  return map[id] || id;
}

// branchId 正規化：統一 b1-b5 代碼和中文名稱
// 有些資料用 "b3"，有些用 "童軍"，需要統一比較
const BRANCH_ID_MAP: Record<string, string> = {
  'b1': '小童軍', 'b2': '幼童軍', 'b3': '童軍', 'b4': '深資童軍', 'b5': '樂行童軍',
  '小童軍': '小童軍', '幼童軍': '幼童軍', '童軍': '童軍', '深資童軍': '深資童軍', '樂行童軍': '樂行童軍',
};

/** 將 branchId 正規化為中文名稱，方便比較 */
export function normalizeBranchId(id?: string): string {
  if (!id || id === '') return '';
  return BRANCH_ID_MAP[id] || id;
}

/** 比較兩個 branchId 是否相同（處理代碼/中文名差異） */
export function branchIdMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return normalizeBranchId(a) === normalizeBranchId(b);
}
