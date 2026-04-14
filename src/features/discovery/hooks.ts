import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { discoveryApi } from './api'
import { queryKeys } from '@/api/endpoints'
import type {
  AvailabilityRequest,
  DiscoverProfilesRequest,
  DiscoveryProfile,
  SwipeRequest,
  UpdateLocationRequest,
} from './schema'

// ── Availability ──────────────────────────────────────────────────────────────

export const useCheckAvailability = () =>
  useMutation({
    mutationFn: (payload: AvailabilityRequest) =>
      discoveryApi.checkAvailability(payload),
  })

// ── Location ──────────────────────────────────────────────────────────────────

export const useUpdateLocation = () =>
  useMutation({
    mutationFn: (payload: UpdateLocationRequest) =>
      discoveryApi.updateLocation(payload),
  })

// ── Discover Profiles ─────────────────────────────────────────────────────────

export const useDiscoverProfiles = (
  payload: DiscoverProfilesRequest | null,
) => {
  return useQuery({
    queryKey: [...queryKeys.discovery.profiles(), payload],
    queryFn:  () => discoveryApi.discoverProfiles(payload!),
    enabled:  !!payload,
    staleTime: 1000 * 60 * 2, // 2 min — profiles change as others swipe
    gcTime:    1000 * 60 * 5,
  })
}

// ── Swipe ─────────────────────────────────────────────────────────────────────

export const useSwipe = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: SwipeRequest) => discoveryApi.swipe(payload),

    // Remove the swiped profile from the local cache optimistically
    onMutate: async ({ toUserId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.discovery.profiles() })

      const previousData = qc.getQueriesData<{ profiles: DiscoveryProfile[] }>({
        queryKey: queryKeys.discovery.profiles(),
      })

      qc.setQueriesData<any>(
        { queryKey: queryKeys.discovery.profiles() },
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            profiles: old.profiles?.filter((p: DiscoveryProfile) => p.id !== toUserId) ?? [],
          }
        },
      )

      return { previousData }
    },

    onError: (_err, _vars, context) => {
      // Rollback on error
      context?.previousData?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data)
      })
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.discovery.profiles() })
    },
  })
}