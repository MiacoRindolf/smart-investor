import { StateCreator } from 'zustand'
import { Position, Portfolio } from '../../types'

export interface PortfolioSlice {
  portfolio: Portfolio
  updatePortfolio: (portfolio: Portfolio) => void
  addPosition: (position: Position) => void
  removePosition: (symbol: string) => void
  updatePosition: (symbol: string, updates: Partial<Position>) => void
  calculatePortfolioMetrics: () => void
}

export const createPortfolioSlice: StateCreator<PortfolioSlice> = (set, get) => ({
  portfolio: {
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    cash: 0,
    positions: []
  },

  updatePortfolio: (portfolio) => set({ portfolio }),

  addPosition: (position) => {
    set((state) => {
      const existingIndex = state.portfolio.positions.findIndex(p => p.symbol === position.symbol)
      let newPositions = [...state.portfolio.positions]
      
      if (existingIndex >= 0) {
        // Update existing position
        newPositions[existingIndex] = position
      } else {
        // Add new position
        newPositions.push(position)
      }

      const newPortfolio = {
        ...state.portfolio,
        positions: newPositions
      }

      // Recalculate metrics
      const totalValue = newPositions.reduce((sum, pos) => sum + pos.value, 0) + newPortfolio.cash
      const totalGainLoss = newPositions.reduce((sum, pos) => sum + pos.gainLoss, 0)
      const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

      return {
        portfolio: {
          ...newPortfolio,
          totalValue,
          totalGainLoss,
          totalGainLossPercent
        }
      }
    })
  },

  removePosition: (symbol) => {
    set((state) => {
      const newPositions = state.portfolio.positions.filter(p => p.symbol !== symbol)
      const totalValue = newPositions.reduce((sum, pos) => sum + pos.value, 0) + state.portfolio.cash
      const totalGainLoss = newPositions.reduce((sum, pos) => sum + pos.gainLoss, 0)
      const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

      return {
        portfolio: {
          ...state.portfolio,
          positions: newPositions,
          totalValue,
          totalGainLoss,
          totalGainLossPercent
        }
      }
    })
  },

  updatePosition: (symbol, updates) => {
    set((state) => {
      const newPositions = state.portfolio.positions.map(pos => 
        pos.symbol === symbol ? { ...pos, ...updates } : pos
      )
      
      const totalValue = newPositions.reduce((sum, pos) => sum + pos.value, 0) + state.portfolio.cash
      const totalGainLoss = newPositions.reduce((sum, pos) => sum + pos.gainLoss, 0)
      const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

      return {
        portfolio: {
          ...state.portfolio,
          positions: newPositions,
          totalValue,
          totalGainLoss,
          totalGainLossPercent
        }
      }
    })
  },

  calculatePortfolioMetrics: () => {
    set((state) => {
      const totalValue = state.portfolio.positions.reduce((sum, pos) => sum + pos.value, 0) + state.portfolio.cash
      const totalGainLoss = state.portfolio.positions.reduce((sum, pos) => sum + pos.gainLoss, 0)
      const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

      return {
        portfolio: {
          ...state.portfolio,
          totalValue,
          totalGainLoss,
          totalGainLossPercent
        }
      }
    })
  }
}) 