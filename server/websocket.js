const { Server } = require('socket.io')
const axios = require('axios')
const Redis = require('ioredis')

class WebSocketServer {
  constructor(httpServer, options = {}) {
    this.io = new Server(httpServer, {
      cors: {
        origin: options.corsOrigin || ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    })

    // Initialize Redis for caching and pub/sub
    this.redis = new Redis({
      host: options.redisHost || 'localhost',
      port: options.redisPort || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      }
    })

    this.redisPub = this.redis.duplicate()
    this.redisSub = this.redis.duplicate()

    // Price update intervals for different frequencies
    this.updateIntervals = new Map()
    this.subscribedSymbols = new Map() // symbol -> Set of socket IDs
    this.socketSubscriptions = new Map() // socket ID -> Set of symbols
    this.priceCache = new Map() // symbol -> latest price data

    // Alpha Vantage configuration
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY
    this.alphaVantageRateLimit = 5 // requests per minute for free tier
    this.alphaVantageQueue = []

    this.setupSocketHandlers()
    this.setupRedisSubscriptions()
    this.startMarketDataUpdates()
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)
      this.socketSubscriptions.set(socket.id, new Set())

      // Handle stock subscription
      socket.on('subscribe', async ({ symbol }) => {
        await this.subscribeToStock(socket, symbol)
      })

      // Handle multiple stock subscription
      socket.on('subscribe-multiple', async ({ symbols }) => {
        for (const symbol of symbols) {
          await this.subscribeToStock(socket, symbol)
        }
      })

      // Handle unsubscription
      socket.on('unsubscribe', ({ symbol }) => {
        this.unsubscribeFromStock(socket, symbol)
      })

      // Handle snapshot request
      socket.on('get-snapshot', async ({ symbol }, callback) => {
        try {
          const snapshot = await this.getStockSnapshot(symbol)
          callback({ data: snapshot })
        } catch (error) {
          callback({ error: error.message })
        }
      })

      // Handle market status request
      socket.on('market-status', async (callback) => {
        const status = await this.getMarketStatus()
        callback(status)
      })

      // Handle frequency change
      socket.on('set-frequency', ({ frequency }) => {
        socket.data.updateFrequency = frequency
      })

