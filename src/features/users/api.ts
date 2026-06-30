import { apiPost }  from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { GetUserByIdResponse, GetUserByIdResponseSchema } from './schema'

export const usersApi = {
  getUserById: async (userId: string): Promise<GetUserByIdResponse> => {
    const raw = await apiPost<unknown>(ENDPOINTS.USERS.GET_BY_ID, { userId })
    const payload =
      raw && typeof raw === 'object' && 'user' in raw
        ? raw
        : { user: raw }
    return GetUserByIdResponseSchema.parse(payload)
  },
}