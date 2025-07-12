import { getStockHistoricalData } from './api'

interface MarketPerformance {
  date: string
  sp500Return: number
  nasdaqReturn: number
  dowReturn: number
}

interface CorrelationResult {
  correlation: number
  rSquared: number
  beta: number
  alpha: number
  sharpeRatio: number
}

// Cache for market data
const marketDataCache = new Map<string, { data: MarketPerformance[]; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Get market performance data for correlation analysis
export const getMarketPerformance = async (startDate: string, endDate: string): Promise<MarketPerformance[]> => {
  try {
    const cacheKey = `${startDate}_${endDate}`
    const cached = marketDataCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // Get historical data for major indices
    const [sp500Data, nasdaqData, dowData] = await Promise.all([
      getStockHistoricalData('SPY', 365),
      getStockHistoricalData('QQQ', 365),
      getStockHistoricalData('DIA', 365)
    ])

    const marketPerformance: MarketPerformance[] = []
    const dateMap = new Map<string, MarketPerformance>()

    // Process SP500 data
    sp500Data.forEach((day, index) => {
      if (index > 0) {
        const prevClose = sp500Data[index - 1].close
        const currentClose = day.close
        const return_ = ((currentClose - prevClose) / prevClose) * 100

        const performance: MarketPerformance = {
          date: day.date,
          sp500Return: return_,
          nasdaqReturn: 0,
          dowReturn: 0
        }
        dateMap.set(day.date, performance)
      }
    })

    // Add NASDAQ returns
    nasdaqData.forEach((day, index) => {
      if (index > 0) {
        const prevClose = nasdaqData[index - 1].close
        const currentClose = day.close
        const return_ = ((currentClose - prevClose) / prevClose) * 100

        const existing = dateMap.get(day.date)
        if (existing) {
          existing.nasdaqReturn = return_
        }
      }
    })

    // Add DOW returns
    dowData.forEach((day, index) => {
      if (index > 0) {
        const prevClose = dowData[index - 1].close
        const currentClose = day.close
        const return_ = ((currentClose - prevClose) / prevClose) * 100

        const existing = dateMap.get(day.date)
        if (existing) {
          existing.dowReturn = return_
        }
      }
    })

    // Convert to array and filter by date range
    const allPerformance = Array.from(dateMap.values())
    const filteredPerformance = allPerformance.filter(perf => {
      const perfDate = new Date(perf.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return perfDate >= start && perfDate <= end
    })

    // Cache the result
    marketDataCache.set(cacheKey, { data: filteredPerformance, timestamp: Date.now() })

    return filteredPerformance
  } catch (error) {
    console.error('[Market Correlation] Error fetching market performance:', error)
    return []
  }
}

// Calculate correlation between two arrays
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((sum, val) => sum + val, 0)
  const sumY = y.reduce((sum, val) => sum + val, 0)
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0)
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

// Calculate R-squared (coefficient of determination)
const calculateRSquared = (correlation: number): number => {
  return correlation * correlation
}

// Calculate beta (market sensitivity)
const calculateBeta = (tradeReturns: number[], marketReturns: number[]): number => {
  if (tradeReturns.length !== marketReturns.length || tradeReturns.length === 0) return 0

  const correlation = calculateCorrelation(tradeReturns, marketReturns)
  const tradeStdDev = calculateStandardDeviation(tradeReturns)
  const marketStdDev = calculateStandardDeviation(marketReturns)

  return correlation * (tradeStdDev / marketStdDev)
}

// Calculate alpha (excess return)
const calculateAlpha = (tradeReturns: number[], marketReturns: number[], beta: number): number => {
  if (tradeReturns.length !== marketReturns.length || tradeReturns.length === 0) return 0

  const avgTradeReturn = tradeReturns.reduce((sum, val) => sum + val, 0) / tradeReturns.length
  const avgMarketReturn = marketReturns.reduce((sum, val) => sum + val, 0) / marketReturns.length

  return avgTradeReturn - (beta * avgMarketReturn)
}

// Calculate Sharpe ratio
const calculateSharpeRatio = (returns: number[], riskFreeRate: number = 0.02): number => {
  if (returns.length === 0) return 0

  const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length
  const stdDev = calculateStandardDeviation(returns)

  return stdDev === 0 ? 0 : (avgReturn - riskFreeRate) / stdDev
}

// Calculate standard deviation
const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length

  return Math.sqrt(avgSquaredDiff)
}

