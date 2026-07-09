import api from '@/lib/apiClient';

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  groupName: string;
  creatorName: string;
  category?: { name: string; icon: string; color: string } | null;
  userSpent: number;
  userProgress: number;
  accepted: boolean;
  won?: boolean | null;
  participants: { userId: string; name: string; avatar?: string; accepted: boolean; won?: boolean | null }[];
}

export async function getChallenges(): Promise<Challenge[]> {
  const res = await api.get('/challenges');
  return res.data;
}

export async function createChallenge(body: {
  groupId: string; title: string; description?: string;
  categoryId?: string; targetAmount: number; startDate: string; endDate: string;
}): Promise<void> {
  await api.post('/challenges', body);
}

export async function acceptChallenge(id: string): Promise<void> {
  await api.patch(`/challenges/${id}/accept`);
}
