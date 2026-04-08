// src/api/endpoints.ts
export const ENDPOINTS = {
  AUTH: {
    // Signup (3-step OTP flow)
    SIGNUP_START: '/api/auth/signup/start',
    SIGNUP_VERIFY_OTP: '/api/auth/signup/verify-otp',
    SIGNUP_COMPLETE: '/api/auth/signup/complete',
    SET_PASSWORD: '/api/auth/signup/set-password',

    // Login (2-step OTP flow)
    LOGIN: '/api/auth/login',
    LOGIN_START: '/api/auth/login/start',
    LOGIN_VERIFY_OTP: '/api/auth/login/verify-otp',

    // Token management
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',

    // Catalog
    INTERESTS_CATALOG: '/api/auth/interests',
  },
  USER: {
    PROFILE: '/api/users/me',
    PROFILE_COMPLETE: '/api/profile/complete',
    BY_ID: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
} as const;

export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
    session: () => ['auth', 'session'] as const,
  },
  user: {
    all: () => ['user'] as const,
    profile: () => ['user', 'profile'] as const,
    detail: (id: string) => ['user', id] as const,
  },
  interests: {
    all: () => ['interests'] as const,
  },
} as const;
