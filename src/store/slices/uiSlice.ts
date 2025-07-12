import { StateCreator } from 'zustand'
import { Stock } from '../../types'

export interface UISlice {
  isLoading: boolean
  selectedStock: Stock | null
  error: string | null
  marketData: Stock[]
  setSelectedStock: (stock: Stock | null) => void
  setMarketData: (data: Stock[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isLoading: false,
  selectedStock: null,
  error: null,
  marketData: [],

  setSelectedStock: (stock) => set({ selectedStock: stock }),
  
  setMarketData: (data) => set({ marketData: data }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}) 