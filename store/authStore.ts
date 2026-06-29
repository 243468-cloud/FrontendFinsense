// FinSense — Auth Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

export interface UserPreferences {
  theme: 'light' | 'dark';
  customTags: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  preferences: UserPreferences;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  updateUserProfile: (name: string, email: string, city: string) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  customTags: ['comida-uni', 'transporte-ruta', 'cafecito', 'fotocopias', 'salidas'],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      preferences: DEFAULT_PREFERENCES,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUserPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      updateUserProfile: (name, email, city) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            name,
            email,
            city,
          }
        };
      }),
    }),
    {
      name: 'finsense_auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences 
      }),
    }
  )
);

