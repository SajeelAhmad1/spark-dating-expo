import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useCallback, useRef, useState } from 'react'
import { chatApi }   from './api'
import { queryKeys } from '@/api/endpoints'
import { showToast } from '@/utils/toast'
import {
  connectSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  emitTyping,
  emitStopTyping,
  getSocket,
  type SocketMessagePayload,
} from '@/services/socket'
import type {
  ChatMessage,
  ConversationItem,
  MarkReadRequest,
} from './schema'

// ── Create direct conversation ────────────────────────────────────────────────

export const useCreateDirectConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => chatApi.createDirectConversation(userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.chat.conversations() }),
    onError:    (err: any) => showToast({ text1: 'Could not open chat', text2: err?.message }),
  })
}

// ── List conversations ────────────────────────────────────────────────────────

export const useConversations = (limit = 20) =>
  useQuery({
    queryKey:  queryKeys.chat.conversations(),
    queryFn:   () => chatApi.listConversations(limit),
    staleTime: 1000 * 30,
    gcTime:    1000 * 60 * 5,
    select:    (res) => res.items,
  })

// ── List messages (infinite) ──────────────────────────────────────────────────

export const useMessages = (conversationId: string | null) =>
  useInfiniteQuery({
    queryKey:        queryKeys.chat.messages(conversationId ?? ''),
    queryFn:         ({ pageParam }) =>
      chatApi.listMessages(conversationId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled:         !!conversationId,
    staleTime:       1000 * 15,
    select: (data) => {
      const all = data.pages.flatMap((p) => p.items)
      // Deduplicate by id — keeps last occurrence (real msg over optimistic)
      const seen = new Map<string, ChatMessage>()
      for (const m of all) seen.set(m.id, m)
      return { pages: data.pages, messages: Array.from(seen.values()) }
    },
  })

// ── Real-time socket for a conversation ───────────────────────────────────────

export function useConversationSocket(conversationId: string | null) {
  const qc = useQueryClient()

  // ── Inject incoming message into cache ──────────────────────────────────

  const injectMessage = useCallback((rawMsg: any) => {
    const msg = rawMsg as ChatMessage
    const convId = msg.conversationId

    // Update messages cache
    qc.setQueryData<any>(
      queryKeys.chat.messages(convId),
      (old: any) => {
        if (!old) return old
        const pages = old.pages as any[]
        const allIds = new Set(pages.flatMap((p: any) => p.items.map((m: any) => m.id)))
        if (allIds.has(msg.id)) return old // already present — skip

        // Also remove any optimistic placeholder that matches by content/time proximity
        const newPages = [...pages]
        const last     = { ...newPages[newPages.length - 1] }
        last.items     = [
          ...last.items.filter((m: any) => !m.id.startsWith('optimistic-') || m.senderId !== msg.senderId),
          msg,
        ]
        newPages[newPages.length - 1] = last
        return { ...old, pages: newPages }
      },
    )

    // Update conversations list (bump lastMessage + unread)
    qc.setQueryData<any>(
      queryKeys.chat.conversations(),
      (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: (old.items as ConversationItem[]).map((item) =>
            item.conversationId === convId
              ? {
                  ...item,
                  lastMessage:   {
                    id:        msg.id,
                    type:      msg.type,
                    text:      msg.text ?? null,
                    media:     msg.media ?? null,
                    createdAt: msg.createdAt,
                  },
                  lastMessageAt: msg.createdAt,
                }
              : item,
          ),
        }
      },
    )
  }, [qc])

  useEffect(() => {
    if (!conversationId) return

    let cancelled = false

    const setup = async () => {
      const sock = await connectSocket()
      if (cancelled) return

      // Join room
      await joinConversation(conversationId)

      // Listen for new messages
      sock.on('message:new', (payload: { conversationId: string; message: ChatMessage }) => {
        if (payload.conversationId === conversationId) {
          injectMessage(payload.message)
        }
      })
    }

    setup()

    return () => {
      cancelled = true
      leaveConversation(conversationId)

      // Remove listener
      const sock = getSocket()
      if (sock) sock.off('message:new')
    }
  }, [conversationId, injectMessage])
}

// ── Send message via socket (with HTTP fallback) ──────────────────────────────

export type SendPayload =
  | { type: 'text';   text: string }
  | { type: 'image';  media: { url: string; mime?: string } }
  | { type: 'streak'; media: { url: string; mime?: string }; streak: { ttlSeconds: number } }

