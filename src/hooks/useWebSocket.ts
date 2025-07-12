import { useEffect, useRef, useCallback, useState } from 'react'
import { websocketService, PriceUpdate } from '../services/websocketService'

interface UseWebSocketOptions {
  autoConnect?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStats, setConnectionStats] = useState(websocketService.getConnectionStats())
  const connectionPromise = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (autoConnect && !connectionPromise.current) {
      connectionPromise.current = websocketService.connect()
        .then(() => {
          setIsConnected(true)
          setConnectionStats(websocketService.getConnectionStats())
          onConnect?.()
        })
        .catch((error) => {
          console.error('WebSocket connection failed:', error)
          setIsConnected(false)
          onError?.(error)
        })
    }

    // Update connection stats periodically
    const interval = setInterval(() => {
      setConnectionStats(websocketService.getConnectionStats())
      setIsConnected(websocketService.isConnected())
    }, 5000)

    return () => {
      clearInterval(interval)
      if (!autoConnect) {
        websocketService.disconnect()
        setIsConnected(false)
        onDisconnect?.()
      }
    }
  }, [autoConnect, onConnect, onDisconnect, onError])

  const connect = useCallback(async () => {
    try {
      await websocketService.connect()
      setIsConnected(true)
      onConnect?.()
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }, [onConnect, onError])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
    setIsConnected(false)
    onDisconnect?.()
  }, [onDisconnect])

  return {
    isConnected,
    connectionStats,
    connect,
    disconnect,
    websocketService
  }
}

interface UseStockSubscriptionOptions {
  enabled?: boolean
  onUpdate?: (data: PriceUpdate) => void
  onError?: (error: Error) => void
}

export const useStockSubscription = (
  symbol: string | null,
  options: UseStockSubscriptionOptions = {}
) => {
  const { enabled = true, onUpdate, onError } = options
  const [data, setData] = useState<PriceUpdate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!symbol || !enabled) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe to stock updates
    const unsubscribe = websocketService.subscribeToStock(symbol, (update) => {
      setData(update)
      setLoading(false)
      onUpdate?.(update)
    })

    // Get initial snapshot
    websocketService.getSnapshot(symbol)
      .then((snapshot) => {
        if (snapshot) {
          setData(snapshot)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(`Failed to get snapshot for ${symbol}:`, err)
        setError(err)
        setLoading(false)
        onError?.(err)
      })

    return () => {
      unsubscribe()
    }
  }, [symbol, enabled, onUpdate, onError])

  return { data, loading, error }
}

interface UseMultipleStockSubscriptionOptions {
  enabled?: boolean
  onUpdate?: (data: PriceUpdate) => void
  onError?: (error: Error) => void
}

export const useMultipleStockSubscription = (
  symbols: string[],
  options: UseMultipleStockSubscriptionOptions = {}
) => {
  const { enabled = true, onUpdate, onError } = options
  const [data, setData] = useState<Map<string, PriceUpdate>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (symbols.length === 0 || !enabled) {
      setData(new Map())
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const updateMap = new Map<string, PriceUpdate>()

    // Subscribe to multiple stocks
    const unsubscribe = websocketService.subscribeToMultiple(symbols, (update) => {
      updateMap.set(update.symbol, update)
      setData(new Map(updateMap))
      setLoading(false)
      onUpdate?.(update)
    })

    // Get initial snapshots
    Promise.all(
      symbols.map(symbol =>
        websocketService.getSnapshot(symbol)
          .then(snapshot => {
            if (snapshot) {
              updateMap.set(symbol, snapshot)
            }
          })
          .catch(err => {
            console.error(`Failed to get snapshot for ${symbol}:`, err)
          })
      )
    ).finally(() => {
      setData(new Map(updateMap))
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [JSON.stringify(symbols), enabled, onUpdate, onError])

  return { data, loading, error }
}

// Hook for market status
export const useMarketStatus = () => {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    websocketService.getMarketStatus()
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false))

    // Update market status every minute
    const interval = setInterval(() => {
      websocketService.getMarketStatus()
        .then(setStatus)
        .catch(console.error)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return { status, loading }
}