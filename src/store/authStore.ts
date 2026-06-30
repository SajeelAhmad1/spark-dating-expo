// src/store/authStore.ts
import { create } from 'zustand';
import { User } from '@/features/profile/schema';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: User | null;

  // Called once by AuthGate after reading SecureStore
  setAuthenticated: (token: string, user: User) => void;
  setUnauthenticated: () => void;

  // Called after login/Google sign-in to update in-memory state
  signIn: (token: string, user: User) => void;

  // Called after logout to clear in-memory state
  signOut: () => void;

  // Update stored user (e.g. after profile completion)
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  token: null,
  user: null,

  setAuthenticated: (token, user) =>
    set({ status: 'authenticated', token, user }),

  setUnauthenticated: () =>
    set({ status: 'unauthenticated', token: null, user: null }),

  signIn: (token, user) =>
    set({ status: 'authenticated', token, user }),

  signOut: () =>
    set({ status: 'unauthenticated', token: null, user: null }),

  setUser: (user) => set({ user }),
}));

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectIsAuthenticated = (s: AuthState) =>
  s.status === 'authenticated';
export const selectAuthStatus = (s: AuthState) => s.status;
export const selectUser = (s: AuthState) => s.user;
export const selectToken = (s: AuthState) => s.token;
