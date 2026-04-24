import { io, Socket } from 'socket.io-client'
import Constants from 'expo-constants'
import { tokenStore } from '@/api/client'

// ── Singleton socket instance ──────────────────────────────────────────────────

let socket: Socket | null = null

export const getSocket = (): Socket | null => socket

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token    = await tokenStore.getAccess()
  const baseUrl  = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:5000'

  socket = io(baseUrl, {
    auth:              { token },
    transports:        ['websocket'],
    reconnection:      true,
    reconnectionDelay: 1000,
    timeout:           10_000,
  })

  socket.on('connect',       () => console.log('[Socket] connected', socket?.id))
  socket.on('disconnect',    (reason) => console.log('[Socket] disconnected', reason))
  socket.on('connect_error', (err)    => console.warn('[Socket] error', err.message))

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

// ── Room helpers ──────────────────────────────────────────────────────────────

export function joinConversation(
  conversationId: string,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!socket?.connected) return resolve({ ok: false, error: 'Not connected' })
    socket.emit(
      'conversation:join',
      { conversationId },
      (res: { ok: boolean; error?: string }) => resolve(res),
    )
  })
}

export function leaveConversation(conversationId: string) {
  socket?.emit('conversation:leave', { conversationId })
}

// ── Presence & typing helpers ───────────────────────────────────────────────

export function emitTyping(conversationId: string) {
  socket?.emit('typing:start', { conversationId })
}

export function emitStopTyping(conversationId: string) {
  socket?.emit('typing:stop', { conversationId })
}

// ── Send via socket (persisted + emitted + FCM) ───────────────────────────────

export type SocketMessagePayload =
  | { conversationId: string; type: 'text'; text: string }
  | { conversationId: string; type: 'image'; media: { url: string; mime?: string } }
  | { conversationId: string; type: 'streak'; media: { url: string; mime?: string }; streak: { ttlSeconds: number } }

export function sendSocketMessage(
  payload: SocketMessagePayload,
): Promise<{ ok: boolean; data?: { message: any }; error?: string }> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      return resolve({ ok: false, error: 'Not connected' })
    }
    socket.emit(
      'message:send',
      payload,
      (res: { ok: boolean; data?: { message: any }; error?: string }) => resolve(res),
    )
  })
}