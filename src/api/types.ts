// Wraps every backend response envelope
export type ApiResponse<T> = {
  data:    T
  message: string
  success: boolean
}

// Paginated variant
export type PaginatedResponse<T> = ApiResponse<{
  items:      T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}>