// FinSense — Axios API Client with JWT interceptors
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT, TOKEN_KEY, REFRESH_TOKEN_KEY } from './constants';

// ─── Create Axios instance ───
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ───
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 + refresh token ───
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem(REFRESH_TOKEN_KEY)
          : null;

      if (!refreshToken) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = response.data as { accessToken: string };
        localStorage.setItem(TOKEN_KEY, accessToken);
        processQueue(null, accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = '/auth';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
