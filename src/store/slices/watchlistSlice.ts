import { StateCreator } from 'zustand'
import { Stock } from '../../types'
import { marketAPI } from '../../services/api'

export interface WatchlistSlice {
  watchlist: Stock[]
  addToWatchlist: (stock: Stock) => Promise<void>
  removeFromWatchlist: (symbol: string) => Promise<void>
  fetchWatchlist: () => Promise<void>
  refreshStockData: (symbol: string) => Promise<void>
}

export const createWatchlistSlice: StateCreator<WatchlistSlice> = (set, get) => ({
  watchlist: [],

  addToWatchlist: async (stock: Stock) => {
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
      throw new Error('Failed to add stock to watchlist')
    }
  },

  removeFromWatchlist: async (symbol: string) => {
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
      throw new Error('Failed to remove stock from watchlist')
    }
  },

  fetchWatchlist: async () => {
    try {
      // Get watchlist symbols from localStorage
      const watchlistSymbols = JSON.parse(localStorage.getItem('smartinvestor_watchlist') || '[]')
      
      if (watchlistSymbols.length === 0) {
        set({ watchlist: [] })
        return
      }
      
      // Fetch current data for each symbol
      const watchlistPromises = watchlistSymbols.map((symbol: string) => 
        marketAPI.getStockQuote(symbol).catch(() => null)
      )
      
      const watchlistResults = await Promise.all(watchlistPromises)
      const watchlist = watchlistResults.filter((result): result is Stock => result !== null)
      
      set({ watchlist })
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
      set({ watchlist: [] })
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
    } catch (error) {
      console.error(`Failed to refresh data for ${symbol}:`, error)
      throw new Error(`Failed to refresh ${symbol} data`)
    }
  }
}) 