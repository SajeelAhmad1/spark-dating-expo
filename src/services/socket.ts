import { io, Socket } from 'socket.io-client'
import Constants from 'expo-constants'
import { tokenStore } from '@/api/client'

// ── Singleton socket instance ──────────────────────────────────────────────────

let socket: Socket | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_DELAY = 8000
let _connectingPromise: Promise<Socket> | null = null

const joinedConversations = new Set<string>()
const reconnectListeners = new Set<() => void>()

export const getSocket = (): Socket | null => socket

function log(event: string, data?: any) {
  console.log(`[Socket] ${event}`, data ? JSON.stringify(data) : '')
}

function waitForConnect(sock: Socket, timeoutMs = 10_000): Promise<void> {
  if (sock.connected) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      sock.off('connect', onConnect)
      reject(new Error('Socket connection timeout'))
    }, timeoutMs)
    const onConnect = () => {
      clearTimeout(timer)
      resolve()
    }
    sock.on('connect', onConnect)
  })
}

async function rejoinConversations() {
  if (!socket?.connected || joinedConversations.size === 0) return
  for (const conversationId of joinedConversations) {
    await joinConversation(conversationId)
  }
}

export function onSocketReconnect(listener: () => void) {
  reconnectListeners.add(listener)
  return () => reconnectListeners.delete(listener)
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket
  if (_connectingPromise) return _connectingPromise

  if (socket && !socket.connected) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  _connectingPromise = (async () => {
    const token = await tokenStore.getAccess()
    const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:5000'

    socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: MAX_RECONNECT_DELAY,
      timeout: 10_000,
    })

    socket.on('connect', () => {
      reconnectAttempts = 0
      _connectingPromise = null
      log('connected', { id: socket?.id })
      rejoinConversations().catch(() => {})
      for (const listener of reconnectListeners) listener()
    })

    socket.on('disconnect', (reason) => {
      log('disconnected', { reason })
    })

    socket.on('connect_error', (err) => {
      reconnectAttempts += 1
      _connectingPromise = null
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), MAX_RECONNECT_DELAY)
      log('connect_error', { message: err.message, attempt: reconnectAttempts, nextRetryIn: delay })
    })

    socket.on('reconnect', (attemptNumber) => {
      reconnectAttempts = 0
      log('reconnected', { attemptNumber })
    })

    await waitForConnect(socket)
    return socket
  })()

  return _connectingPromise
}

export function disconnectSocket() {
  _connectingPromise = null
  joinedConversations.clear()
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  log('disconnected (manual)')
}

// ── Room helpers ──────────────────────────────────────────────────────────────

export function joinConversation(
  conversationId: string
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const doJoin = () => {
      if (!socket?.connected) return resolve({ ok: false, error: 'Not connected' })
      socket.emit('conversation:join', { conversationId }, (res: { ok: boolean; error?: string }) => {
        if (res.ok) joinedConversations.add(conversationId)
        log('conversation:join', { conversationId, ok: res.ok })
        resolve(res)
      })
    }
    if (!socket?.connected) {
      connectSocket().then(doJoin).catch(() => resolve({ ok: false, error: 'Not connected' }))
    } else {
      doJoin()
    }
  })
}

export function leaveConversation(conversationId: string) {
  joinedConversations.delete(conversationId)
  socket?.emit('conversation:leave', { conversationId })
  log('conversation:leave', { conversationId })
}

// ── Typing helpers ────────────────────────────────────────────────────────────

export function emitTyping(conversationId: string) {
  if (!socket?.connected) return
  socket.emit('typing:start', { conversationId })
}

export function emitStopTyping(conversationId: string) {
  if (!socket?.connected) return
  socket.emit('typing:stop', { conversationId })
}

// ── App state handler (iOS: reconnect on foreground) ────────────────────────

/**
 * Called when app comes to foreground.
 * Ensures socket is reconnected on iOS where background suspension can break the connection.
 */
export async function handleAppForeground(): Promise<void> {
  try {
    if (socket?.connected) return
    log('app:foreground - reconnecting')
    // Tear down stale socket so connectSocket() builds a fresh one with the
    // latest token (which may have been silently refreshed while backgrounded).
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
      _connectingPromise = null
    }
    await connectSocket()
  } catch (err) {
    log('app:foreground - reconnect failed', err)
  }
}


// ── Send message ──────────────────────────────────────────────────────────────

export type SocketMessagePayload =
  | { conversationId: string; type: 'text'; text: string }
  | { conversationId: string; type: 'image'; media: { url: string; mime?: string } }
  | { conversationId: string; type: 'streak'; media: { url: string; mime?: string }; streak: { ttlSeconds: number } }

export function sendSocketMessage(
  payload: SocketMessagePayload
): Promise<{ ok: boolean; data?: { message: any }; error?: string }> {
  return new Promise((resolve) => {
    const doSend = () => {
      if (!socket?.connected) {
        return resolve({ ok: false, error: 'Not connected to server' })
      }
      socket.emit('message:send', payload, (res: { ok: boolean; data?: { message: any }; error?: string }) => {
        log('message:send', { conversationId: payload.conversationId, ok: res.ok })
        resolve(res)
      })
    }
    if (!socket?.connected) {
      connectSocket().then(doSend).catch(() => resolve({ ok: false, error: 'Not connected to server' }))
    } else {
      doSend()
    }
  })
}

// ── Mark read ─────────────────────────────────────────────────────────────────

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
