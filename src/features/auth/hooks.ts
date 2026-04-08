// src/features/auth/hooks.ts

import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginDto,
  SetPasswordDto,
  SignupStartEmailDto,
  SignupStartPhoneDto,
  VerifyOtpPhoneDto,
} from './schema';
import { tokenStore } from '@/api/client';
import { queryClient } from '@/utils/queryClient';

// sign-up
export const useSetPassword = () => {
  return useMutation({
    mutationFn: (dto: SetPasswordDto) => authApi.setPassword(dto),
  });
};

// sign-up with phone
export const useSignupStartWithPhone = () => {
  return useMutation({
    mutationFn: (payload: SignupStartPhoneDto | SignupStartEmailDto) =>
      authApi.signupStartPhone(payload),
  });
};

// verify otp phone
export const useVerifyOtpPhone = () => {
  return useMutation({
    mutationFn: (dto: VerifyOtpPhoneDto) => authApi.verifyOtpPhone(dto),
  });
};

// sign-in
export const useLogin = () => {
  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),

    onSuccess: async (data) => {
      await Promise.all([
        tokenStore.setAccess(data.accessToken),
        tokenStore.setRefresh(data.refreshToken),
        tokenStore.setUser(data.user),
      ]);  

      // Invalidate everything — user just authenticated
      queryClient.invalidateQueries();
    },
    
  });
};

// logout
export const useLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,

    onSettled: async () => {
      await tokenStore.clearAll();
      queryClient.clear();
    },
  });
};
