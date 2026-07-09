import api from '@/lib/apiClient';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  city: string;
  xp: number;
  level: number;
  league: string;
  isCurrentUser: boolean;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await api.get('/gamification/leaderboard');
  return res.data;
}

