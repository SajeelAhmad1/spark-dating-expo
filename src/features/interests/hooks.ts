// src/features/interests/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { interestsApi } from './api';
import { queryKeys } from '@/api/endpoints';
import type { Interest } from './schema';

/**
 * Fetches the interests catalog (Interest[]) from the backend.
 *
 * The axios interceptor already unwraps the envelope, so queryFn
 * receives Interest[] directly — no select transform needed.
 *
 * staleTime: Infinity — catalog doesn't change during a session.
 * gcTime: 24h        — survives navigation away and back.
 */
export const useInterestsCatalog = () => {
  return useQuery<Interest[], Error>({
    queryKey: queryKeys.interests.all(),
    queryFn:  () => interestsApi.getCatalog(),
    staleTime: Infinity,
    gcTime:    24 * 60 * 60 * 1000,
  });
};