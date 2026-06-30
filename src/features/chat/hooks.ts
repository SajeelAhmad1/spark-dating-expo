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
  onSocketReconnect,
  type SocketMessagePayload,
} from '@/services/socket'
import { uploadToCloudinary } from '@/utils/cloudinary'
import type { ChatMessage, ConversationItem, ListConversationsResponse } from './schema'

// ── Helpers ───────────────────────────────────────────────────────────────────

function updateConversationsCache(
  qc: ReturnType<typeof useQueryClient>,
  updater: (items: ConversationItem[]) => ConversationItem[]
) {
  qc.setQueryData<ListConversationsResponse>(queryKeys.chat.conversations(), (old) => {
    const items = Array.isArray(old?.items) ? old.items : []
    return { items: updater(items) }
  })
}

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
        messages: sortByCreatedAt(dedupeMessages(all)),
      }
    },
  })

function stampMessagesUpTo(
  pages: any[],
  messageId: string,
  field: 'readBy' | 'deliveredTo',
  userIds: string[]
) {
  let reached = false
  return pages.map((page: any) => ({
    ...page,
    items: page.items.map((m: ChatMessage) => {
      if (reached) return m
      const updated = {
        ...m,
        [field]: Array.from(new Set([...((m as any)[field] ?? []), ...userIds])),
      }
      if (m.id === messageId) reached = true
      return updated
    }),
  }))
}

function applyReadReceipt(
  qc: ReturnType<typeof useQueryClient>,
  conversationId: string,
  messageId: string,
  userIds: string[]
) {
  updateConversationsCache(qc, (items) =>
    items.map((item) =>
      item.conversationId === conversationId
        ? { ...item, unreadCount: 0 }
        : item
    )
  )

  qc.setQueryData<any>(queryKeys.chat.messages(conversationId), (old: any) => {
    if (!old) return old
    return {
      ...old,
      pages: stampMessagesUpTo(old.pages, messageId, 'readBy', userIds),
    }
  })
}

function applyDeliveryReceipt(
  qc: ReturnType<typeof useQueryClient>,
  conversationId: string,
  messageId: string,
  userIds: string[]
) {
  qc.setQueryData<any>(queryKeys.chat.messages(conversationId), (old: any) => {
    if (!old) return old
    return {
      ...old,
      pages: stampMessagesUpTo(old.pages, messageId, 'deliveredTo', userIds),
    }
  })
}

function injectMessageIntoCache(
  qc: ReturnType<typeof useQueryClient>,
  rawMsg: any
) {
  const msg = rawMsg as ChatMessage
  const convId = msg.conversationId

  qc.setQueryData<any>(queryKeys.chat.messages(convId), (old: any) => {
    if (!old) {
      return {
        pages: [{ items: [msg], nextCursor: null }],
        pageParams: [undefined],
      }
    }
    const pages = old.pages as any[]
    const allIds = new Set(pages.flatMap((p: any) => p.items.map((m: any) => m.id)))
    if (allIds.has(msg.id)) return old

    const newPages = [...pages]
    const last = { ...newPages[newPages.length - 1] }
    last.items = [
      ...last.items.filter(
        (m: any) => !m.id.startsWith('optimistic-') || m.senderId !== msg.senderId
      ),
      msg,
    ]
    newPages[newPages.length - 1] = last
    return { ...old, pages: newPages }
  })

  updateConversationsCache(qc, (items) => {
    const updated = items.map((item) => {
      if (item.conversationId !== convId) return item
      const isFromPeer = item.otherUser?.id === msg.senderId
      return {
        ...item,
        unreadCount: isFromPeer ? (item.unreadCount ?? 0) + 1 : item.unreadCount,
        lastMessage: {
          id: msg.id,
          type: msg.type,
          text: msg.text ?? null,
          media: msg.media ?? null,
          createdAt: msg.createdAt,
          senderId: msg.senderId,
        },
        lastMessageAt: msg.createdAt,
      }
    })
    const idx = updated.findIndex((i) => i.conversationId === convId)
    if (idx > 0) {
      const [moved] = updated.splice(idx, 1)
      updated.unshift(moved)
    }
    return updated
  })
}

// ── Real-time socket for a conversation ───────────────────────────────────────

export function useConversationSocket(conversationId: string | null) {
  const qc = useQueryClient()

  const injectMessage = useCallback((rawMsg: any) => {
    injectMessageIntoCache(qc, rawMsg)
  }, [qc])

  useEffect(() => {
    if (!conversationId) return
    let cancelled = false
    let sock: ReturnType<typeof getSocket> = null

    const onMessageNew = (payload: { conversationId: string; message: ChatMessage }) => {
      if (payload.conversationId === conversationId) {
        injectMessage(payload.message)
      }
    }

    const onMessageRead = (payload: { conversationId: string; messageId: string; userIds: string[] }) => {
      if (payload.conversationId !== conversationId) return
      applyReadReceipt(qc, conversationId, payload.messageId, payload.userIds)
    }

    const onMessageDelivered = (payload: { conversationId: string; messageId: string; userIds: string[] }) => {
      if (payload.conversationId !== conversationId) return
      applyDeliveryReceipt(qc, conversationId, payload.messageId, payload.userIds)
    }

    const setup = async () => {
      sock = await connectSocket()
      if (cancelled) return
      await joinConversation(conversationId)
      if (cancelled) return
      sock.on('message:new', onMessageNew)
      sock.on('message:read', onMessageRead)
      sock.on('message:delivered', onMessageDelivered)
    }

    const rejoin = () => {
      if (!cancelled && conversationId) joinConversation(conversationId)
    }

    setup()
    const offReconnect = onSocketReconnect(rejoin)

    return () => {
      cancelled = true
      offReconnect()
      leaveConversation(conversationId)
      if (sock) {
        sock.off('message:new', onMessageNew)
        sock.off('message:read', onMessageRead)
        sock.off('message:delivered', onMessageDelivered)
      }
    }
  }, [conversationId, injectMessage, qc])
}

