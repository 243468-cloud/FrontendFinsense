// FinSense — Goal Service (SOA)
import apiClient from '@/lib/apiClient';
import type { Goal, CreateGoalDTO } from '@/types/goal.types';
import { MOCK_GOALS } from '@/lib/mockData';

const USE_MOCK = true;
let mockGoals = [...MOCK_GOALS];

export async function getGoals(): Promise<Goal[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return [...mockGoals];
  }

  const { data } = await apiClient.get<Goal[]>('/goals');
  return data;
}

export async function createGoal(dto: CreateGoalDTO): Promise<Goal> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      userId: 'user_001',
      ...dto,
      currentAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockGoals = [newGoal, ...mockGoals];
    return newGoal;
  }

  const { data } = await apiClient.post<Goal>('/goals', dto);
  return data;
}

export async function updateProgress(
  id: string,
  amount: number
): Promise<Goal> {
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

  const { data } = await apiClient.patch<Goal>(`/goals/${id}/progress`, { amount });
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    mockGoals = mockGoals.filter((g) => g.id !== id);
    return;
  }

  await apiClient.delete(`/goals/${id}`);
}