export const useSendMessage = (conversationId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SendPayload) => {
      // Try socket first — it persists + emits + triggers FCM
      const socketPayload = { conversationId, ...payload } as SocketMessagePayload
      const res = await sendSocketMessage(socketPayload)

      if (res.ok && res.data?.message) return res.data.message as ChatMessage

      // Fallback to HTTP if socket not connected
      const httpPayload =
        payload.type === 'text'
          ? { type: 'text' as const, text: payload.text }
          : payload.type === 'image'
          ? { type: 'image' as const, media: payload.media }
          : { type: 'streak' as const, media: payload.media, streak: payload.streak }

      const httpRes = await chatApi.sendMessage(conversationId, httpPayload)
      return httpRes.message
    },

    // Optimistic update
    onMutate: async (payload) => {
      const key = queryKeys.chat.messages(conversationId)
      await qc.cancelQueries({ queryKey: key })

      const optimistic: ChatMessage = {
        id:              `optimistic-${Date.now()}`,
        conversationId,
        senderId:        '__me__',
        type:            payload.type,
        text:            payload.type === 'text' ? payload.text : null,
        media:           payload.type !== 'text' ? (payload as any).media : null,
        streakExpiresAt: null,
        streakViewedBy:  [],
        createdAt:       new Date().toISOString(),
        updatedAt:       new Date().toISOString(),
      }

      qc.setQueryData<any>(key, (old: any) => {
        if (!old) return old
        const pages    = [...old.pages]
        const last     = { ...pages[pages.length - 1] }
        last.items     = [...last.items, optimistic]
        pages[pages.length - 1] = last
        return { ...old, pages }
      })

      return { optimistic }
    },

    onSuccess: (realMsg, _vars, context) => {
      // Replace optimistic with real message
      qc.setQueryData<any>(
        queryKeys.chat.messages(conversationId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((m: ChatMessage) =>
                m.id === context?.optimistic.id ? realMsg : m,
              ),
            })),
          }
        },
      )
      qc.invalidateQueries({ queryKey: queryKeys.chat.conversations() })
    },

    onError: (_err, _vars, context) => {
      // Rollback
      qc.setQueryData<any>(
        queryKeys.chat.messages(conversationId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.filter((m: ChatMessage) => m.id !== context?.optimistic.id),
            })),
          }
        },
      )
      showToast({ text1: 'Failed to send message' })
    },
  })
}

// ── Presence: online status + last seen ─────────────────────────────────────

export function usePresence(peerId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  useEffect(() => {
    if (!peerId) return
    let cancelled = false

    const setup = async () => {
      const sock = await connectSocket()
      if (cancelled) return

      const onOnline  = (data: { userId: string }) => {
        if (data.userId === peerId) { setIsOnline(true); setLastSeen(null) }
      }
      const onOffline = (data: { userId: string; lastSeen?: string }) => {
        if (data.userId === peerId) { setIsOnline(false); setLastSeen(data.lastSeen ?? null) }
      }
      const onStatus  = (data: { userId: string; online: boolean; lastSeen?: string }) => {
        if (data.userId !== peerId) return
        setIsOnline(data.online)
        setLastSeen(data.online ? null : (data.lastSeen ?? null))
      }

      sock.on('user:online',  onOnline)
      sock.on('user:offline', onOffline)
      sock.on('user:status',  onStatus)

      // Ask server to push current status — server should emit user:status back
      sock.emit('presence:subscribe', { userId: peerId })
    }

    setup()
    return () => {
      cancelled = true
      const sock = getSocket()
      if (sock) {
        sock.off('user:online')
        sock.off('user:offline')
        sock.off('user:status')
        sock.emit('presence:unsubscribe', { userId: peerId })
      }
    }
  }, [peerId])

  return { isOnline, lastSeen }
}

// ── Typing indicator ───────────────────────────────────────────────────────────────────

const TYPING_DEBOUNCE_MS = 1500

export function useTypingIndicator(
  conversationId: string | null,
  peerId: string | undefined,
) {
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const stopTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef   = useRef(false)

  // Listen for peer typing events
  useEffect(() => {
    if (!conversationId || !peerId) return
    let cancelled = false

    const setup = async () => {
      const sock = await connectSocket()
      if (cancelled) return

      sock.on('typing:start', (data: { conversationId: string; userId: string }) => {
        if (data.conversationId === conversationId && data.userId === peerId) {
          setIsPeerTyping(true)
          // Auto-clear after 3s in case stop event is missed
          if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
          stopTimerRef.current = setTimeout(() => setIsPeerTyping(false), 3000)
        }
      })
      sock.on('typing:stop', (data: { conversationId: string; userId: string }) => {
        if (data.conversationId === conversationId && data.userId === peerId) {
          setIsPeerTyping(false)
          if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
        }
      })
    }

    setup()
    return () => {
      cancelled = true
      const sock = getSocket()
      if (sock) { sock.off('typing:start'); sock.off('typing:stop') }
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [conversationId, peerId])

  // Emit typing events with debounce
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

// ── Mark read ─────────────────────────────────────────────────────────────────

export const useMarkRead = (conversationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MarkReadRequest) =>
      chatApi.markConversationRead(conversationId, payload),
    onSuccess: () => {
      qc.setQueryData<any>(queryKeys.chat.conversations(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: (old.items as ConversationItem[]).map((item) =>
            item.conversationId === conversationId
              ? { ...item, unreadCount: 0 }
              : item,
          ),
        }
      })
    },
  })
}