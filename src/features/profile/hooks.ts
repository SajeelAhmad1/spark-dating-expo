import { useMutation, useQuery } from '@tanstack/react-query';
import { profileApi } from './api';
import type { CompleteProfileDto, EditProfileDto, User } from './schema';
import { queryClient } from '@/utils/queryClient';
import { queryKeys } from '@/api/endpoints';
import { tokenStore } from '@/api/client';

// ─── GET /me ──────────────────────────────────────────────────────────────────

export const useMe = () => {
  return useQuery<{ user: User }, Error, User>({
    queryKey: queryKeys.user.me(),
    queryFn:  () => profileApi.getMe(),
    select:   (res) => res.user,
  });
};

// ─── POST /profile/complete ───────────────────────────────────────────────────

export const useCompleteProfile = () => {
  return useMutation({
    mutationFn: (payload: CompleteProfileDto) =>
      profileApi.completeProfile(payload),
    onSuccess: async (data) => {
      // Keep SecureStore user in sync after profile completion
      if (data.user) {
        await tokenStore.setUser(data.user);
        queryClient.setQueryData(queryKeys.user.me(), { user: data.user });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: (err) => {
      console.error('[useCompleteProfile] failed:', err);
    },
  });
};

// ─── PATCH /profile/edit ──────────────────────────────────────────────────────

export const useEditProfile = () => {
  return useMutation({
    mutationFn: (payload: EditProfileDto) =>
      profileApi.editProfile(payload),
    onSuccess: async (data) => {
      // Keep SecureStore user in sync after profile edit
      if (data.user) {
        await tokenStore.setUser(data.user);
        queryClient.setQueryData(queryKeys.user.me(), { user: data.user });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: (err) => {
      console.error('[useEditProfile] failed:', err);
    },
  });
};