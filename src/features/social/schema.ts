import { z } from 'zod';

// ── Block ─────────────────────────────────────────────────────────────────────

export const BlockUserRequestSchema = z.object({
  blockedUserId: z.string(),
});

export const BlockedUserSchema = z.object({
  blockedAt: z.string(),
  user: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    photos: z.array(z.string()),
  }),
});

export const ListBlockedUsersResponseSchema = z.object({
  users: z.array(BlockedUserSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type BlockUserRequest = z.infer<typeof BlockUserRequestSchema>;
export type BlockedUser = z.infer<typeof BlockedUserSchema>;
export type ListBlockedUsersResponse = z.infer<
  typeof ListBlockedUsersResponseSchema
>;

// ── Connection Requests ───────────────────────────────────────────────────────

export const ConnectionRequestStatusSchema = z.enum([
  'pending',
  'accepted',
  'declined',
  'cancelled',
]);

export const ConnectionRequestPeerSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  photos: z.array(z.string()),
});

export const ConnectionRequestSchema = z.object({
  id: z.string(),
  status: ConnectionRequestStatusSchema,
  direction: z.enum(['sent', 'received']),
  createdAt: z.string(),
  updatedAt: z.string(),
  peer: ConnectionRequestPeerSchema,
});

export const SendConnectionRequestSchema = z.object({
  toUserId: z.string(),
});

export const ConnectionRequestResponseSchema = z.object({
  request: z.object({
    id: z.string(),
    fromUserId: z.string(),
    toUserId: z.string(),
    status: ConnectionRequestStatusSchema,
    createdAt: z.string(),
  }),
});

export const AcceptRejectResponseSchema = z.object({
  request: z.object({
    id: z.string(),
    status: ConnectionRequestStatusSchema,
    fromUserId: z.string(),
    toUserId: z.string(),
  }),
  matchId: z.string().optional(),
});

export const ListConnectionRequestsResponseSchema = z.object({
  requests: z.array(ConnectionRequestSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type ConnectionRequestStatus = z.infer<
  typeof ConnectionRequestStatusSchema
>;
export type ConnectionRequestPeer = z.infer<typeof ConnectionRequestPeerSchema>;
export type ConnectionRequest = z.infer<typeof ConnectionRequestSchema>;
export type SendConnectionRequest = z.infer<typeof SendConnectionRequestSchema>;
export type ConnectionRequestResponse = z.infer<
  typeof ConnectionRequestResponseSchema
>;
export type AcceptRejectResponse = z.infer<typeof AcceptRejectResponseSchema>;
export type ListConnectionRequestsResponse = z.infer<
  typeof ListConnectionRequestsResponseSchema
>;
