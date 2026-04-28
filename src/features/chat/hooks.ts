import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useCallback, useRef, useState } from 'react'
import { chatApi } from './api'
import { queryKeys } from '@/api/endpoints'
import { showToast } from '@/utils/toast'
import {
  connectSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  markConversationRead,
  emitTyping,
  emitStopTyping,
  getSocket,
  type SocketMessagePayload,
} from '@/services/socket'
import type { ChatMessage, ConversationItem } from './schema'

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortByCreatedAt(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

function dedupeMessages(messages: ChatMessage[]): ChatMessage[] {
  const seen = new Map<string, ChatMessage>()
  for (const m of messages) seen.set(m.id, m)
  return Array.from(seen.values())
}

// ── Create direct conversation ────────────────────────────────────────────────

export const useCreateDirectConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => chatApi.createDirectConversation(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.conversations() }),
    onError: (err: any) => showToast({ text1: 'Could not open chat', text2: err?.message }),
  })
}

// ── List conversations (REST) ─────────────────────────────────────────────────

export const useConversations = (limit = 20) =>
  useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: () => chatApi.listConversations(limit),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    select: (res) => res.items,
  })

// ── List messages (REST, paginated history) ───────────────────────────────────

export const useMessages = (conversationId: string | null) =>
  useInfiniteQuery({
    queryKey: queryKeys.chat.messages(conversationId ?? ''),
    queryFn: ({ pageParam }) =>
      chatApi.listMessages(conversationId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 1000 * 15,
    select: (data) => {
      const all = data.pages.flatMap((p) => p.items)
      return {
        pages: data.pages,
        messages: sortByCreatedAt(dedupeMessages(all))
      }
    },
  })

// ── Real-time socket for a conversation ───────────────────────────────────────

export function useConversationSocket(conversationId: string | null) {
  const qc = useQueryClient()

  const injectMessage = useCallback((rawMsg: any) => {
    const msg = rawMsg as ChatMessage
    const convId = msg.conversationId

    // Update messages cache — dedupe + sort
    qc.setQueryData<any>(queryKeys.chat.messages(convId), (old: any) => {
      if (!old) return old
      const pages = old.pages as any[]
      const allIds = new Set(pages.flatMap((p: any) => p.items.map((m: any) => m.id)))
      if (allIds.has(msg.id)) return old // already present — skip

      const newPages = [...pages]
      const last = { ...newPages[newPages.length - 1] }
      // Remove matching optimistic placeholder (same sender, optimistic id)
      last.items = [
        ...last.items.filter(
          (m: any) => !m.id.startsWith('optimistic-') || m.senderId !== msg.senderId
        ),
        msg,
      ]
      newPages[newPages.length - 1] = last
      return { ...old, pages: newPages }
    })

    // Bump conversations list lastMessage
    qc.setQueryData<any>(queryKeys.chat.conversations(), (old: any) => {
      if (!old) return old
      return {
        ...old,
        items: (old.items as ConversationItem[]).map((item) =>
          item.conversationId === convId
            ? {
                ...item,
                lastMessage: {
                  id: msg.id,
                  type: msg.type,
                  text: msg.text ?? null,
                  media: msg.media ?? null,
                  createdAt: msg.createdAt,
                },
                lastMessageAt: msg.createdAt,
              }
            : item
        ),
      }
    })
  }, [qc])

  useEffect(() => {
    if (!conversationId) return
    let cancelled = false

    const onMessageNew = (payload: { conversationId: string; message: ChatMessage }) => {
      if (payload.conversationId === conversationId) {
        injectMessage(payload.message)
      }
    }

    // Handle read receipts from other members
    const onMessageRead = (payload: { conversationId: string; messageId: string; userIds: string[] }) => {
      if (payload.conversationId !== conversationId) return
      qc.setQueryData<any>(queryKeys.chat.conversations(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: (old.items as ConversationItem[]).map((item) =>
            item.conversationId === conversationId
              ? { ...item, unreadCount: 0 }
              : item
          ),
        }
      })
    }

    const setup = async () => {
      const sock = await connectSocket()
      if (cancelled) return
      await joinConversation(conversationId)
      sock.on('message:new', onMessageNew)
      sock.on('message:read', onMessageRead)
    }

    setup()

    return () => {
      cancelled = true
      leaveConversation(conversationId)
      const sock = getSocket()
      if (sock) {
        sock.off('message:new', onMessageNew)
        sock.off('message:read', onMessageRead)
      }
    }
  }, [conversationId, injectMessage, qc])
}

// ── Send message (socket-only, no REST fallback) ──────────────────────────────

