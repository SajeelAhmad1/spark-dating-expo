import { io, Socket } from 'socket.io-client'
import Constants from 'expo-constants'
import { tokenStore } from '@/api/client'

// ── Singleton socket instance ──────────────────────────────────────────────────

let socket: Socket | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_DELAY = 8000 // 8s max backoff

// Offline message queue — messages sent while disconnected are queued and sent on reconnect
const offlineQueue: Array<{ event: string; payload: any; cb?: (res: any) => void }> = []

export const getSocket = (): Socket | null => socket

function log(event: string, data?: any) {
  console.log(`[Socket] ${event}`, data ? JSON.stringify(data) : '')
}

export async function connectSocket(): Promise<Socket> {
  // If socket exists and is connected, return it immediately
  if (socket?.connected) return socket

  // If socket exists but is disconnected, disconnect it fully before creating a new one
  if (socket && !socket.connected) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  const token = await tokenStore.getAccess()
  const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:5000'

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: MAX_RECONNECT_DELAY,
    timeout: 10_000
  })

  socket.on('connect', () => {
    reconnectAttempts = 0
    log('connected', { id: socket?.id })
    flushOfflineQueue()
  })

  socket.on('disconnect', (reason) => {
    log('disconnected', { reason })
  })

  socket.on('connect_error', (err) => {
    reconnectAttempts += 1
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), MAX_RECONNECT_DELAY)
    log('connect_error', { message: err.message, attempt: reconnectAttempts, nextRetryIn: delay })
  })

  socket.on('reconnect', (attemptNumber) => {
    reconnectAttempts = 0
    log('reconnected', { attemptNumber })
    flushOfflineQueue()
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  offlineQueue.length = 0
  log('disconnected (manual)')
}

// ── Offline queue flush ───────────────────────────────────────────────────────

function flushOfflineQueue() {
  if (!socket?.connected || offlineQueue.length === 0) return
  log('flushOfflineQueue', { count: offlineQueue.length })
  while (offlineQueue.length > 0) {
    const item = offlineQueue.shift()
    if (item) {
      socket.emit(item.event, item.payload, item.cb)
    }
  }
}

// ── Room helpers ──────────────────────────────────────────────────────────────

export function joinConversation(
  conversationId: string
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!socket?.connected) return resolve({ ok: false, error: 'Not connected' })
    socket.emit('conversation:join', { conversationId }, (res: { ok: boolean; error?: string }) => {
      log('conversation:join', { conversationId, ok: res.ok })
      resolve(res)
    })
  })
}

export function leaveConversation(conversationId: string) {
  socket?.emit('conversation:leave', { conversationId })
  log('conversation:leave', { conversationId })
}

// ── Typing helpers ────────────────────────────────────────────────────────────

export function emitTyping(conversationId: string) {
  socket?.emit('typing:start', { conversationId })
}

export function emitStopTyping(conversationId: string) {
  socket?.emit('typing:stop', { conversationId })
}

// ── Send message (socket-only, no REST fallback) ──────────────────────────────

export type SocketMessagePayload =
  | { conversationId: string; type: 'text'; text: string }
  | { conversationId: string; type: 'image'; media: { url: string; mime?: string } }
  | { conversationId: string; type: 'streak'; media: { url: string; mime?: string }; streak: { ttlSeconds: number } }

export function sendSocketMessage(
  payload: SocketMessagePayload
): Promise<{ ok: boolean; data?: { message: any }; error?: string }> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      // Queue message for later if offline
      offlineQueue.push({
        event: 'message:send',
        payload,
        cb: (res: any) => resolve(res)
      })
      log('message:send (queued)', { conversationId: payload.conversationId })
      return resolve({ ok: false, error: 'Queued for retry' })
    }
    socket.emit('message:send', payload, (res: { ok: boolean; data?: { message: any }; error?: string }) => {
      log('message:send', { conversationId: payload.conversationId, ok: res.ok })
      resolve(res)
    })
  })
}

// ── Mark read (socket-only) ───────────────────────────────────────────────────

export function markConversationRead(
  conversationId: string,
  lastReadMessageId: string
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!socket?.connected) return resolve({ ok: false, error: 'Not connected' })
    socket.emit('message:read', { conversationId, lastReadMessageId }, (res: { ok: boolean; error?: string }) => {
      log('message:read', { conversationId, lastReadMessageId, ok: res.ok })
      resolve(res)
    })
  })
}
