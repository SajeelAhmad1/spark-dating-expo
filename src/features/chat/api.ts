import { apiGet, apiPost, apiPatch } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import {
  CreateDirectConversationResponse,
  CreateDirectConversationResponseSchema,
  ListConversationsResponse,
  ListConversationsResponseSchema,
  ListMessagesResponse,
  ListMessagesResponseSchema,
} from './schema'

export const chatApi = {
  // REST: create conversation
  createDirectConversation: async (
    userId: string,
  ): Promise<CreateDirectConversationResponse> => {
    const raw = await apiPost(ENDPOINTS.CHAT.CREATE_DIRECT, { userId })
    const parsed = CreateDirectConversationResponseSchema.safeParse(raw)
    if (!parsed.success) {
      console.error('[chat] create conversation parse error:', parsed.error.flatten())
      throw new Error('Invalid create conversation response')
    }
    return parsed.data
  },

  // REST: conversations list
  listConversations: async (limit = 20): Promise<ListConversationsResponse> => {
    const raw = await apiGet(ENDPOINTS.CHAT.CONVERSATIONS, { limit })
    const parsed = ListConversationsResponseSchema.safeParse(raw)
    if (!parsed.success) {
      console.error('[chat] conversations parse error:', parsed.error.flatten())
      throw new Error('Invalid conversations response')
    }
    return parsed.data
  },

  // REST: message history (paginated)
  listMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 30,
  ): Promise<ListMessagesResponse> => {
    const params: Record<string, unknown> = { limit }
    if (cursor) params.cursor = cursor
    const raw = await apiGet(ENDPOINTS.CHAT.MESSAGES(conversationId), params)
    return ListMessagesResponseSchema.parse(raw)
  },

  // REST: mark snap viewed (one-time view enforcement)
  markSnapViewed: async (conversationId: string, messageId: string): Promise<void> => {
    await apiPatch(ENDPOINTS.CHAT.MARK_SNAP_VIEWED(conversationId, messageId), {})
  },

  // NOTE: sendMessage and markConversationRead removed.
  // Both handled exclusively via Socket.IO (message:send and message:read events).
}