export type SendPayload =
  | { type: 'text'; text: string }
  | { type: 'image'; media: { url: string; mime?: string } }
  | { type: 'streak'; media: { url: string; mime?: string }; streak: { ttlSeconds: number } }

export const useSendMessage = (conversationId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SendPayload) => {
      const socketPayload = { conversationId, ...payload } as SocketMessagePayload
      const res = await sendSocketMessage(socketPayload)
      if (!res.ok || !res.data?.message) {
        throw new Error(res.error ?? 'Failed to send message')
      }
      return res.data.message as ChatMessage
    },

    onMutate: async (payload) => {
      const key = queryKeys.chat.messages(conversationId)
      await qc.cancelQueries({ queryKey: key })

      const optimisticId = `optimistic-${Date.now()}`
      const optimistic: ChatMessage = {
        id: optimisticId,
        conversationId,
        senderId: '__me__',
        type: payload.type,
        text: payload.type === 'text' ? payload.text : null,
        media: payload.type !== 'text' ? (payload as any).media : null,
        streakExpiresAt: null,
        streakViewedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      qc.setQueryData<any>(key, (old: any) => {
        if (!old) return old
        const pages = [...old.pages]
        const last = { ...pages[pages.length - 1] }
        last.items = [...last.items, optimistic]
        pages[pages.length - 1] = last
        return { ...old, pages }
      })

      return { optimisticId }
    },

    onSuccess: (realMsg, _vars, context) => {
      // Replace optimistic with real message from server
      qc.setQueryData<any>(queryKeys.chat.messages(conversationId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((m: ChatMessage) =>
              m.id === context?.optimisticId ? realMsg : m
            ),
          })),
        }
      })
      qc.invalidateQueries({ queryKey: queryKeys.chat.conversations() })
    },

    onError: (_err, _vars, context) => {
      // Rollback optimistic message
      qc.setQueryData<any>(queryKeys.chat.messages(conversationId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.filter((m: ChatMessage) => m.id !== context?.optimisticId),
          })),
        }
      })
      showToast({ text1: 'Failed to send message' })
    },
  })
}

// ── Mark read (socket-only) ───────────────────────────────────────────────────

export const useMarkRead = (conversationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lastReadMessageId: string) =>
      markConversationRead(conversationId, lastReadMessageId),
    onSuccess: () => {
      qc.setQueryData<any>(queryKeys.chat.conversations(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: (old.items as ConversationItem[]).map((item) =>
            item.conversationId === conversationId
              ? { ...item, unreadCount: 0 }
              : item
          ),
        }
      })
    },
  })
}

// ── Presence ──────────────────────────────────────────────────────────────────

export function usePresence(peerId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  useEffect(() => {
    if (!peerId) return
    let cancelled = false

    const onPresence = (data: { userId: string; status: 'online' | 'offline' }) => {
      if (data.userId !== peerId) return
      setIsOnline(data.status === 'online')
      if (data.status === 'online') setLastSeen(null)
    }

    const setup = async () => {
      const sock = await connectSocket()
      if (cancelled) return
      sock.on('presence:update', onPresence)
      // Request current status immediately on mount
      sock.emit('presence:ping', { userId: peerId })
    }

    setup()
    return () => {
      cancelled = true
      const sock = getSocket()
      if (sock) sock.off('presence:update', onPresence)
    }
  }, [peerId])

  return { isOnline, lastSeen }
}

// ── Typing indicator ──────────────────────────────────────────────────────────

const TYPING_DEBOUNCE_MS = 1500

export function useTypingIndicator(
  conversationId: string | null,
  peerId: string | undefined
) {
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    if (!conversationId || !peerId) return
    let cancelled = false

    const onTypingUpdate = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId !== conversationId || data.userId !== peerId) return
      setIsPeerTyping(data.isTyping)
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
      if (data.isTyping) {
        stopTimerRef.current = setTimeout(() => setIsPeerTyping(false), 3000)
      }
    }

    const setup = async () => {
      const sock = await connectSocket()
      if (cancelled) return
      await joinConversation(conversationId)
      sock.on('typing:update', onTypingUpdate)
    }

    setup()
    return () => {
      cancelled = true
      const sock = getSocket()
      if (sock) sock.off('typing:update', onTypingUpdate)
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [conversationId, peerId])

  const onTyping = useCallback(() => {
    if (!conversationId) return
    if (!isTypingRef.current) {
      isTypingRef.current = true
      emitTyping(conversationId)
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false
      emitStopTyping(conversationId)
    }, TYPING_DEBOUNCE_MS)
  }, [conversationId])

  const onStopTyping = useCallback(() => {
    if (!conversationId) return
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      emitStopTyping(conversationId)
    }
  }, [conversationId])

  return { isPeerTyping, onTyping, onStopTyping }
}
