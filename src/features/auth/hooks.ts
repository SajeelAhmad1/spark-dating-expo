import { useMutation } from '@tanstack/react-query'
import { authApi }     from './api'
import type {
  LoginDto,
  SetPasswordDto,
  SignupStartEmailDto,
  SignupStartPhoneDto,
  VerifyOtpPhoneDto,
} from './schema'
import { tokenStore }      from '@/api/client'
import { queryClient }     from '@/utils/queryClient'
import { showToast }       from '@/utils/toast'
import { registerFcmToken, unregisterFcmToken } from '@/services/fcm'
import { disconnectSocket } from '@/services/socket'
import { useAuthStore }    from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'

// ── Sign-up ───────────────────────────────────────────────────────────────────

export const useSetPassword = () =>
  useMutation({ mutationFn: (dto: SetPasswordDto) => authApi.setPassword(dto) })

export const useSignupStartWithPhone = () =>
  useMutation({
    mutationFn: (payload: SignupStartPhoneDto | SignupStartEmailDto) =>
      authApi.signupStartPhone(payload),
  })

export const useVerifyOtpPhone = () =>
  useMutation({ mutationFn: (dto: VerifyOtpPhoneDto) => authApi.verifyOtpPhone(dto) })

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
      // Restore location into store so AppNavigator picks the right initial route
      if (data.user?.location?.lat && data.user?.location?.lng) {
        useLocationStore.getState().setCoords({
          lat: data.user.location.lat,
          lng: data.user.location.lng,
        })
      }
      // Update Zustand auth state — RootNavigator will switch to AppNavigator
      useAuthStore.getState().signIn(data.accessToken, data.user)
      queryClient.invalidateQueries()
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
      if (data.user?.location?.lat && data.user?.location?.lng) {
        useLocationStore.getState().setCoords({
          lat: data.user.location.lat,
          lng: data.user.location.lng,
        })
      }
      useAuthStore.getState().signIn(data.accessToken, data.user)
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
        await unregisterFcmToken()
        disconnectSocket()
        await tokenStore.clearAll()
        queryClient.clear()
        // Clear location so next login re-evaluates it
        useLocationStore.getState().clearLocation()
        // Update Zustand — RootNavigator switches back to AuthNavigator
        useAuthStore.getState().signOut()
      } catch (error) {
        console.error('Logout cleanup failed:', error)
        showToast({ text1: error ? `${error}` : 'Logout Failed' })
      }
    },
  })

// ── Forgot password ───────────────────────────────────────────────────────────

export const useForgotPasswordStart = () =>
  useMutation({
    mutationFn: (payload: { phone?: string; email?: string }) =>
      authApi.forgotPasswordStart(payload),
  })

export const useForgotPasswordVerify = () =>
  useMutation({
    mutationFn: (payload: {
      sessionId: string; code: string; phone?: string; email?: string
    }) => authApi.forgotPasswordVerify(payload),
  })

export const useForgotPasswordReset = () =>
  useMutation({
    mutationFn: (payload: { resetToken: string; newPassword: string }) =>
      authApi.forgotPasswordReset(payload),
  })