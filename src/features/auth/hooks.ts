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
import { profileApi } from '@/features/profile/api';

// ── Sign-up ────────────────────────────────────────────────────────────────────

export const useSetPassword = () => {
  return useMutation({
    mutationFn: (dto: SetPasswordDto) => authApi.setPassword(dto),
  });
};

export const useSignupStartWithPhone = () => {
  return useMutation({
    mutationFn: (payload: SignupStartPhoneDto | SignupStartEmailDto) =>
      authApi.signupStartPhone(payload),
  });
};

export const useVerifyOtpPhone = () => {
  return useMutation({
    mutationFn: (dto: VerifyOtpPhoneDto) => authApi.verifyOtpPhone(dto),
  });
};

// ── Login ──────────────────────────────────────────────────────────────────────

export const useLogin = () => {
  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: async (data) => {
      // 1. Persist tokens immediately
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
      ]);

      // 2. Fetch full /me profile with the new token and store the user
      try {
        const meResult = await profileApi.getMe();
        console.log(meResult, "meResult")
        await tokenStore.setUser(meResult.user);
        // Seed the React Query cache so any useMe() call is instant
        queryClient.setQueryData(['user', 'me'], meResult);
      } catch (err) {
        console.warn('[useLogin] /me fetch failed after login:', err);
        // Non-fatal — tokens are saved, user can still proceed
      }

      queryClient.invalidateQueries();
    },
  });
};

// ── Google Auth ────────────────────────────────────────────────────────────────

export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: (idToken: string) => authApi.googleVerify(idToken),
    onSuccess: async (data) => {
      // 1. Persist tokens
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
      ]);

      // 2. Fetch /me and store user
      try {
        const meResult = await profileApi.getMe();
        await tokenStore.setUser(meResult.user);
        queryClient.setQueryData(['user', 'me'], meResult);
      } catch (err) {
        console.warn('[useGoogleAuth] /me fetch failed after login:', err);
      }

      queryClient.invalidateQueries();
    },
  });
};

// ── Logout ─────────────────────────────────────────────────────────────────────

export const useLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      await tokenStore.clearAll();
      queryClient.clear();
    },
  });
};
