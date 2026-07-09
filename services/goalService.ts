// FinSense — Goal Service
import apiClient from '@/lib/apiClient';
import type { Goal, CreateGoalDTO } from '@/types/goal.types';

// ─── Shape normalizer: backend → frontend ───
function mapGoal(raw: any): Goal {
  return {
    id: raw.id,
    userId: raw.userId ?? raw.user_id,
    title: raw.name ?? raw.title,
    description: raw.description,
    targetAmount: Number(raw.targetAmount ?? raw.target_amount),
    currentAmount: Number(raw.currentAmount ?? raw.current_amount ?? 0),
    deadline: raw.deadline ?? '',
    status:
      raw.status ??
      (Number(raw.currentAmount ?? 0) >= Number(raw.targetAmount ?? 1)
        ? 'completed'
        : 'active'),
    categoryId: raw.categoryId ?? 'savings',
    emoji: raw.icon ?? raw.emoji ?? '🎯',
    createdAt: raw.createdAt ?? raw.created_at,
  } as Goal;
}

export async function getGoals(): Promise<Goal[]> {
  const { data } = await apiClient.get<any[]>('/goals');
  return data.map(mapGoal);
}

export async function createGoal(dto: CreateGoalDTO): Promise<Goal> {
  const { data } = await apiClient.post<any>('/goals', {
    name: dto.title,
    targetAmount: dto.targetAmount,
    deadline: dto.deadline,
    icon: dto.emoji,
  });
  return mapGoal(data);
}

export async function updateProgress(id: string, amount: number): Promise<Goal> {
  const { data } = await apiClient.post<any>(`/goals/${id}/deposit`, { amount });
  return mapGoal(data.goal ?? data);
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/goals/${id}`);
}

export async function getGoal(id: string): Promise<Goal> {
  const { data } = await apiClient.get<any>(`/goals/${id}`);
  return mapGoal(data);
}

export async function updateGoal(id: string, dto: Partial<CreateGoalDTO>): Promise<Goal> {
  const { data } = await apiClient.put<any>(`/goals/${id}`, dto);
  return mapGoal(data);
}
