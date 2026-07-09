import { create } from 'zustand';
import type { Goal } from '@/types/goal.types';
import { getGoals } from '@/services/goalService';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  hasLoaded: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Goal) => void;
  updateGoalData: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,
  hasLoaded: false,
  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const data = await getGoals();
      set({ goals: data, isLoading: false, hasLoaded: true });
    } catch {
      set({ isLoading: false, hasLoaded: true });
    }
  },
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  updateGoalData: (id, updates) => set((state) => ({
    goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
  })),
  removeGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id),
  })),
}));
