// src/features/profile/api.ts
import { apiPost } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { CompleteProfileDto, CompleteProfileDtoSchema } from './schema'

export const profileApi = {  
   completeProfile: async (payload: CompleteProfileDto) => {
    // POST to /api/profile/complete
    return apiPost(ENDPOINTS.USER.UPDATE('me'), payload)
  },
}