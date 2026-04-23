import { useQuery } from '@tanstack/react-query'
import { usersApi } from './api'

export const useGetUserById = (userId: string | null | undefined) =>
  useQuery({
    queryKey:  ['users', userId],
    queryFn:   () => usersApi.getUserById(userId!),
    enabled:   !!userId,
    staleTime: 1000 * 60 * 5,
    select:    (res) => res.user,
  })