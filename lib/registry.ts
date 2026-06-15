/**
 * ScoutSystem V7.0 - 三層級功能註冊表
 */

export interface AppCard {
  id: string;
  title: string;
  icon: string;
  tier: 1 | 2 | 3; // 層級
  path: string;    // 前端路由或外部連結
  roles: string[]; // 哪些角色可見
  description?: string;
}

export const PORTAL_CARDS: AppCard[] = [
  // 層級 1: 本體功能
  { id: 'members', title: '成員管理', icon: '👥', tier: 1, path: '/admin/members', roles: ['admin', 'super_admin', 'leader'] },
  { id: 'apply', title: '申請審核', icon: '📝', tier: 1, path: '/admin/parents', roles: ['admin', 'super_admin', 'leader'] },
  { id: 'events', title: '活動管理', icon: '📅', tier: 1, path: '/admin/events', roles: ['admin', 'super_admin', 'leader'] },
  
  // 層級 2: 轉駁器插件 (即插即用)
  { id: 'library', title: '圖書館', icon: '📚', tier: 2, path: '/library', roles: ['member', 'parent', 'leader', 'admin'] },
  { id: 'tools', title: '小工具箱', icon: '🛠️', tier: 2, path: '/tools', roles: ['leader', 'admin'] },

  // 層級 3: 獨立大系統 (外部跳轉)
  { id: 'dbs', title: 'DBS 徽章系統', icon: '🎖️', tier: 3, path: 'https://districtbadgesystem30.vercel.app/', roles: ['member', 'leader'] },
];

export const getAccessibleCards = (userRole: string, activeModuleKeys: string[]) => {
  return PORTAL_CARDS.filter(card => {
    // 1. 檢查角色權限
    const hasRole = card.roles.includes(userRole) || userRole === 'super_admin';
    // 2. 如果是層級 2 或 3，檢查該區是否有啟用 (activeModuleKeys 來自該區的 SystemConfig)
    const isEnabled = card.tier === 1 || activeModuleKeys.includes(card.id);
    return hasRole && isEnabled;
  });
};
