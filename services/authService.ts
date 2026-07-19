// FinSense — Auth Service
import apiClient from '@/lib/apiClient';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import type { LoginDTO, RegisterDTO, AuthResponse, User } from '@/types/auth.types';

// ─── Cookie helpers (for Next.js middleware auth guard) ───
export function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${TOKEN_KEY}=${token}; path=/; expires=${expires}; SameSite=Lax${secure}`;
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
}

function persistTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setAuthCookie(accessToken);
}

export async function login(credentials: LoginDTO): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  persistTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function register(registerData: RegisterDTO): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', registerData);
  persistTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function refreshToken(): Promise<string> {
  const refresh =
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  if (!refresh) throw new Error('No refresh token');

  const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken: refresh,
  });
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  setAuthCookie(data.accessToken);
  return data.accessToken;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    clearAuthCookie();
  }
}

export function getStoredToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export async function getUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
  const { data } = await apiClient.get<any[]>('/auth/users');
  return data ?? [];
}
