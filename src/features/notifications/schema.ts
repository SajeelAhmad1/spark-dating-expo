
import { z } from 'zod'

export const RegisterFcmTokenSchema    = z.object({ token: z.string() })
export const NotificationPrefsSchema   = z.object({ fcmEnabled: z.boolean() })

export type RegisterFcmTokenDto   = z.infer<typeof RegisterFcmTokenSchema>
export type NotificationPrefsDto  = z.infer<typeof NotificationPrefsSchema>