// Calculate correlation between Pelosi trades and market performance
export const calculateTradeMarketCorrelation = async (
  trades: any[],
  startDate: string,
  endDate: string
): Promise<CorrelationResult> => {
  try {
    if (trades.length === 0) {
      return {
        correlation: 0,
        rSquared: 0,
        beta: 0,
        alpha: 0,
        sharpeRatio: 0
      }
    }

    // Get market performance data
    const marketData = await getMarketPerformance(startDate, endDate)
    if (marketData.length === 0) {
      return {
        correlation: 0,
        rSquared: 0,
        beta: 0,
        alpha: 0,
        sharpeRatio: 0
      }
    }

    // Calculate daily trade returns
    const tradeReturns: number[] = []
    const marketReturns: number[] = []
    const tradeDates = new Set(trades.map(trade => trade.tradeDate.split('T')[0]))

    // Match trade dates with market performance
    marketData.forEach(day => {
      if (tradeDates.has(day.date)) {
        // Calculate average market return for the day
        const avgMarketReturn = (day.sp500Return + day.nasdaqReturn + day.dowReturn) / 3
        marketReturns.push(avgMarketReturn)

        // Find trades for this date and calculate average return
        const dayTrades = trades.filter(trade => trade.tradeDate.startsWith(day.date))
        if (dayTrades.length > 0) {
          const avgTradeReturn = dayTrades.reduce((sum, trade) => sum + trade.profitLossPercent, 0) / dayTrades.length
          tradeReturns.push(avgTradeReturn)
        } else {
          tradeReturns.push(0)
        }
      }
    })

    if (tradeReturns.length === 0) {
      return {
        correlation: 0,
        rSquared: 0,
        beta: 0,
        alpha: 0,
        sharpeRatio: 0
      }
    }

    // Calculate correlation metrics
    const correlation = calculateCorrelation(tradeReturns, marketReturns)
    const rSquared = calculateRSquared(correlation)
    const beta = calculateBeta(tradeReturns, marketReturns)
    const alpha = calculateAlpha(tradeReturns, marketReturns, beta)
    const sharpeRatio = calculateSharpeRatio(tradeReturns)

    return {
      correlation,
      rSquared,
      beta,
      alpha,
      sharpeRatio
    }
  } catch (error) {
    console.error('[Market Correlation] Error calculating correlation:', error)
    return {
      correlation: 0,
      rSquared: 0,
      beta: 0,
      alpha: 0,
      sharpeRatio: 0
    }
  }
}

// Calculate market timing accuracy
export const calculateMarketTimingAccuracy = async (
  trades: any[],
  startDate: string,
  endDate: string
): Promise<{
  accuracy: number
  averageReturn: number
  marketOutperformance: number
}> => {
  try {
    if (trades.length === 0) {
      return {
        accuracy: 0,
        averageReturn: 0,
        marketOutperformance: 0
      }
    }

    const marketData = await getMarketPerformance(startDate, endDate)
    if (marketData.length === 0) {
      return {
        accuracy: 0,
        averageReturn: 0,
        marketOutperformance: 0
      }
    }

    let correctTiming = 0
    let totalTrades = 0
    let totalTradeReturn = 0
    let totalMarketReturn = 0

    trades.forEach(trade => {
      const tradeDate = trade.tradeDate.split('T')[0]
      const marketDay = marketData.find(day => day.date === tradeDate)
      
      if (marketDay) {
        const marketReturn = (marketDay.sp500Return + marketDay.nasdaqReturn + marketDay.dowReturn) / 3
        
        // Check if trade timing was correct
        if ((trade.profitLossPercent > 0 && marketReturn > 0) || 
            (trade.profitLossPercent < 0 && marketReturn < 0)) {
          correctTiming++
        }
        
        totalTrades++
        totalTradeReturn += trade.profitLossPercent
        totalMarketReturn += marketReturn
      }
    })

    const accuracy = totalTrades > 0 ? (correctTiming / totalTrades) * 100 : 0
    const averageReturn = totalTrades > 0 ? totalTradeReturn / totalTrades : 0
    const marketOutperformance = totalTrades > 0 ? 
      (totalTradeReturn / totalTrades) - (totalMarketReturn / totalTrades) : 0

    return {
      accuracy,
      averageReturn,
      marketOutperformance
    }
  } catch (error) {
    console.error('[Market Correlation] Error calculating market timing:', error)
    return {
      accuracy: 0,
      averageReturn: 0,
      marketOutperformance: 0
    }
  }
}

// Clear market data cache
export const clearMarketDataCache = (): void => {
  marketDataCache.clear()
}

// Get cache statistics
export const getMarketDataCacheStats = (): {
  size: number
  keys: string[]
} => {
  return {
    size: marketDataCache.size,
    keys: Array.from(marketDataCache.keys())
  }
} 