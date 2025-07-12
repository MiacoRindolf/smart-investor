import { StateCreator } from 'zustand'
import { Stock } from '../../types'
import { marketAPI } from '../../services/api'

export interface SearchSlice {
  searchResults: Stock[]
  searchQuery: string
  isSearching: boolean
  searchError: string | null
  setSearchQuery: (query: string) => void
  searchStocks: (query: string) => Promise<Stock[]>
  clearSearch: () => void
}

export const createSearchSlice: StateCreator<SearchSlice> = (set) => ({
  searchResults: [],
  searchQuery: '',
  isSearching: false,
  searchError: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchStocks: async (query: string): Promise<Stock[]> => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false, searchError: null })
      return []
    }
    
    set({ isSearching: true, searchError: null })
    try {
      const results = await marketAPI.searchStocks(query)
      set({ searchResults: results, isSearching: false })
      return results
    } catch (error) {
      console.error('Stock search failed:', error)
      const errorMessage = 'Stock search failed. Check your API key.'
      set({ 
        searchError: errorMessage,
        isSearching: false 
      })
      return []
    }
  },

  clearSearch: () => set({ 
    searchResults: [], 
    searchQuery: '', 
    searchError: null 
  })
}) 