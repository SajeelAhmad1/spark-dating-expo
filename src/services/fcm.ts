/**
 * src/services/fcm.ts
 *
 * Isolated FCM service. Responsibilities:
 *  - Request permissions (once, cached)
 *  - Register Expo push token with backend (dedup via tokenStore)
 *  - Suppress foreground notifications when socket is connected
 *  - Handle background/terminated notification tap → navigate to conversation
 *  - Cleanup on logout
 *
 * Does NOT touch socket logic. Does NOT modify chat cache directly.
 * Chat cache sync on app-foreground is handled by React Query staleTime + refetch.
 */

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { tokenStore } from '@/api/client'
import { notificationsApi } from '@/features/notifications/api'
import { getSocket } from '@/services/socket'

// ── Expo Go guard ─────────────────────────────────────────────────────────────
// Remote push notifications are not supported in Expo Go since SDK 53.
// All FCM functions silently no-op when running inside Expo Go.
const isExpoGo = Constants.executionEnvironment === 'storeClient'

// ── Foreground notification behaviour ────────────────────────────────────────
// Must NOT be called at module level in Expo Go — it throws on import.
// Called once from registerFcmToken() which already guards with isExpoGo.
function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as Record<string, string> | undefined
      const isChatMessage = data?.type === 'new_message'
      const socketConnected = getSocket()?.connected ?? false
      if (isChatMessage && socketConnected) {
        return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false }
      }
      return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }
    },
  })
}

// ── Android notification channel ──────────────────────────────────────────────

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync('chat', {
    name: 'Chat messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1E78F5',
  })
}

// ── Token registration ────────────────────────────────────────────────────────

/**
 * Request permissions, get Expo push token, register with backend.
 * Safe to call multiple times — skips API call if token unchanged.
 * Never throws — all errors are caught and logged.
 */
export async function registerFcmToken(): Promise<void> {
  try {
    if (isExpoGo) {
      console.log('[FCM] Skipping — Expo Go does not support remote notifications (SDK 53+)')
      return
    }
    if (!Device.isDevice) {
      console.log('[FCM] Skipping — not a physical device')
      return
    }

    // Set handler once here — safe because we are already past the Expo Go guard
    setupNotificationHandler()
    await ensureAndroidChannel()

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) {
      console.warn('[FCM] Missing EAS projectId in app.json extra.eas.projectId')
      return
    }

    // Request permission — if already granted this resolves immediately
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[FCM] Permission denied — notifications disabled')
      return
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
    const newToken = tokenData?.data
    if (!newToken) {
      console.warn('[FCM] Could not obtain push token')
      return
    }

    // Dedup — skip API call if token unchanged
    const storedToken = await tokenStore.getFcmToken()
    if (storedToken === newToken) {
      console.log('[FCM] Token unchanged — skipping registration')
      return
    }

    // Register with backend
    await notificationsApi.registerFcmToken({ token: newToken })
    await notificationsApi.updatePreferences({ fcmEnabled: true })

    // Cache locally
    await tokenStore.setFcmToken(newToken)
    console.log('[FCM] Token registered successfully')
  } catch (err: any) {
    // Never crash the login flow
    console.warn('[FCM] Registration failed:', err?.message ?? err)
  }
}

// ── Logout cleanup ────────────────────────────────────────────────────────────

/**
 * Remove FCM token from backend and clear local cache.
 * Called during logout. Never throws.
 */
export async function unregisterFcmToken(): Promise<void> {
  try {
    if (isExpoGo) return
    const token = await tokenStore.getFcmToken()
    if (!token) return
    await notificationsApi.removeFcmToken({ token })
    console.log('[FCM] Token removed from backend')
  } catch (err: any) {
    console.warn('[FCM] Token removal failed:', err?.message ?? err)
  }
}

// ── Notification data types ───────────────────────────────────────────────────

export interface ChatNotificationData {
  type: 'new_message'
  conversationId: string
  messageId: string
  senderId?: string
  messageType?: string
  textPreview?: string
}

export function parseChatNotification(
  notification: Notifications.Notification | null | undefined
): ChatNotificationData | null {
  const data = notification?.request?.content?.data as Record<string, string> | undefined
  if (!data || data.type !== 'new_message') return null
  if (!data.conversationId || !data.messageId) return null
  return {
    type: 'new_message',
    conversationId: data.conversationId,
    messageId: data.messageId,
    senderId: data.senderId,
    messageType: data.messageType,
    textPreview: data.textPreview,
  }
}

// ── Last notification response (for terminated-state tap) ────────────────────

/**
 * Returns the notification the user tapped to open the app (if any).
 * Only populated when app was terminated or backgrounded.
 * Call once on app mount to handle initial navigation.
 */
export async function getInitialNotification(): Promise<ChatNotificationData | null> {
  try {
    if (isExpoGo) return null
    const response = await Notifications.getLastNotificationResponseAsync()
    return parseChatNotification(response?.notification ?? null)
  } catch {
    return null
  }
}
