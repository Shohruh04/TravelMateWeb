import { useState, useEffect, useCallback } from 'react'
import { ApiError } from '@/utils/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseApiOptions {
  immediate?: boolean
}

/**
 * Custom hook for API calls with loading and error states
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useApi(() => api.destinations.getPopular())
 *
 * // Manual execution
 * const handleClick = () => execute()
 *
 * // Automatic execution on mount
 * const { data, loading, error } = useApi(() => api.destinations.getPopular(), { immediate: true })
 * ```
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & { execute: () => Promise<void>; reset: () => void } {
  const { immediate = false } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiFunction()
      setState({ data: result, loading: false, error: null })
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('An unexpected error occurred')
      setState({ data: null, loading: false, error })
    }
  }, [apiFunction])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { ...state, execute, reset }
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 *
 * @example
 * ```tsx
 * const { mutate, loading, error } = useMutation((data) => api.user.updateProfile(data))
 *
 * const handleSubmit = async (formData) => {
 *   await mutate(formData)
 *   // Handle success
 * }
 * ```
 */
export function useMutation<T, P = unknown>(
  mutationFunction: (params: P) => Promise<T>
): {
  mutate: (params: P) => Promise<T | null>
  loading: boolean
  error: ApiError | null
  reset: () => void
} {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await mutationFunction(params)
        setLoading(false)
        return result
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('An unexpected error occurred')
        setError(apiError)
        setLoading(false)
        return null
      }
    },
    [mutationFunction]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return { mutate, loading, error, reset }
}
