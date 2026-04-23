import { apiPost }  from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { GetUserByIdResponse, GetUserByIdResponseSchema } from './schema'

export const usersApi = {
  getUserById: async (userId: string): Promise<GetUserByIdResponse> => {
    const raw = await apiPost(ENDPOINTS.USERS.GET_BY_ID, { userId })
    return GetUserByIdResponseSchema.parse(raw)
  },
}