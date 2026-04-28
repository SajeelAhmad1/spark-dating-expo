import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discoveryApi } from './api';
import { queryKeys } from '@/api/endpoints';
import { showToast } from '@/utils/toast';
import type {
  AvailabilityRequest,
  DiscoverProfilesResponse,
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
  useInfiniteQuery({
    queryKey: [...queryKeys.discovery.profiles(), payload],
    queryFn: ({ pageParam }) =>
      discoveryApi.discoverProfiles({
        ...payload!,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!payload,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    select: (data) => {
      const profilesMap = new Map<string, DiscoveryProfile>();
      for (const page of data.pages) {
        for (const profile of page.profiles) {
          if (!profilesMap.has(profile.id)) {
            profilesMap.set(profile.id, profile);
          }
        }
      }

      const latestPage = data.pages[data.pages.length - 1];

      return {
        ...data,
        profiles: Array.from(profilesMap.values()),
        appliedFilter: latestPage?.appliedFilter ?? data.pages[0]?.appliedFilter ?? null,
        area: latestPage?.area ?? data.pages[0]?.area,
        nextCursor: latestPage?.nextCursor ?? null,
      };
    },
  });

export const useSwipe = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SwipeRequest) => discoveryApi.swipe(payload),

    onMutate: async ({ toUserId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.discovery.profiles() });
      qc.setQueriesData<any>(
        { queryKey: queryKeys.discovery.profiles() },
        (old: any) => {
          if (!old) return old;

          if (Array.isArray(old.pages)) {
            return {
              ...old,
              pages: old.pages.map((page: DiscoverProfilesResponse) => ({
                ...page,
                profiles: page.profiles.filter(
                  (p: DiscoveryProfile) => p.id !== toUserId,
                ),
              })),
            };
          }

          return {
            ...old,
            profiles:
              old.profiles?.filter(
                (p: DiscoveryProfile) => p.id !== toUserId,
              ) ?? [],
          };
        },
      );
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
