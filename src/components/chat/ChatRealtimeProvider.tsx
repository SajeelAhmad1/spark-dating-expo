import { useGlobalChatRealtime } from '@/features/chat/hooks'
import { useAuthStore, selectIsAuthenticated } from '@/store/authStore'

/**
 * Mounts global socket listeners for read receipts, delivery receipts,
 * and inbox message updates. Active whenever the user is authenticated.
 */
export function ChatRealtimeProvider() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  useGlobalChatRealtime(isAuthenticated)
  return null
}