      // Handle heartbeat
      socket.on('heartbeat', ({ timestamp }) => {
        socket.emit('heartbeat-ack', { timestamp, serverTime: new Date().toISOString() })
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
        this.handleDisconnect(socket)
      })
    })
  }

  async subscribeToStock(socket, symbol) {
    // Add socket to symbol subscribers
    if (!this.subscribedSymbols.has(symbol)) {
      this.subscribedSymbols.set(symbol, new Set())
      // Start fetching data for this symbol
      this.startSymbolUpdates(symbol)
    }
    this.subscribedSymbols.get(symbol).add(socket.id)

    // Add symbol to socket subscriptions
    this.socketSubscriptions.get(socket.id).add(symbol)

    // Send cached data immediately if available
    const cachedData = this.priceCache.get(symbol)
    if (cachedData) {
      socket.emit('price-update', cachedData)
    } else {
      // Fetch initial data
      const data = await this.fetchStockData(symbol)
      if (data) {
        socket.emit('price-update', data)
      }
    }

    console.log(`Socket ${socket.id} subscribed to ${symbol}`)
  }

  unsubscribeFromStock(socket, symbol) {
    const symbolSubscribers = this.subscribedSymbols.get(symbol)
    if (symbolSubscribers) {
      symbolSubscribers.delete(socket.id)
      if (symbolSubscribers.size === 0) {
        this.subscribedSymbols.delete(symbol)
        this.stopSymbolUpdates(symbol)
      }
    }

    const socketSymbols = this.socketSubscriptions.get(socket.id)
    if (socketSymbols) {
      socketSymbols.delete(symbol)
    }

    console.log(`Socket ${socket.id} unsubscribed from ${symbol}`)
  }

  handleDisconnect(socket) {
    const symbols = this.socketSubscriptions.get(socket.id)
    if (symbols) {
      symbols.forEach(symbol => {
        this.unsubscribeFromStock(socket, symbol)
      })
      this.socketSubscriptions.delete(socket.id)
    }
  }

  startSymbolUpdates(symbol) {
    // Don't start if already running
    if (this.updateIntervals.has(symbol)) return

    // Update every 5 seconds during market hours, every minute otherwise
    const updateInterval = this.isMarketOpen() ? 5000 : 60000

    const interval = setInterval(async () => {
      const data = await this.fetchStockData(symbol)
      if (data) {
        this.broadcastPriceUpdate(symbol, data)
      }
    }, updateInterval)

    this.updateIntervals.set(symbol, interval)
  }

  stopSymbolUpdates(symbol) {
    const interval = this.updateIntervals.get(symbol)
    if (interval) {
      clearInterval(interval)
      this.updateIntervals.delete(symbol)
    }
  }

  async fetchStockData(symbol) {
    try {
      // First check Redis cache
      const cached = await this.redis.get(`stock:${symbol}`)
      if (cached) {
        const data = JSON.parse(cached)
        // Return cached data if less than 5 seconds old
        if (Date.now() - new Date(data.timestamp).getTime() < 5000) {
          return data
        }
      }

      // Try Yahoo Finance first (via our backend)
      try {
        const response = await axios.get(`http://localhost:4000/api/yahoo/quote/${symbol}`)
        const quote = response.data

        const priceData = {
          symbol: quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          timestamp: new Date().toISOString()
        }

        // Cache the data
        await this.redis.setex(`stock:${symbol}`, 60, JSON.stringify(priceData))
        this.priceCache.set(symbol, priceData)

        return priceData
      } catch (yahooError) {
        console.error(`Yahoo Finance error for ${symbol}:`, yahooError.message)
      }

      // Fallback to Alpha Vantage if available
      if (this.alphaVantageKey) {
        return await this.fetchFromAlphaVantage(symbol)
      }

      return null
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
      return null
    }
  }

  async fetchFromAlphaVantage(symbol) {
    // Rate limiting
    if (this.alphaVantageQueue.length >= this.alphaVantageRateLimit) {
      console.log('Alpha Vantage rate limit reached, skipping request')
      return null
    }

    this.alphaVantageQueue.push(Date.now())
    setTimeout(() => {
      this.alphaVantageQueue.shift()
    }, 60000) // Remove after 1 minute

    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.alphaVantageKey
        }
      })

      const quote = response.data['Global Quote']
      if (!quote || !quote['05. price']) {
        throw new Error('Invalid response from Alpha Vantage')
      }

      const priceData = {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: new Date().toISOString()
      }

      // Cache the data
      await this.redis.setex(`stock:${symbol}`, 60, JSON.stringify(priceData))
      this.priceCache.set(symbol, priceData)

      return priceData
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error.message)
      return null
    }
  }

  broadcastPriceUpdate(symbol, data) {
    const subscribers = this.subscribedSymbols.get(symbol)
    if (!subscribers || subscribers.size === 0) return

    // Emit to all subscribed sockets
    subscribers.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit('price-update', data)
      }
    })

    // Also publish to Redis for horizontal scaling
    this.redisPub.publish('stock-updates', JSON.stringify({ symbol, data }))
  }

  setupRedisSubscriptions() {
    // Subscribe to stock updates from other server instances
    this.redisSub.subscribe('stock-updates')
    
    this.redisSub.on('message', (channel, message) => {
      if (channel === 'stock-updates') {
        const { symbol, data } = JSON.parse(message)
        // Update local cache
        this.priceCache.set(symbol, data)
        // Broadcast to local subscribers
        this.broadcastPriceUpdate(symbol, data)
      }
    })
  }

  async getStockSnapshot(symbol) {
    // Get latest data with forced refresh
    const data = await this.fetchStockData(symbol)
    if (!data) {
      throw new Error(`Unable to fetch data for ${symbol}`)
    }
    return data
  }

  async getMarketStatus() {
    const now = new Date()
    const day = now.getDay()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes

    // NYSE hours: 9:30 AM - 4:00 PM EST (adjust for your timezone)
    const marketOpen = 9 * 60 + 30
    const marketClose = 16 * 60

    const isWeekday = day >= 1 && day <= 5
    const isDuringMarketHours = currentTime >= marketOpen && currentTime < marketClose

    const status = {
      isOpen: isWeekday && isDuringMarketHours,
      nextOpen: this.getNextMarketOpen(),
      nextClose: this.getNextMarketClose(),
      currentTime: now.toISOString()
    }

    // Cache market status
    await this.redis.setex('market:status', 60, JSON.stringify(status))

    return status
  }

  isMarketOpen() {
    const now = new Date()
    const day = now.getDay()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes

    const marketOpen = 9 * 60 + 30
    const marketClose = 16 * 60

    return day >= 1 && day <= 5 && currentTime >= marketOpen && currentTime < marketClose
  }

  getNextMarketOpen() {
    const now = new Date()
    const next = new Date(now)
    
    // Set to 9:30 AM
    next.setHours(9, 30, 0, 0)
    
    // If it's already past 9:30 AM today, move to tomorrow
    if (now > next) {
      next.setDate(next.getDate() + 1)
    }
    
    // Skip weekends
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1)
    }
    
    return next.toISOString()
  }

  getNextMarketClose() {
    const now = new Date()
    const next = new Date(now)
    
    // Set to 4:00 PM
    next.setHours(16, 0, 0, 0)
    
    // If it's already past 4:00 PM today, move to tomorrow
    if (now > next) {
      next.setDate(next.getDate() + 1)
      // Set to 9:30 AM for next open
      next.setHours(9, 30, 0, 0)
    }
    
    // Skip weekends
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1)
    }
    
    // If we moved to a new day, set to 4:00 PM
    if (next.getHours() === 9) {
      next.setHours(16, 0, 0, 0)
    }
    
    return next.toISOString()
  }

  startMarketDataUpdates() {
    // Update market indices every 30 seconds
    setInterval(async () => {
      if (this.isMarketOpen()) {
        const indices = ['SPY', 'QQQ', 'DIA', 'IWM'] // Major ETFs as market indicators
        
        const updates = await Promise.all(
          indices.map(symbol => this.fetchStockData(symbol))
        )
        
        const validUpdates = updates.filter(Boolean)
        if (validUpdates.length > 0) {
          this.io.emit('market-indices-update', validUpdates)
        }
      }
    }, 30000)
  }

  // Graceful shutdown
  async shutdown() {
    // Clear all intervals
    this.updateIntervals.forEach(interval => clearInterval(interval))
    this.updateIntervals.clear()

    // Close Redis connections
    await this.redis.quit()
    await this.redisPub.quit()
    await this.redisSub.quit()

    // Close socket.io
    await this.io.close()
  }
}

module.exports = WebSocketServer