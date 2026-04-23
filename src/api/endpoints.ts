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
  USERS: {
    GET_BY_ID: '/api/users/get',
  },
  INTERESTS: {
    CATALOG: '/api/interests',
  },
  DISCOVERY: {
    AVAILABILITY:  '/api/discovery/availability',
    LOCATION:      '/api/discovery/location',
    PROFILES:      '/api/discovery/profiles',
    SWIPE:         '/api/discovery/swipe',
    PREFERENCES:   '/api/discovery/preferences',
  },
  SOCIAL: {
    BLOCKS:                    '/api/blocks',
    CONNECTION_REQUESTS:       '/api/connection-requests',
    CONNECTION_REQUEST_ACCEPT: (id: string) => `/api/connection-requests/${id}/accept`,
    CONNECTION_REQUEST_REJECT: (id: string) => `/api/connection-requests/${id}/reject`,
  },
  CHAT: {
    CREATE_DIRECT: '/api/chat/conversations/direct',
    CONVERSATIONS: '/api/chat/conversations',
    MESSAGES:      (conversationId: string) => `/api/chat/conversations/${conversationId}/messages`,
    MARK_READ:     (conversationId: string) => `/api/chat/conversations/${conversationId}/read`,
  },
  NOTIFICATIONS: {
    REGISTER_FCM: '/api/me/fcm-token',
    PREFERENCES:  '/api/me/notification-preferences',
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
  users: {
    detail: (id: string) => ['users', id] as const,
  },
  interests: {
    all: () => ['interests'] as const,
  },
  discovery: {
    all:          () => ['discovery']                 as const,
    availability: () => ['discovery', 'availability'] as const,
    profiles:     () => ['discovery', 'profiles']     as const,
    preferences:  () => ['discovery', 'preferences']  as const,
  },
  social: {
    all:                () => ['social']                                 as const,
    blocks:             () => ['social', 'blocks']                       as const,
    connectionRequests: (dir: 'received' | 'sent') =>
                          ['social', 'connection-requests', dir]         as const,
  },
  chat: {
    all:           () => ['chat']                                        as const,
    conversations: () => ['chat', 'conversations']                       as const,
    messages:      (id: string) => ['chat', 'messages', id]              as const,
  },
} as const