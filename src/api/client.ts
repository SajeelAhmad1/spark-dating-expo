// src/api/client.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { HttpError } from './errors';
import { ApiResponse } from './types';
import { UserProfileSchema } from '@/features/auth/schema';

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER: 'user_data',
} as const;

export const tokenStore = {
  getAccess: (): Promise<string | null> =>
    SecureStore.getItemAsync(TOKEN_KEYS.ACCESS),
  setAccess: (token: string): Promise<void> =>
    SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, token),
  getRefresh: (): Promise<string | null> =>
    SecureStore.getItemAsync(TOKEN_KEYS.REFRESH),
  setRefresh: (token: string): Promise<void> =>
    SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, token),

  getUser: async (): Promise<UserProfileSchema | null> => {
    const data = await SecureStore.getItemAsync(TOKEN_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: UserProfileSchema): Promise<void> =>
    SecureStore.setItemAsync(TOKEN_KEYS.USER, JSON.stringify(user)),

  clearAll: (): Promise<[void, void, void]> =>
    Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH),
      SecureStore.deleteItemAsync(TOKEN_KEYS.USER),
    ]),
};

// ── Axios instance ─────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://api.example.com',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach access token ───────────────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStore.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
);

// ── Response: unwrap envelope + normalize errors ───────────────────────────

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (res: AxiosResponse<ApiResponse<unknown>>) => res.data.data as any,

  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const code = body?.code ?? 'UNKNOWN_ERROR';
    const message = body?.message ?? error.message;

    if (status === 401) {
      const config = error.config as RetryableConfig | undefined;

      // Only attempt refresh once — prevents infinite 401 loop
      if (config && !config._retried) {
        const refreshed = await attemptSilentRefresh();
        if (refreshed) {
          config._retried = true;
          return apiClient.request(config);
        }
      }

      await tokenStore.clearAll();
      // Emit a global event for your auth store / navigation to handle
    }

    return Promise.reject(new HttpError(status, code, message, body));
  },
);

// ── Silent token refresh (deduplicated) ────────────────────────────────────

let _refreshPromise: Promise<boolean> | null = null;

async function attemptSilentRefresh(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStore.getRefresh();
      if (!refreshToken) return false;

      const { data } = await axios.post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >(`${apiClient.defaults.baseURL}/api/auth/refresh`, { refreshToken });

      await tokenStore.setAccess(data.data.accessToken);
      await tokenStore.setRefresh(data.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Typed request wrappers ─────────────────────────────────────────────────

export const apiGet = <T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> => apiClient.get(url, { params });

export const apiPost = <T>(url: string, body?: unknown): Promise<T> =>
  apiClient.post(url, body);

export const apiPut = <T>(url: string, body?: unknown): Promise<T> =>
  apiClient.put(url, body);

export const apiDel = <T>(url: string): Promise<T> => apiClient.delete(url);
