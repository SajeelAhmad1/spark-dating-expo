// src/features/profile/api.ts
import { ENDPOINTS } from '@/api/endpoints';
import { CompleteProfileDto, CompleteProfileDtoResponse } from './schema'
import { apiPost } from '@/api/client';

export const profileApi = {
  completeProfile: async (payload: CompleteProfileDto): Promise<CompleteProfileDtoResponse> => {
    return apiPost<CompleteProfileDtoResponse>(ENDPOINTS.USER.PROFILE_COMPLETE, payload);
  },
};