export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REGISTER_START_PHONE: '/api/auth/signup/start',
    VERIFY_OTP_PHONE: '/api/auth/signup/verify-otp',
    SET_PASSWORD: '/api/auth/signup/set-password',
  },
  USER: {
    // correct it, this is dummy
    PROFILE: '/user/profile',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
} as const;


export const queryKeys = {
  // correct these all, this is dummy
  auth: {
    all: () => ['auth'] as const,
    session: () => ['auth', 'session'] as const,
  },
  user: {
    all: () => ['user'] as const,
    profile: () => ['user', 'profile'] as const,
    detail: (id: string) => ['user', id] as const,
  },
} as const;
