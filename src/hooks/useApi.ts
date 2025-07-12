import React, { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null
  })

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const result = await apiFunction(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null })
  }, [initialData])

  return {
    ...state,
    execute,
    reset
  }
}

// Hook for optimistic updates
export const useOptimisticUpdate = <T>(
  updateFunction: (data: T) => Promise<void>,
  rollbackFunction?: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const execute = useCallback(
    async (data: T) => {
      setIsUpdating(true)
      try {
        await updateFunction(data)
      } catch (error) {
        console.error('Optimistic update failed:', error)
        if (rollbackFunction) {
          rollbackFunction()
        }
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [updateFunction, rollbackFunction]
  )

  return { execute, isUpdating }
}

// Hook for polling
export const usePolling = <T>(
  fetchFunction: () => Promise<T>,
  interval: number = 5000,
  enabled: boolean = true
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Polling failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, enabled])

  // Set up polling
  React.useEffect(() => {
    if (!enabled) return

    fetchData() // Initial fetch
    
    const intervalId = setInterval(fetchData, interval)
    
    return () => clearInterval(intervalId)
  }, [fetchData, interval, enabled])

  return { data, loading, error, refetch: fetchData }
} 