// src/features/interests/api.ts
import { apiGet } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Interest } from './schema';

// ─── Envelope shape from backend ─────────────────────────────────────────────
// GET /api/interests returns:
//   { status: 'success', data: { interests: [...] } }
//
// The axios interceptor unwraps one level of .data, so apiGet receives:
//   { interests: [...] }
//
// We extract the array here so every consumer gets Interest[] directly.

export const interestsApi = {
  getCatalog: async (): Promise<Interest[]> => {
    const raw = await apiGet<{ interests: Interest[] }>(
      ENDPOINTS.INTERESTS.CATALOG,
    );

    // Handle both possible shapes in case the interceptor behaviour changes
    if (Array.isArray(raw)) return raw;
    if (raw?.interests && Array.isArray(raw.interests)) return raw.interests;
    return [];
  },
};