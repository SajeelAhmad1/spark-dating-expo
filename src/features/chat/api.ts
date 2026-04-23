import { apiGet, apiPost } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import {
  ChatMessage,
  ChatMessageSchema,
  CreateDirectConversationResponse,
  CreateDirectConversationResponseSchema,
  ListConversationsResponse,
  ListConversationsResponseSchema,
  ListMessagesResponse,
  ListMessagesResponseSchema,
  MarkReadRequest,
  SendMessageRequest,
  SendMessageResponse,
  SendMessageResponseSchema,
} from './schema'

export const chatApi = {
  // ── Conversations ─────────────────────────────────────────────────────────

  createDirectConversation: async (
    userId: string,
  ): Promise<CreateDirectConversationResponse> => {
    const raw = await apiPost(ENDPOINTS.CHAT.CREATE_DIRECT, { userId })
    return CreateDirectConversationResponseSchema.parse(raw)
  },

  listConversations: async (limit = 20): Promise<ListConversationsResponse> => {
    const raw = await apiGet(ENDPOINTS.CHAT.CONVERSATIONS, { limit })
    return ListConversationsResponseSchema.parse(raw)
  },

  // ── Messages ──────────────────────────────────────────────────────────────

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

  sendMessage: async (
    conversationId: string,
    payload: SendMessageRequest,
  ): Promise<SendMessageResponse> => {
    const raw = await apiPost(ENDPOINTS.CHAT.MESSAGES(conversationId), payload)
    return SendMessageResponseSchema.parse(raw)
  },

  markConversationRead: async (
    conversationId: string,
    payload: MarkReadRequest,
  ): Promise<void> => {
    await apiPost(ENDPOINTS.CHAT.MARK_READ(conversationId), payload)
  },
}