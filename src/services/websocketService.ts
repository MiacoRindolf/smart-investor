import { io, Socket } from 'socket.io-client'
import { Stock } from '../types'

interface PriceUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

interface WebSocketConfig {
  url: string
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

class WebSocketService {
  private socket: Socket | null = null
  private subscribers: Map<string, Set<(data: PriceUpdate) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private connectionPromise: Promise<void> | null = null

  constructor(private config: WebSocketConfig = { url: import.meta.env.VITE_WS_URL || 'http://localhost:4000' }) {
    this.maxReconnectAttempts = config.reconnectionAttempts || 5
    this.reconnectDelay = config.reconnectionDelay || 1000
  }

  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        })

        this.setupEventListeners()
        
        this.socket.on('connect', () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        })

        this.socket.on('connect_error', (error: Error) => {
          console.error('WebSocket connection error:', error)
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect to WebSocket server'))
          }
        })
      } catch (error) {
        reject(error)
      }
    })

    return this.connectionPromise
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Handle price updates
    this.socket.on('price-update', (data: PriceUpdate) => {
      this.notifySubscribers(data.symbol, data)
    })

    // Handle batch updates
    this.socket.on('batch-update', (updates: PriceUpdate[]) => {
      updates.forEach(update => {
        this.notifySubscribers(update.symbol, update)
      })
    })

    // Handle errors
    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error)
    })

    // Handle disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason)
      this.stopHeartbeat()
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt reconnection
        this.reconnect()
      }
    })

    // Handle reconnection
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts')
      this.resubscribeAll()
    })
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { timestamp: new Date().toISOString() })
      }
    }, 30000) // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private notifySubscribers(symbol: string, data: PriceUpdate): void {
    const callbacks = this.subscribers.get(symbol)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in price update callback:', error)
        }
      })
    }
  }

  subscribeToStock(symbol: string, callback: (data: PriceUpdate) => void): () => void {
    // Initialize subscribers set if not exists
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
      
      // Subscribe on server only if connected
      if (this.socket?.connected) {
        this.socket.emit('subscribe', { symbol })
      }
    }

    // Add callback to subscribers
    this.subscribers.get(symbol)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(symbol)
      if (callbacks) {
        callbacks.delete(callback)
        
        // If no more subscribers for this symbol, unsubscribe from server
        if (callbacks.size === 0) {
          this.subscribers.delete(symbol)
          if (this.socket?.connected) {
            this.socket.emit('unsubscribe', { symbol })
          }
        }
      }
    }
  }

  subscribeToMultiple(symbols: string[], callback: (data: PriceUpdate) => void): () => void {
    const unsubscribers = symbols.map(symbol => 
      this.subscribeToStock(symbol, callback)
    )

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }

  private resubscribeAll(): void {
    if (!this.socket?.connected) return

    const symbols = Array.from(this.subscribers.keys())
    if (symbols.length > 0) {
      this.socket.emit('subscribe-multiple', { symbols })
    }
  }

  async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

    console.log(`Attempting to reconnect... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    this.connectionPromise = null
    await this.connect()
  }

  disconnect(): void {
    this.stopHeartbeat()
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.subscribers.clear()
    this.connectionPromise = null
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Advanced features
  
  async getSnapshot(symbol: string): Promise<PriceUpdate | null> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Snapshot request timeout'))
      }, 5000)

      this.socket!.emit('get-snapshot', { symbol }, (response: any) => {
        clearTimeout(timeout)
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.data)
        }
      })
    })
  }

  async getMarketStatus(): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Market status request timeout'))
      }, 5000)

      this.socket!.emit('market-status', (response: any) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })
  }

  // Set custom update frequency
  setUpdateFrequency(frequency: 'realtime' | '1s' | '5s' | '15s' | '30s' | '1m'): void {
    if (this.socket?.connected) {
      this.socket.emit('set-frequency', { frequency })
    }
  }

  // Get connection statistics
  getConnectionStats(): {
    connected: boolean
    reconnectAttempts: number
    subscribedSymbols: string[]
    latency: number | null
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      subscribedSymbols: Array.from(this.subscribers.keys()),
      latency: null // TODO: Implement latency measurement
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()

// Export class for testing
export { WebSocketService }

// Export types
export type { PriceUpdate, WebSocketConfig }