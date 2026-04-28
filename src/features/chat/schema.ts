import { z } from 'zod'

// ── Shared peer ───────────────────────────────────────────────────────────────

export const ChatPeerSchema = z.object({
  id:        z.string(),
  firstName: z.string().nullable(),
  lastName:  z.string().nullable(),
  photos:    z.array(z.string()),
})

export type ChatPeer = z.infer<typeof ChatPeerSchema>

// ── Conversation ──────────────────────────────────────────────────────────────

export const LastMessageSchema = z.object({
  id:              z.string(),
  type:            z.enum(['text', 'image', 'streak']),
  text:            z.string().nullable().optional(),
  media:           z.any().nullable().optional(),
  streakExpiresAt: z.string().nullable().optional(),
  createdAt:       z.string(),
})

export const ConversationItemSchema = z.object({
  conversationId: z.string(),
  type:           z.string(),
  otherUser:      ChatPeerSchema.nullable(),
  unreadCount:    z.number(),
  streakCount:    z.number().optional().default(0),
  chatStatus:     z.enum(['active', 'lockingSoon', 'locked']).optional().default('active'),
  lastMessage:    LastMessageSchema.nullable(),
  lastMessageAt:  z.string().nullable().optional(),
})

export const ListConversationsResponseSchema = z.object({
  items: z.array(ConversationItemSchema),
})

export const CreateDirectConversationResponseSchema = z.object({
  conversation: z.object({
    id:        z.string(),
    type:      z.string(),
    memberIds: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
})

export type ConversationItem                   = z.infer<typeof ConversationItemSchema>
export type LastMessage                        = z.infer<typeof LastMessageSchema>
export type ListConversationsResponse          = z.infer<typeof ListConversationsResponseSchema>
export type CreateDirectConversationResponse   = z.infer<typeof CreateDirectConversationResponseSchema>

// ── Messages ──────────────────────────────────────────────────────────────────

export const MessageMediaSchema = z.object({
  url:    z.string(),
  width:  z.number().optional(),
  height: z.number().optional(),
  mime:   z.string().optional(),
  size:   z.number().optional(),
})

export const ChatMessageSchema = z.object({
  id:              z.string(),
  conversationId:  z.string(),
  senderId:        z.string(),
  type:            z.enum(['text', 'image', 'streak']),
  text:            z.string().nullable().optional(),
  media:           MessageMediaSchema.nullable().optional(),
  streakExpiresAt: z.string().nullable().optional(),
  streakViewedBy:  z.array(z.string()).optional(),
  createdAt:       z.string(),
  updatedAt:       z.string(),
})

export const ListMessagesResponseSchema = z.object({
  items:      z.array(ChatMessageSchema),
  nextCursor: z.string().nullable(),
})

export type MessageMedia        = z.infer<typeof MessageMediaSchema>
export type ChatMessage         = z.infer<typeof ChatMessageSchema>
export type ListMessagesResponse = z.infer<typeof ListMessagesResponseSchema>

// ── Send Message ──────────────────────────────────────────────────────────────

export const SendMessageRequestSchema = z.object({
  type:   z.enum(['text', 'image', 'streak']),
  text:   z.string().trim().min(1).max(2000).optional(),
  media:  MessageMediaSchema.optional(),
  streak: z.object({ ttlSeconds: z.number().int().min(10) }).optional(),
})

export const SendMessageResponseSchema = z.object({
  message: ChatMessageSchema,
})

export type SendMessageRequest  = z.infer<typeof SendMessageRequestSchema>
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>

// ── Mark Read ─────────────────────────────────────────────────────────────────

export const MarkReadRequestSchema = z.object({
  lastReadMessageId: z.string(),
})

export type MarkReadRequest = z.infer<typeof MarkReadRequestSchema>