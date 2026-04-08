import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { HttpError } from './errors';
import { ApiResponse } from './types';

// ── Token helpers ──────────────────────────────────────────────────────────

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const;

export const tokenStore = {
  getAccess: () => SecureStore.getItemAsync(TOKEN_KEYS.ACCESS),
  setAccess: (t: string) => SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, t),
  getRefresh: () => SecureStore.getItemAsync(TOKEN_KEYS.REFRESH),
  setRefresh: (t: string) => SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, t),
  clearAll: () =>
    Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH),
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

apiClient.interceptors.response.use(
  // Unwrap `res.data.data` so callers get the payload directly
  (res: AxiosResponse<ApiResponse<unknown>>) => res.data.data as any,

  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const code = body?.code ?? 'UNKNOWN_ERROR';
    const message = body?.message ?? error.message;

    if (status === 401) {
      const refreshed = await attemptSilentRefresh();
      if (refreshed && error.config) return apiClient.request(error.config);
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

      const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        { refreshToken },
      );
      await tokenStore.setAccess(data.data.accessToken);
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
