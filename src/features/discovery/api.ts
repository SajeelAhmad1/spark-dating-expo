import { apiGet, apiPatch, apiPost } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  AvailabilityPayload,
  AvailabilityPayloadSchema,
  AvailabilityRequest,
  DiscoverProfilesRequest,
  DiscoverProfilesResponse,
  DiscoverProfilesResponseSchema,
  DiscoveryPreferencesResponse,
  DiscoveryPreferencesResponseSchema,
  PatchDiscoveryPreferences,
  SwipeRequest,
  SwipeResponse,
  SwipeResponseSchema,
  UpdateLocationRequest,
  UpdateLocationResponse,
  UpdateLocationResponseSchema,
} from './schema';

export const discoveryApi = {
  checkAvailability: async (
    payload: AvailabilityRequest,
  ): Promise<AvailabilityPayload> => {
    const raw = await apiPost(ENDPOINTS.DISCOVERY.AVAILABILITY, payload);
    return AvailabilityPayloadSchema.parse(raw);
  },

  updateLocation: async (
    payload: UpdateLocationRequest,
  ): Promise<UpdateLocationResponse> => {
    const raw = await apiPost(ENDPOINTS.DISCOVERY.LOCATION, payload);
    return UpdateLocationResponseSchema.parse(raw);
  },

  discoverProfiles: async (
    payload: DiscoverProfilesRequest,
  ): Promise<DiscoverProfilesResponse> => {
    const raw = await apiPost(ENDPOINTS.DISCOVERY.PROFILES, payload);
    return DiscoverProfilesResponseSchema.parse(raw);
  },

  swipe: async (payload: SwipeRequest): Promise<SwipeResponse> => {
    const raw = await apiPost(ENDPOINTS.DISCOVERY.SWIPE, payload);
    return SwipeResponseSchema.parse(raw);
  },

  getPreferences: async (): Promise<DiscoveryPreferencesResponse> => {
    const raw = await apiGet(ENDPOINTS.DISCOVERY.PREFERENCES);
    return DiscoveryPreferencesResponseSchema.parse(raw);
  },

  patchPreferences: async (
    payload: PatchDiscoveryPreferences,
  ): Promise<DiscoveryPreferencesResponse> => {
    const raw = await apiPatch(ENDPOINTS.DISCOVERY.PREFERENCES, payload);
    return DiscoveryPreferencesResponseSchema.parse(raw);
  },
};
