import { QueryClient } from '@tanstack/react-query'
import { HttpError } from '../api/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min fresh
      gcTime:    1000 * 60 * 10,  // 10 min cache (v5 — was cacheTime)
      retry: (failureCount, error) => {
        if (error instanceof HttpError && (error.isUnauthorized || error.isNotFound)) {
          return false
        }
        return failureCount < 2
      },
      refetchOnReconnect:   true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})