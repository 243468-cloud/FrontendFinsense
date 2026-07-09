import api from '@/lib/apiClient';

export interface GamificationProfile {
  xp: number;
  level: number;
  badges: string[];
  streakDays: number;
  maxStreak: number;
  lastEntryDate: string | null;
  coins?: number;
  inventory?: string[];
  equippedSkin?: string;
  chests?: number;
}

export interface Quest {
  id: number;
  title: string;
  desc: string;
  xp: number;
  progress: number;
  max: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  unlockedAt?: string;
  color?: string;
  justUnlocked?: boolean;
}

export async function getProfile(): Promise<GamificationProfile> {
  const { data } = await api.get('/gamification/profile');
  return data;
}

export async function getQuests(): Promise<Quest[]> {
  const { data } = await api.get('/gamification/quests');
  return data;
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await api.get('/gamification/achievements');
  return data;
}

export async function purchaseStoreItem(itemId: string, price: number, type: 'avatar' | 'theme', metadata?: string) {
  const { data } = await api.post('/gamification/purchase', { itemId, price, type, metadata });
  return data;
}

export async function claimDailyReward(): Promise<{ success: boolean; reward?: number; reason?: string }> {
  const { data } = await api.post('/gamification/daily-reward');
  return data;
}

export async function equipSkin(skinId: string) {
  const { data } = await api.post('/gamification/equip-skin', { skinId });
  return data;
}

export async function openChest(): Promise<{ success: boolean, rewardType: string, amount: number, itemId: string | null }> {
  const { data } = await api.post('/gamification/open-chest');
  return data;
}

