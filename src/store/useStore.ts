import { create } from 'zustand'
import { Stock } from '../types'
import { createPortfolioSlice, PortfolioSlice } from './slices/portfolioSlice'
import { createWatchlistSlice, WatchlistSlice } from './slices/watchlistSlice'
import { createUISlice, UISlice } from './slices/uiSlice'
import { createSearchSlice, SearchSlice } from './slices/searchSlice'

// Combined store state
export interface StoreState extends 
  PortfolioSlice, 
  WatchlistSlice, 
  UISlice, 
  SearchSlice {}

// Re-export types for convenience
export type { Stock, Position, Portfolio } from '../types'

export const useStore = create<StoreState>((set, get, store) => ({
  ...createPortfolioSlice(set, get, store),
  ...createWatchlistSlice(set, get, store),
  ...createUISlice(set, get, store),
  ...createSearchSlice(set, get, store)
})) 