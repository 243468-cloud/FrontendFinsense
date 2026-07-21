// FinSense — Auth Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

export interface UserPreferences {
  theme: 'light' | 'dark';
  themeColor: string;
  customTags: string[];
  petName?: string;
  notifications: {
    budgets: boolean;
    subscriptions: boolean;
    gamification: boolean;
  };
  privacy: {
    hideBalances: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPanicMode: boolean;
  preferences: UserPreferences;
  setPanicMode: (active: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  updateUserProfile: (data: Partial<Omit<User, 'id' | 'level' | 'xp' | 'coins' | 'xpToNextLevel' | 'streakDays' | 'maxStreak' | 'monthsActive' | 'goalsCompleted' | 'createdAt' | 'badges'>>) => void;
  updateUserStats: (streakDays: number, level: number, maxStreak?: number, xp?: number, coins?: number) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  themeColor: '#0A1128',
  customTags: ['comida-uni', 'transporte-ruta', 'cafecito', 'fotocopias', 'salidas'],
  petName: 'Finny',
  notifications: {
    budgets: true,
    subscriptions: true,
    gamification: true,
  },
  privacy: {
    hideBalances: false,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isPanicMode: false,
      preferences: DEFAULT_PREFERENCES,
      setPanicMode: (active) => set({ isPanicMode: active }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, preferences: DEFAULT_PREFERENCES }),
      updateUserPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      updateUserProfile: (data) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            ...data,
          }
        };
      }),
      updateUserStats: (streakDays, level, maxStreak, xp, coins) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            streakDays,
            level,
            maxStreak: maxStreak ?? state.user.maxStreak,
            xp: xp ?? state.user.xp,
            coins: coins !== undefined ? coins : (state.user.coins ?? 0),
          }
        };
      }),
    }),
    {
      name: 'finsense_auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isPanicMode: state.isPanicMode,
        preferences: state.preferences 
      }),
    }
  )
);

