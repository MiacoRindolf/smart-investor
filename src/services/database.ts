import { StockQuote, MarketIndex, NewsItem } from '../types'

interface HistoricalPrice {
  id?: number
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
  source: 'live' | 'cached'
}

interface CachedData {
  id?: number
  key: string
  data: any
  timestamp: number
  expiry: number
}

class DatabaseService {
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'SmartInvestorDB'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Historical prices store
        if (!db.objectStoreNames.contains('historical_prices')) {
          const priceStore = db.createObjectStore('historical_prices', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          priceStore.createIndex('symbol', 'symbol', { unique: false })
          priceStore.createIndex('timestamp', 'timestamp', { unique: false })
          priceStore.createIndex('symbol_timestamp', ['symbol', 'timestamp'], { unique: false })
        }

        // Cache store for API responses
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { 
            keyPath: 'key' 
          })
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Market indices historical data
        if (!db.objectStoreNames.contains('market_indices')) {
          const indexStore = db.createObjectStore('market_indices', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          indexStore.createIndex('symbol', 'symbol', { unique: false })
          indexStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // News archive
        if (!db.objectStoreNames.contains('news_archive')) {
          const newsStore = db.createObjectStore('news_archive', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          newsStore.createIndex('timestamp', 'timestamp', { unique: false })
          newsStore.createIndex('sentiment', 'sentiment', { unique: false })
        }
      }
    })
  }

  // Historical Prices Methods
  async saveStockPrice(quote: StockQuote, source: 'live' | 'cached' = 'live'): Promise<void> {
    if (!this.db) await this.init()

    const price: HistoricalPrice = {
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      timestamp: Date.now(),
      source
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices'], 'readwrite')
      const store = transaction.objectStore('historical_prices')
      const request = store.add(price)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getLatestPrice(symbol: string): Promise<HistoricalPrice | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices'], 'readonly')
      const store = transaction.objectStore('historical_prices')
      const index = store.index('symbol_timestamp')
      
      // Get latest entry for this symbol
      const request = index.openCursor(
        IDBKeyRange.bound([symbol, 0], [symbol, Date.now()]),
        'prev'
      )

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          resolve(cursor.value)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getPriceHistory(symbol: string, days: number = 30): Promise<HistoricalPrice[]> {
    if (!this.db) await this.init()

    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices'], 'readonly')
      const store = transaction.objectStore('historical_prices')
      const index = store.index('symbol_timestamp')
      
      const request = index.getAll(
        IDBKeyRange.bound([symbol, cutoff], [symbol, Date.now()])
      )

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllSymbols(): Promise<string[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices'], 'readonly')
      const store = transaction.objectStore('historical_prices')
      const request = store.getAll()

      request.onsuccess = () => {
        const symbols = new Set<string>()
        request.result.forEach(price => symbols.add(price.symbol))
        resolve(Array.from(symbols))
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Cache Methods
  async setCache(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) await this.init()

    const cached: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put(cached)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCache(key: string): Promise<any | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiry > Date.now()) {
          resolve(result.data)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Market Indices Methods
  async saveMarketIndex(index: MarketIndex): Promise<void> {
    if (!this.db) await this.init()

    const data = {
      ...index,
      timestamp: Date.now()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['market_indices'], 'readwrite')
      const store = transaction.objectStore('market_indices')
      const request = store.add(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getLatestMarketIndices(): Promise<MarketIndex[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['market_indices'], 'readonly')
      const store = transaction.objectStore('market_indices')
      const index = store.index('timestamp')
      
      const request = index.openCursor(null, 'prev')
      const latestIndices: { [symbol: string]: MarketIndex } = {}

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const data = cursor.value
          if (!latestIndices[data.symbol]) {
            latestIndices[data.symbol] = data
          }
          cursor.continue()
        } else {
          resolve(Object.values(latestIndices))
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // News Archive Methods
  async saveNews(news: NewsItem[]): Promise<void> {
    if (!this.db) await this.init()

    const newsWithTimestamp = news.map(item => ({
      ...item,
      timestamp: Date.now()
    }))

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['news_archive'], 'readwrite')
      const store = transaction.objectStore('news_archive')
      
      let completed = 0
      newsWithTimestamp.forEach(item => {
        const request = store.add(item)
        request.onsuccess = () => {
          completed++
          if (completed === newsWithTimestamp.length) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async getLatestNews(limit: number = 20): Promise<NewsItem[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['news_archive'], 'readonly')
      const store = transaction.objectStore('news_archive')
      const index = store.index('timestamp')
      
      const request = index.openCursor(null, 'prev')
      const news: NewsItem[] = []

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && news.length < limit) {
          news.push(cursor.value)
          cursor.continue()
        } else {
          resolve(news)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Data Export Methods
  async exportPriceData(): Promise<{ prices: HistoricalPrice[], summary: any }> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices'], 'readonly')
      const store = transaction.objectStore('historical_prices')
      const request = store.getAll()

      request.onsuccess = () => {
        const prices = request.result
        
        // Generate summary statistics
        const symbols = new Set(prices.map(p => p.symbol))
        const totalRecords = prices.length
        const dateRange = prices.length > 0 ? {
          start: new Date(Math.min(...prices.map(p => p.timestamp))),
          end: new Date(Math.max(...prices.map(p => p.timestamp)))
        } : null

        const summary = {
          totalRecords,
          uniqueSymbols: symbols.size,
          symbols: Array.from(symbols),
          dateRange,
          dataPoints: {
            live: prices.filter(p => p.source === 'live').length,
            cached: prices.filter(p => p.source === 'cached').length
          }
        }

        resolve({ prices, summary })
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Database Maintenance
  async cleanupOldData(daysToKeep: number = 90): Promise<void> {
    if (!this.db) await this.init()

    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices', 'market_indices', 'news_archive'], 'readwrite')
      
      // Clean up old prices
      const priceStore = transaction.objectStore('historical_prices')
      const priceIndex = priceStore.index('timestamp')
      const priceRequest = priceIndex.openCursor(IDBKeyRange.upperBound(cutoff))

      priceRequest.onsuccess = () => {
        const cursor = priceRequest.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // Clean up old indices
      const indexStore = transaction.objectStore('market_indices')
      const indexIndex = indexStore.index('timestamp')
      const indexRequest = indexIndex.openCursor(IDBKeyRange.upperBound(cutoff))

      indexRequest.onsuccess = () => {
        const cursor = indexRequest.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // Clean up old news
      const newsStore = transaction.objectStore('news_archive')
      const newsIndex = newsStore.index('timestamp')
      const newsRequest = newsIndex.openCursor(IDBKeyRange.upperBound(cutoff))

      newsRequest.onsuccess = () => {
        const cursor = newsRequest.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getDatabaseStats(): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['historical_prices', 'market_indices', 'news_archive', 'cache'], 'readonly')
      
      const stats = {
        prices: 0,
        indices: 0,
        news: 0,
        cache: 0,
        symbols: new Set(),
        oldestRecord: null,
        newestRecord: null
      }

      let completed = 0
      const total = 4

      // Count prices
      const priceRequest = transaction.objectStore('historical_prices').count()
      priceRequest.onsuccess = () => {
        stats.prices = priceRequest.result
        completed++
        if (completed === total) resolve(stats)
      }

      // Count indices
      const indexRequest = transaction.objectStore('market_indices').count()
      indexRequest.onsuccess = () => {
        stats.indices = indexRequest.result
        completed++
        if (completed === total) resolve(stats)
      }

      // Count news
      const newsRequest = transaction.objectStore('news_archive').count()
      newsRequest.onsuccess = () => {
        stats.news = newsRequest.result
        completed++
        if (completed === total) resolve(stats)
      }

      // Count cache
      const cacheRequest = transaction.objectStore('cache').count()
      cacheRequest.onsuccess = () => {
        stats.cache = cacheRequest.result
        completed++
        if (completed === total) resolve(stats)
      }

      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export const dbService = new DatabaseService()
export default dbService 