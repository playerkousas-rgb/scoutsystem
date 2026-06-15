/**
 * 旅團系統專用轉駁器配置
 */
export const TROOP_ROUTER_URL = 'https://raw.githubusercontent.com/playerkousas-rgb/troop-router/main/registry.json';

export async function fetchMarketplace() {
  const response = await fetch(TROOP_ROUTER_URL);
  return response.json();
}

/**
 * 核心跳轉邏輯
 * 確保從 Portal 跳轉到獨立系統時，永遠帶上 ?t=旅團代碼
 */
export const getPluginUrl = (pluginPath: string, tier: number, troopId: string) => {
  if (tier === 3) {
    const separator = pluginPath.includes('?') ? '&' : '?';
    return `${pluginPath}${separator}t=${troopId}`;
  }
  return pluginPath;
};
