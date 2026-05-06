import { useMutation } from '@tanstack/react-query'
import { authApi } from './api'
import type {
  LoginDto,
  SetPasswordDto,
  SignupStartEmailDto,
  SignupStartPhoneDto,
  VerifyOtpPhoneDto,
} from './schema'
import { tokenStore } from '@/api/client'
import { queryClient } from '@/utils/queryClient'
import { showToast } from '@/utils/toast'
import { registerFcmToken, unregisterFcmToken } from '@/services/fcm'
import { disconnectSocket } from '@/services/socket'

// ── Sign-up ───────────────────────────────────────────────────────────────────

export const useSetPassword = () =>
  useMutation({
    mutationFn: (dto: SetPasswordDto) => authApi.setPassword(dto),
  })

export const useSignupStartWithPhone = () =>
  useMutation({
    mutationFn: (payload: SignupStartPhoneDto | SignupStartEmailDto) =>
      authApi.signupStartPhone(payload),
  })

export const useVerifyOtpPhone = () =>
  useMutation({
    mutationFn: (dto: VerifyOtpPhoneDto) => authApi.verifyOtpPhone(dto),
  })

// ── Login ─────────────────────────────────────────────────────────────────────

export const useLogin = () =>
  useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: async (data) => { 
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
        tokenStore.setUser(data.user),
      ])
      queryClient.invalidateQueries()
      // Register FCM token after credentials are stored so API calls are authenticated
      await registerFcmToken()
    },
  })

// ── Google ────────────────────────────────────────────────────────────────────

export const useGoogleAuth = () =>
  useMutation({
    mutationFn: (idToken: string) => authApi.googleVerify(idToken),
    onSuccess: async (data) => {
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
        tokenStore.setUser(data.user),
      ])
      queryClient.invalidateQueries()
      await registerFcmToken()
    },
  })

// ── Logout ────────────────────────────────────────────────────────────────────

export const useLogout = () =>
  useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      try {
        // 1. Remove FCM token from backend + clear local cache
        await unregisterFcmToken()

        // 2. Disconnect socket
        disconnectSocket()

        // 3. Clear all stored tokens + user data
        await tokenStore.clearAll()

        // 4. Clear React Query cache
        queryClient.clear()
      } catch (error) {
        console.error('Logout cleanup failed:', error)
        showToast({ text1: error ? `${error}` : 'Logout Failed' })
      }
    },
  })
