import { create } from 'zustand'
import { marketAPI } from '../services/api'

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
}

export interface Position {
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  gainLoss: number
  gainLossPercent: number
}

export interface Portfolio {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  cash: number
  positions: Position[]
}

interface StoreState {
  // Portfolio state
  portfolio: Portfolio
  
  // Market data
  watchlist: Stock[]
  marketData: Stock[]
  
  // UI state
  isLoading: boolean
  selectedStock: Stock | null
  error: string | null
  
  // Actions
  setSelectedStock: (stock: Stock | null) => void
  addToWatchlist: (stock: Stock) => void
  removeFromWatchlist: (symbol: string) => void
  updatePortfolio: (portfolio: Portfolio) => void
  setMarketData: (data: Stock[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // API Actions
  fetchWatchlist: () => Promise<void>
  searchStocks: (query: string) => Promise<Stock[]>
  refreshStockData: (symbol: string) => Promise<void>
  fetchPortfolio: () => Promise<void>
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  portfolio: {
    totalValue: 25000,
    totalGainLoss: 1250,
    totalGainLossPercent: 5.26,
    cash: 5000,
    positions: [
      {
        symbol: 'AAPL',
        shares: 50,
        avgPrice: 150.00,
        currentPrice: 175.00,
        value: 8750,
        gainLoss: 1250,
        gainLossPercent: 16.67
      },
      {
        symbol: 'GOOGL',
        shares: 25,
        avgPrice: 120.00,
        currentPrice: 135.00,
        value: 3375,
        gainLoss: 375,
        gainLossPercent: 12.5
      },
      {
        symbol: 'MSFT',
        shares: 30,
        avgPrice: 250.00,
        currentPrice: 275.00,
        value: 8250,
        gainLoss: 750,
        gainLossPercent: 10.0
      }
    ]
  },
  
  watchlist: [],
  marketData: [],
  isLoading: false,
  selectedStock: null,
  error: null,
  
  // Basic Actions
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  
  addToWatchlist: async (stock) => {
    try {
      // Save to localStorage
      const currentWatchlist = JSON.parse(localStorage.getItem('smartinvestor_watchlist') || '[]')
      const updatedWatchlist = [...currentWatchlist.filter((s: string) => s !== stock.symbol), stock.symbol]
      localStorage.setItem('smartinvestor_watchlist', JSON.stringify(updatedWatchlist))
      
      set((state) => ({
        watchlist: [...state.watchlist.filter(s => s.symbol !== stock.symbol), stock]
      }))
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      set({ error: 'Failed to add stock to watchlist' })
    }
  },
  
  removeFromWatchlist: async (symbol) => {
    try {
      // Remove from localStorage
      const currentWatchlist = JSON.parse(localStorage.getItem('smartinvestor_watchlist') || '[]')
      const updatedWatchlist = currentWatchlist.filter((s: string) => s !== symbol)
      localStorage.setItem('smartinvestor_watchlist', JSON.stringify(updatedWatchlist))
      
      set((state) => ({
        watchlist: state.watchlist.filter(stock => stock.symbol !== symbol)
      }))
    } catch (error) {
      console.error('Failed to remove from watchlist:', error)
      set({ error: 'Failed to remove stock from watchlist' })
    }
  },
  
  updatePortfolio: (portfolio) => set({ portfolio }),
  
  setMarketData: (data) => set({ marketData: data }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  // API Actions
  fetchWatchlist: async () => {
    set({ isLoading: true, error: null })
    try {
      // Get watchlist symbols from localStorage
      const watchlistSymbols = JSON.parse(localStorage.getItem('smartinvestor_watchlist') || '["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]')
      
      // Fetch current data for each symbol
      const watchlistPromises = watchlistSymbols.map((symbol: string) => 
        marketAPI.getStockQuote(symbol).catch(() => null)
      )
      
      const watchlistResults = await Promise.all(watchlistPromises)
      const watchlist = watchlistResults.filter(result => result !== null)
      
      set({ watchlist, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
      set({ 
        error: 'Failed to fetch watchlist. Using demo data.',
        isLoading: false,
        // Fallback to demo data
        watchlist: [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 175.23, change: 2.45, changePercent: 1.42, volume: 75234567 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 135.67, change: -1.23, changePercent: -0.90, volume: 25678901 },
          { symbol: 'MSFT', name: 'Microsoft Corp.', price: 275.89, change: 3.21, changePercent: 1.18, volume: 45123456 },
          { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -5.43, changePercent: -2.16, volume: 89456123 }
        ]
      })
    }
  },
  
  searchStocks: async (query: string): Promise<Stock[]> => {
    if (!query.trim()) return []
    
    set({ isLoading: true, error: null })
    try {
      const results = await marketAPI.searchStocks(query)
      set({ isLoading: false })
      return results
    } catch (error) {
      console.error('Stock search failed:', error)
      set({ 
        error: 'Stock search failed. Check your API key.',
        isLoading: false 
      })
      return []
    }
  },
  
  refreshStockData: async (symbol: string) => {
    try {
      const stock = await marketAPI.getStockQuote(symbol)
      
      // Update in watchlist if present
      set((state) => ({
        watchlist: state.watchlist.map(s => 
          s.symbol === symbol ? stock : s
        )
      }))
      
      // Update selected stock if it matches
      const currentSelected = get().selectedStock
      if (currentSelected && currentSelected.symbol === symbol) {
        set({ selectedStock: stock })
      }
      
    } catch (error) {
      console.error(`Failed to refresh data for ${symbol}:`, error)
      set({ error: `Failed to refresh ${symbol} data` })
    }
  },
  
  fetchPortfolio: async () => {
    set({ isLoading: true, error: null })
    try {
      // Mock portfolio data - in real app, this would fetch from API
      const portfolio = get().portfolio // Use current portfolio data
      set({ portfolio, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
      set({ 
        error: 'Failed to fetch portfolio data',
        isLoading: false 
      })
    }
  }
})) 