import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';
import {
  LoginDto,
  SetPasswordDto,
  SignupStartEmailDto,
  SignupStartPhoneDto,
  VerifyOtpPhoneDto,
} from './schema';
import { tokenStore } from '@/api/client';
import { queryClient } from '@/utils/queryClient';
import { notificationsApi } from '@/features/notifications/api';
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// ── FCM token helper — call after login ────────────────────────────────────────
// async function tryRegisterFcmToken() {
//   try {
//     if (!Device.isDevice) return;

//     const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
//     if (!projectId) {
//       console.warn('Project ID missing for push notifications');
//       return;
//     }

//     const { status } = await Notifications.requestPermissionsAsync();
//     if (status !== 'granted') return;

//     const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
//     const token = tokenData?.data;

//     if (!token) return;

//     // ✅ STEP 1: check existing token (avoid duplicate API call)
//     const existingToken = await tokenStore.getFcmToken();

//     if (existingToken === token) {
//       // already registered → skip
//       return;
//     }

//     // ✅ STEP 2: send to backend
//     await notificationsApi.registerFcmToken({ token });
//     await notificationsApi.updatePreferences({ fcmEnabled: true });

//     // ✅ STEP 3: SAVE LOCALLY (IMPORTANT)
//     await tokenStore.setFcmToken(token);
//   } catch (error) {
//     console.log('Push notification registration failed:', error);
//   }
// }

// ── Sign-up ───────────────────────────────────────────────────────────────────

export const useSetPassword = () =>
  useMutation({
    mutationFn: (dto: SetPasswordDto) => authApi.setPassword(dto),
  });

export const useSignupStartWithPhone = () =>
  useMutation({
    mutationFn: (payload: SignupStartPhoneDto | SignupStartEmailDto) =>
      authApi.signupStartPhone(payload),
  });

export const useVerifyOtpPhone = () =>
  useMutation({
    mutationFn: (dto: VerifyOtpPhoneDto) => authApi.verifyOtpPhone(dto),
  });

// ── Login ─────────────────────────────────────────────────────────────────────

export const useLogin = () =>
  useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: async (data) => {
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
        tokenStore.setUser(data.user),
      ]);
      queryClient.invalidateQueries();
      // Register FCM token after successful login
      // await tryRegisterFcmToken();
    },
  });

// ── Google ────────────────────────────────────────────────────────────────────

export const useGoogleAuth = () =>
  useMutation({
    mutationFn: (idToken: string) => authApi.googleVerify(idToken),
    onSuccess: async (data) => {
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
        tokenStore.setUser(data.user),
      ]);
      queryClient.invalidateQueries();
      // await tryRegisterFcmToken();
    },
  });

// ── Logout ────────────────────────────────────────────────────────────────────

 

 export const useLogout = () =>
  useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      try {
        const fcmToken = await tokenStore.getFcmToken();

        if (fcmToken) {
          try {
            await notificationsApi.removeFcmToken({ token: fcmToken });
          } catch (err) {
            console.error('FCM remove failed:', err);
          }
        }

        await tokenStore.clearAll();
        queryClient.clear();
      } catch (error) {
        console.error('Logout cleanup failed:', error);
      }
    },
  });
