import { z } from 'zod';

// ── Shared ────────────────────────────────────────────────────────────────────

export const ServiceAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  countryCode: z.string(),
});

export const AvailabilityPayloadSchema = z.object({
  isSupported: z.boolean(),
  area: ServiceAreaSchema.nullable().optional(),
});

export type ServiceArea = z.infer<typeof ServiceAreaSchema>;
export type AvailabilityPayload = z.infer<typeof AvailabilityPayloadSchema>;

// ── POST /api/discovery/availability ─────────────────────────────────────────

export const AvailabilityRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type AvailabilityRequest = z.infer<typeof AvailabilityRequestSchema>;

// ── POST /api/discovery/location ─────────────────────────────────────────────

export const UpdateLocationRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export const UpdateLocationResponseSchema = z.object({
  locationUpdated: z.boolean(),
  availability: AvailabilityPayloadSchema,
});
export type UpdateLocationRequest = z.infer<typeof UpdateLocationRequestSchema>;
export type UpdateLocationResponse = z.infer<
  typeof UpdateLocationResponseSchema
>;

// ── POST /api/discovery/profiles ─────────────────────────────────────────────

export const DiscoveryProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number(),
  gender: z.string(),
  bio: z.string().nullable().optional(),
  photos: z.array(z.string()),
  interests: z.array(z.string()),
  location: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .optional(),
});

export const AppliedFilterSchema = z.object({
  maxDistanceKm: z.number(),
  minAge: z.number(),
  maxAge: z.number(),
  basedOnMyAge: z.number(),
});

export const DiscoverProfilesRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const DiscoverProfilesResponseSchema = z.object({
  area: AvailabilityPayloadSchema,
  appliedFilter: AppliedFilterSchema.optional(),
  profiles: z.array(DiscoveryProfileSchema),
});

export type DiscoveryProfile = z.infer<typeof DiscoveryProfileSchema>;
export type AppliedFilter = z.infer<typeof AppliedFilterSchema>;
export type DiscoverProfilesRequest = z.infer<
  typeof DiscoverProfilesRequestSchema
>;
export type DiscoverProfilesResponse = z.infer<
  typeof DiscoverProfilesResponseSchema
>;

// ── POST /api/discovery/swipe ─────────────────────────────────────────────────

export const SwipeActionSchema = z.enum(['like', 'swipe']);
export const SwipeRequestSchema = z.object({
  toUserId: z.string(),
  action: SwipeActionSchema,
});
export const SwipeResponseSchema = z.object({
  swipe: z.any(),
  matched: z.boolean(),
  matchId: z.string().nullable(),
});
export type SwipeAction = z.infer<typeof SwipeActionSchema>;
export type SwipeRequest = z.infer<typeof SwipeRequestSchema>;
export type SwipeResponse = z.infer<typeof SwipeResponseSchema>;

// ── GET/PATCH /api/discovery/preferences ─────────────────────────────────────

export const DiscoveryPreferencesSchema = z.object({
  youngerAgeDelta: z.number().int().min(0).max(20),
  olderAgeDelta: z.number().int().min(0).max(20),
  maxDistanceKm: z.number().int().min(1).max(200),
});

export const PatchDiscoveryPreferencesSchema =
  DiscoveryPreferencesSchema.partial();

export const DiscoveryPreferencesResponseSchema = z.object({
  preferences: DiscoveryPreferencesSchema,
});

export type DiscoveryPreferences = z.infer<typeof DiscoveryPreferencesSchema>;
export type PatchDiscoveryPreferences = z.infer<
  typeof PatchDiscoveryPreferencesSchema
>;
export type DiscoveryPreferencesResponse = z.infer<
  typeof DiscoveryPreferencesResponseSchema
>;
