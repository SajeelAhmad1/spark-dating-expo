// src/features/profile/hooks.ts
import { useMutation } from '@tanstack/react-query';
import { profileApi } from './api';
import { CompleteProfileDto } from './schema';
import { queryClient } from '@/utils/queryClient';
import { queryKeys } from '@/api/endpoints';

export const useCompleteProfile = () => {
  return useMutation({
    mutationFn: (payload: CompleteProfileDto) =>
      profileApi.completeProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
    onError: (err) => {
      console.log('Profile update failed:', err);
    },
  });
};
