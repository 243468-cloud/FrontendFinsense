// FinSense — Auth Service (SOA)
import apiClient from '@/lib/apiClient';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import type { LoginDTO, RegisterDTO, AuthResponse } from '@/types/auth.types';
import { MOCK_USER } from '@/lib/mockData';

const USE_MOCK = true; // Set to false when API is ready

export async function login(credentials: LoginDTO): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000)); // Simulate latency
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

  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return data;
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

  const { data } = await apiClient.post<AuthResponse>('/auth/register', registerData);
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
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
  return data.accessToken;
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
