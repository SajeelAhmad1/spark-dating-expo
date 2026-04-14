export const ENDPOINTS = {
  AUTH: {
    SIGNUP_START:      '/api/auth/signup/start',
    SIGNUP_VERIFY_OTP: '/api/auth/signup/verify-otp',
    SIGNUP_COMPLETE:   '/api/auth/signup/complete',
    SET_PASSWORD:      '/api/auth/signup/set-password',
    LOGIN:             '/api/auth/login',
    LOGIN_START:       '/api/auth/login/start',
    LOGIN_VERIFY_OTP:  '/api/auth/login/verify-otp',
    LOGIN_WITH_GOOGLE: '/api/auth/google/verify',
    REFRESH:           '/api/auth/refresh',
    LOGOUT:            '/api/auth/logout',
  },

  USER: {
    ME:               '/api/me',
    PROFILE_COMPLETE: '/api/profile/complete',
    PROFILE_EDIT:     '/api/profile/edit',
    DELETE:           (id: string) => `/api/users/${id}`,
  },

  INTERESTS: {
    CATALOG: '/api/interests',
  },

  DISCOVERY: {
    AVAILABILITY: '/api/discovery/availability',
    LOCATION:     '/api/discovery/location',
    PROFILES:     '/api/discovery/profiles',
    SWIPE:        '/api/discovery/swipe',
  },
} as const

export const queryKeys = {
  auth: {
    all:     () => ['auth']            as const,
    session: () => ['auth', 'session'] as const,
  },
  user: {
    all:     () => ['user']            as const,
    me:      () => ['user', 'me']      as const,
    profile: () => ['user', 'profile'] as const,
    detail:  (id: string) => ['user', id] as const,
  },
  interests: {
    all: () => ['interests'] as const,
  },
  discovery: {
    all:          () => ['discovery']                 as const,
    availability: () => ['discovery', 'availability'] as const,
    profiles:     () => ['discovery', 'profiles']     as const,
  },
} as const