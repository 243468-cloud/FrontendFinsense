// FinSense — Auth Service (SOA)
import apiClient from '@/lib/apiClient';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import type { LoginDTO, RegisterDTO, AuthResponse, User } from '@/types/auth.types';
import { MOCK_USER } from '@/lib/mockData';

const USE_MOCK = false;

// Fill missing User fields with defaults (backend doesn't have level/xp/streak)
function enrichUser(raw: any): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    city: raw.city ?? 'Tuxtla Gutiérrez',
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    avatar: raw.avatar,
    level: raw.level ?? raw.xp?.level ?? 1,
    xp: raw.xp?.totalXp ?? (typeof raw.xp === 'number' ? raw.xp : 0),
    xpToNextLevel: raw.xpToNextLevel ?? 500,
    streakDays: raw.streakDays ?? raw.streak?.currentStreak ?? 0,
    maxStreak: raw.maxStreak ?? raw.streak?.longestStreak ?? 0,
    monthsActive: raw.monthsActive ?? 1,
    goalsCompleted: raw.goalsCompleted ?? 0,
    badges: raw.badges ?? raw.xp?.badges ?? '[]',
  };
}

export async function login(credentials: LoginDTO): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    const mockResponse: AuthResponse = {
      user: MOCK_USER,
      accessToken: 'mock_access_token_12345',
      refreshToken: 'mock_refresh_token_67890',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, mockResponse.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, mockResponse.refreshToken);
    }
    return mockResponse;
  }

  const { data } = await apiClient.post<any>('/auth/login', credentials);
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return { ...data, user: enrichUser(data.user) };
}

export async function register(registerData: RegisterDTO): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200));
    const mockResponse: AuthResponse = {
      user: { ...MOCK_USER, name: registerData.name, email: registerData.email },
      accessToken: 'mock_access_token_new',
      refreshToken: 'mock_refresh_token_new',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, mockResponse.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, mockResponse.refreshToken);
    }
    return mockResponse;
  }

  const { data } = await apiClient.post<any>('/auth/register', registerData);
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return { ...data, user: enrichUser(data.user) };
}

export async function refreshToken(): Promise<string> {
  const refresh =
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  if (!refresh) throw new Error('No refresh token');

  const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken: refresh,
  });
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data.accessToken;
}

export async function getProfile(): Promise<User> {
  if (USE_MOCK) {
    return MOCK_USER;
  }
  const { data } = await apiClient.get<any>('/auth/me');
  return enrichUser(data);
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getStoredToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export async function getUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
  if (USE_MOCK) {
    return [
      { id: 'user_002', name: 'María López', email: 'maria@example.com' },
      { id: 'user_003', name: 'Carlos Ruiz', email: 'carlos@example.com' },
    ];
  }

  const { data } = await apiClient.get<any[]>('/auth/users');
  return data ?? [];
}
