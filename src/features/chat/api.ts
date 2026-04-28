import { apiGet, apiPost } from '@/api/client'
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
    return CreateDirectConversationResponseSchema.parse(raw)
  },

  // REST: conversations list
  listConversations: async (limit = 20): Promise<ListConversationsResponse> => {
    const raw = await apiGet(ENDPOINTS.CHAT.CONVERSATIONS, { limit })
    return ListConversationsResponseSchema.parse(raw)
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

  // NOTE: sendMessage and markConversationRead removed.
  // Both handled exclusively via Socket.IO (message:send and message:read events).
}
