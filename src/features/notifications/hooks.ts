

import { useMutation } from '@tanstack/react-query'
import { notificationsApi } from './api'
import type { RegisterFcmTokenDto, NotificationPrefsDto } from './schema'

export const useRegisterFcmToken = () =>
  useMutation({
    mutationFn: (dto: RegisterFcmTokenDto) => notificationsApi.registerFcmToken(dto),
  })

export const useRemoveFcmToken = () =>
  useMutation({
    mutationFn: (dto: RegisterFcmTokenDto) => notificationsApi.removeFcmToken(dto),
  })

export const useUpdateNotificationPreferences = () =>
  useMutation({
    mutationFn: (dto: NotificationPrefsDto) => notificationsApi.updatePreferences(dto),
  })