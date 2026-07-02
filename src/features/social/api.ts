import { apiGet, apiPost } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  AcceptRejectResponse,
  AcceptRejectResponseSchema,
  BlockUserRequest,
  ConnectionRequestResponse,
  ConnectionRequestResponseSchema,
  ListBlockedUsersResponse,
  ListBlockedUsersResponseSchema,
  ListConnectionRequestsResponse,
  ListConnectionRequestsResponseSchema,
  SendConnectionRequest,
} from './schema';

export const socialApi = {
  // ── Blocks ─────────────────────────────────────────────────────────────────

  blockUser: async (
    payload: BlockUserRequest,
  ): Promise<{ blocked: boolean }> => {
    const raw = await apiPost(ENDPOINTS.SOCIAL.BLOCKS, payload);
    return raw as { blocked: boolean };
  },

  listBlockedUsers: async (page = 1): Promise<ListBlockedUsersResponse> => {
    const raw = await apiGet(ENDPOINTS.SOCIAL.BLOCKS, { page });
    return ListBlockedUsersResponseSchema.parse(raw);
  },

  // ── Connection Requests ────────────────────────────────────────────────────

  sendConnectionRequest: async (
    payload: SendConnectionRequest,
  ): Promise<ConnectionRequestResponse> => {
    const raw = await apiPost(ENDPOINTS.SOCIAL.CONNECTION_REQUESTS, payload);
    return ConnectionRequestResponseSchema.parse(raw);
  },

  listConnectionRequests: async (
    direction: 'received' | 'sent',
    page = 1,
  ): Promise<ListConnectionRequestsResponse> => {
    const raw = await apiGet(ENDPOINTS.SOCIAL.CONNECTION_REQUESTS, {
      direction,
      page,
    });
    return ListConnectionRequestsResponseSchema.parse(raw);
  },

  acceptConnectionRequest: async (
    requestId: string,
  ): Promise<AcceptRejectResponse> => {
    const raw = await apiPost(
      ENDPOINTS.SOCIAL.CONNECTION_REQUEST_ACCEPT(requestId),
    );
    return AcceptRejectResponseSchema.parse(raw);
  },

  rejectConnectionRequest: async (
    requestId: string,
  ): Promise<AcceptRejectResponse> => {
    const raw = await apiPost(
      ENDPOINTS.SOCIAL.CONNECTION_REQUEST_REJECT(requestId),
    );
    return AcceptRejectResponseSchema.parse(raw);
  },
};
