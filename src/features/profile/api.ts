// src/features/profile/api.ts
import { apiGet, apiPost, apiPatch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { CompleteProfileDto, EditProfileDto, User } from './schema';

// ─── NOTE ON ENVELOPE UNWRAPPING ──────────────────────────────────────────────
// The axios interceptor in client.ts already does `return res.data.data`.
// So by the time data reaches these functions, the outer { status, data }
// envelope is already stripped. What arrives is the raw inner payload:
//
//   GET  /api/me           → { user: User }
//   POST /profile/complete → { user: User, next?: string }
//   PATCH /profile/edit    → { user: User }
//   GET  /api/interests    → Interest[]   (backend sends array directly in data)

export const profileApi = {
  /**
   * POST /api/profile/complete  (protected)
   * Interceptor unwraps to: { user, next? }
   */
  completeProfile: (payload: CompleteProfileDto): Promise<{ user: User; next?: string }> =>
    apiPost(ENDPOINTS.USER.PROFILE_COMPLETE, payload),

  /**
   * PATCH /api/profile/edit  (protected)
   * Interceptor unwraps to: { user }
   */
  editProfile: (payload: EditProfileDto): Promise<{ user: User }> =>
    apiPatch(ENDPOINTS.USER.PROFILE_EDIT, payload),

  /**
   * GET /api/me  (protected)
   * Interceptor unwraps to: { user }
   */
  getMe: (): Promise<{ user: User }> =>
    apiGet(ENDPOINTS.USER.ME),
};