// ── Global socket listeners (user room) ───────────────────────────────────────
// Handles read receipts, delivery receipts, and inbox updates app-wide.

export function useGlobalChatRealtime(enabled: boolean) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let sock: ReturnType<typeof getSocket> = null

    const onMessageNew = (payload: { conversationId: string; message: ChatMessage }) => {
      injectMessageIntoCache(qc, payload.message)
    }

    const onMessageRead = (payload: { conversationId: string; messageId: string; userIds: string[] }) => {
      applyReadReceipt(qc, payload.conversationId, payload.messageId, payload.userIds)
    }

    const onMessageDelivered = (payload: { conversationId: string; messageId: string; userIds: string[] }) => {
      applyDeliveryReceipt(qc, payload.conversationId, payload.messageId, payload.userIds)
    }

    const setup = async () => {
      sock = await connectSocket()
      if (cancelled) return
      sock.on('message:new', onMessageNew)
      sock.on('message:read', onMessageRead)
      sock.on('message:delivered', onMessageDelivered)
    }

    const onReconnect = () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.conversations() })
    }

    setup()
    const offReconnect = onSocketReconnect(onReconnect)

    return () => {
      cancelled = true
      offReconnect()
      if (sock) {
        sock.off('message:new', onMessageNew)
        sock.off('message:read', onMessageRead)
        sock.off('message:delivered', onMessageDelivered)
      }
    }
  }, [enabled, qc])
}

/** @deprecated Use useGlobalChatRealtime via ChatRealtimeProvider instead */
export function useGlobalReadReceipts() {
  useGlobalChatRealtime(true)
}

// ── Send message ──────────────────────────────────────────────────────────────

export type SendPayload =
  | { type: 'text'; text: string }
  | { type: 'image'; media: { url: string; mime?: string } }
  | { type: 'streak'; media: { url: string; mime?: string }; streak: { ttlSeconds: number } }

export const useSendMessage = (conversationId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SendPayload) => {
      // Upload local file:// URI to Cloudinary first so the receiver
      // gets a publicly accessible CDN URL, not a device-local path.
      let resolvedPayload = payload
      if (payload.type !== 'text') {
        const localUri = payload.media.url
        const isLocal = localUri.startsWith('file://') || localUri.startsWith('content://')
        if (isLocal) {
          const uploaded = await uploadToCloudinary(localUri)
          resolvedPayload = {
            ...payload,
            media: { ...payload.media, url: uploaded.secure_url },
          } as SendPayload
        }
      }

      const socketPayload = { conversationId, ...resolvedPayload } as SocketMessagePayload
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

// ── Mark read ─────────────────────────────────────────────────────────────────

export const useMarkRead = (conversationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (lastReadMessageId: string) => {
      await connectSocket()
      await joinConversation(conversationId)
      const res = await markConversationRead(conversationId, lastReadMessageId)
      if (!res.ok) throw new Error(res.error ?? 'Failed to mark read')
      return res
    },
    onSuccess: () => {
      updateConversationsCache(qc, (items) =>
        items.map((item) =>
          item.conversationId === conversationId
            ? { ...item, unreadCount: 0 }
            : item
        )
      )
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
  // FIX 2: joinedRef is set true only AFTER joinConversation resolves,
  // not just after connectSocket. The server drops typing:start if the socket
  // is not in socket.data.joinedConversations — this ref ensures we never
  // emit before the server-side join has been acknowledged.
  const joinedRef = useRef(false)

  useEffect(() => {
    if (!conversationId || !peerId) return
    let cancelled = false
    joinedRef.current = false

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
      sock.on('typing:update', onTypingUpdate)
      await joinConversation(conversationId)
      if (cancelled) return
      joinedRef.current = true
    }

    const rejoin = async () => {
      if (cancelled || !conversationId) return
      joinedRef.current = false
      const res = await joinConversation(conversationId)
      if (!cancelled && res.ok) joinedRef.current = true
    }

    setup()
    const offReconnect = onSocketReconnect(rejoin)

    return () => {
      cancelled = true
      joinedRef.current = false
      offReconnect()
      const sock = getSocket()
      if (sock) sock.off('typing:update', onTypingUpdate)
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [conversationId, peerId])

  const onTyping = useCallback(() => {
    if (!conversationId || !joinedRef.current) return
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
      if (joinedRef.current) emitStopTyping(conversationId)
    }
  }, [conversationId])

  return { isPeerTyping, onTyping, onStopTyping }
}
