import { apiPost, apiPatch, apiDel } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { RegisterFcmTokenDto, NotificationPrefsDto } from './schema'

export const notificationsApi = {
  registerFcmToken: (dto: RegisterFcmTokenDto): Promise<void> =>
    apiPost(ENDPOINTS.NOTIFICATIONS.REGISTER_FCM, dto),

  removeFcmToken: (dto: RegisterFcmTokenDto): Promise<void> =>
    apiDel(ENDPOINTS.NOTIFICATIONS.REGISTER_FCM, dto),

  updatePreferences: (dto: NotificationPrefsDto): Promise<void> =>
    apiPatch(ENDPOINTS.NOTIFICATIONS.PREFERENCES, dto),
}