// FinSense — Goal Service (SOA)
import apiClient from '@/lib/apiClient';
import type { Goal, CreateGoalDTO } from '@/types/goal.types';
import { MOCK_GOALS } from '@/lib/mockData';

const USE_MOCK = false;
let mockGoals = [...MOCK_GOALS];

// Normalize backend Goal → frontend Goal type
function mapGoal(raw: any): Goal {
  return {
    id: raw.id,
    userId: raw.userId ?? raw.user_id,
    title: raw.name ?? raw.title,
    description: raw.description,
    targetAmount: Number(raw.targetAmount ?? raw.target_amount),
    currentAmount: Number(raw.currentAmount ?? raw.current_amount ?? 0),
    deadline: raw.deadline ?? '',
    status: raw.status ?? (Number(raw.currentAmount ?? 0) >= Number(raw.targetAmount ?? 1) ? 'completed' : 'active'),
    categoryId: raw.categoryId ?? 'savings',
    emoji: raw.icon ?? raw.emoji ?? '🎯',
    createdAt: raw.createdAt ?? raw.created_at,
  } as Goal;
}

export async function getGoals(): Promise<Goal[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return [...mockGoals];
  }

  const { data } = await apiClient.get<any[]>('/goals');
  return data.map(mapGoal);
}

export async function createGoal(dto: CreateGoalDTO): Promise<Goal> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      userId: 'user_001',
      ...dto,
      deadline: dto.deadline ?? '',
      currentAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockGoals = [newGoal, ...mockGoals];
    return newGoal;
  }

  // Backend expects: name, targetAmount, deadline, icon, color
  const payload = {
    name: dto.title,
    targetAmount: dto.targetAmount,
    deadline: dto.deadline,
    icon: dto.emoji,
    color: '#8B5CF6',
  };
  const { data } = await apiClient.post<any>('/goals', payload);
  return mapGoal(data);
}

export async function updateProgress(id: string, amount: number): Promise<Goal> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    mockGoals = mockGoals.map((g) => {
      if (g.id !== id) return g;
      const newAmount = Math.min(g.currentAmount + amount, g.targetAmount);
      return {
        ...g,
        currentAmount: newAmount,
        status: newAmount >= g.targetAmount ? 'completed' : g.status,
        completedAt: newAmount >= g.targetAmount ? new Date().toISOString() : undefined,
      };
    });
    return mockGoals.find((g) => g.id === id)!;
  }

  const { data } = await apiClient.post<any>(`/goals/${id}/deposit`, { amount });
  return mapGoal(data.goal ?? data);
}

export async function deleteGoal(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    mockGoals = mockGoals.filter((g) => g.id !== id);
    return;
  }

  await apiClient.delete(`/goals/${id}`);
}
