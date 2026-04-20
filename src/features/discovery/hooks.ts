import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discoveryApi } from './api';
import { queryKeys } from '@/api/endpoints';
import { showToast } from '@/utils/toast';
import type {
  AvailabilityRequest,
  DiscoverProfilesRequest,
  DiscoveryProfile,
  PatchDiscoveryPreferences,
  SwipeRequest,
  UpdateLocationRequest,
} from './schema';

export const useCheckAvailability = () =>
  useMutation({
    mutationFn: (payload: AvailabilityRequest) =>
      discoveryApi.checkAvailability(payload),
  });

export const useUpdateLocation = () =>
  useMutation({
    mutationFn: (payload: UpdateLocationRequest) =>
      discoveryApi.updateLocation(payload),
  });

export const useDiscoverProfiles = (payload: DiscoverProfilesRequest | null) =>
  useQuery({
    queryKey: [...queryKeys.discovery.profiles(), payload],
    queryFn: () => discoveryApi.discoverProfiles(payload!),
    enabled: !!payload,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

export const useSwipe = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SwipeRequest) => discoveryApi.swipe(payload),

    onMutate: async ({ toUserId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.discovery.profiles() });
      const previousData = qc.getQueriesData<{ profiles: DiscoveryProfile[] }>({
        queryKey: queryKeys.discovery.profiles(),
      });
      qc.setQueriesData<any>(
        { queryKey: queryKeys.discovery.profiles() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            profiles:
              old.profiles?.filter(
                (p: DiscoveryProfile) => p.id !== toUserId,
              ) ?? [],
          };
        },
      );
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      context?.previousData?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.discovery.profiles() });
    },
  });
};

// ── Preferences ───────────────────────────────────────────────────────────────

export const useDiscoveryPreferences = () =>
  useQuery({
    queryKey: queryKeys.discovery.preferences(),
    queryFn: discoveryApi.getPreferences,
    staleTime: 1000 * 60 * 10,
    select: (res) => res.preferences,
  });

export const usePatchDiscoveryPreferences = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatchDiscoveryPreferences) =>
      discoveryApi.patchPreferences(payload),

    onSuccess: (data) => {
      qc.setQueryData(queryKeys.discovery.preferences(), data);
      qc.invalidateQueries({ queryKey: queryKeys.discovery.profiles() });
      showToast({ text1: 'Preferences saved' });
    },

    onError: (err: any) => {
      showToast({
        text1: 'Failed to save preferences',
        text2: err?.message,
      });
    },
  });
};
