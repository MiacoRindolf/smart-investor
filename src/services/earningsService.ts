import axios from 'axios'

interface EarningsEvent {
  symbol: string
  companyName: string
  earningsDate: string
  estimatedEPS?: number
  actualEPS?: number
  surprise?: number
  surprisePercent?: number
  fiscalQuarter?: string
  fiscalYear?: number
}

interface EarningsCalendar {
  symbol: string
  events: EarningsEvent[]
}

// Cache for earnings data to avoid repeated API calls
const earningsCache = new Map<string, { data: EarningsEvent[]; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Get earnings calendar for a specific symbol
export const getEarningsCalendar = async (symbol: string): Promise<EarningsEvent[]> => {
  try {
    // Check cache first
    const cached = earningsCache.get(symbol)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // Try multiple data sources
    const sources = [
      () => fetchFromAlphaVantage(symbol),
      () => fetchFromYahooFinance(symbol),
      () => fetchFromEarningsWhisper(symbol)
    ]

    for (const source of sources) {
      try {
        const events = await source()
        if (events && events.length > 0) {
          // Cache the result
          earningsCache.set(symbol, { data: events, timestamp: Date.now() })
          return events
        }
      } catch (error) {
        console.warn(`[Earnings] Failed to fetch from source for ${symbol}:`, error)
        continue
      }
    }

    return []
  } catch (error) {
    console.error(`[Earnings] Error fetching earnings calendar for ${symbol}:`, error)
    return []
  }
}

// Get upcoming earnings for multiple symbols
export const getUpcomingEarnings = async (symbols: string[]): Promise<EarningsEvent[]> => {
  try {
    const allEvents: EarningsEvent[] = []
    
    // Fetch earnings for each symbol
    const promises = symbols.map(symbol => getEarningsCalendar(symbol))
    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allEvents.push(...result.value)
      }
    })
    
    // Filter for upcoming earnings (within next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    return allEvents.filter(event => {
      const earningsDate = new Date(event.earningsDate)
      return earningsDate <= thirtyDaysFromNow && earningsDate >= new Date()
    }).sort((a, b) => new Date(a.earningsDate).getTime() - new Date(b.earningsDate).getTime())
  } catch (error) {
    console.error('[Earnings] Error fetching upcoming earnings:', error)
    return []
  }
}

// Check if a trade is pre-earnings (within 30 days of earnings)
export const isPreEarningsTrade = async (symbol: string, tradeDate: string): Promise<boolean> => {
  try {
    const earnings = await getEarningsCalendar(symbol)
    const tradeDateTime = new Date(tradeDate).getTime()
    
    return earnings.some(event => {
      const earningsDate = new Date(event.earningsDate).getTime()
      const daysDifference = Math.abs(earningsDate - tradeDateTime) / (1000 * 60 * 60 * 24)
      return daysDifference <= 30
    })
  } catch (error) {
    console.warn(`[Earnings] Error checking pre-earnings for ${symbol}:`, error)
    return false
  }
}

// Data source implementations
const fetchFromAlphaVantage = async (symbol: string): Promise<EarningsEvent[]> => {
  try {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
    if (!apiKey || apiKey === 'demo') {
      throw new Error('Alpha Vantage API key not configured')
    }

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'EARNINGS_CALENDAR',
        symbol,
        horizon: '3month',
        apikey: apiKey
      }
    })

    if (response.data.Information || response.data.Note) {
      throw new Error('Alpha Vantage rate limit reached')
    }

    // Alpha Vantage returns CSV data for earnings calendar
    if (response.data && typeof response.data === 'string') {
      const lines = response.data.split('\n')
      const events: EarningsEvent[] = []
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim()
        if (line) {
          const columns = line.split(',')
          if (columns.length >= 4) {
            events.push({
              symbol: columns[0],
              companyName: columns[1],
              earningsDate: columns[2],
              estimatedEPS: parseFloat(columns[3]) || undefined,
              actualEPS: parseFloat(columns[4]) || undefined,
              surprise: parseFloat(columns[5]) || undefined,
              surprisePercent: parseFloat(columns[6]) || undefined
            })
          }
        }
      }
      
      return events
    }

    return []
  } catch (error) {
    throw new Error(`Alpha Vantage: ${error}`)
  }
}

const fetchFromYahooFinance = async (symbol: string): Promise<EarningsEvent[]> => {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      params: {
        interval: '1d',
        range: '1y',
        includePrePost: false,
        events: 'div,earn'
      }
    })

    if (!response.data.chart.result || response.data.chart.result.length === 0) {
      return []
    }

    const result = response.data.chart.result[0]
    const events: EarningsEvent[] = []

    if (result.events && result.events.earnings) {
      const earnings = result.events.earnings.earnings
      Object.keys(earnings).forEach(timestamp => {
        const earning = earnings[timestamp]
        events.push({
          symbol,
          companyName: result.meta.symbol,
          earningsDate: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
          estimatedEPS: earning.epsEstimate,
          actualEPS: earning.epsActual,
          surprise: earning.epsDifference,
          surprisePercent: earning.surprisePercent,
          fiscalQuarter: earning.quarter,
          fiscalYear: earning.year
        })
      })
    }

    return events
  } catch (error) {
    throw new Error(`Yahoo Finance: ${error}`)
  }
}

const fetchFromEarningsWhisper = async (symbol: string): Promise<EarningsEvent[]> => {
  try {
    // Earnings Whisper is a popular earnings calendar service
    // This would require an API key and subscription
    const apiKey = import.meta.env.VITE_EARNINGS_WHISPER_API_KEY
    if (!apiKey) {
      throw new Error('Earnings Whisper API key not configured')
    }

    const response = await axios.get(`https://api.earningswhispers.com/v1/calendar`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: {
        symbol,
        limit: 10
      }
    })

    if (!response.data || !response.data.earnings) {
      return []
    }

    return response.data.earnings.map((earning: any) => ({
      symbol: earning.symbol,
      companyName: earning.company,
      earningsDate: earning.date,
      estimatedEPS: earning.epsEstimate,
      actualEPS: earning.epsActual,
      surprise: earning.surprise,
      surprisePercent: earning.surprisePercent,
      fiscalQuarter: earning.quarter,
      fiscalYear: earning.year
    }))
  } catch (error) {
    throw new Error(`Earnings Whisper: ${error}`)
  }
}

// Get earnings surprise analysis for a symbol
export const getEarningsSurprise = async (symbol: string): Promise<{
  averageSurprise: number
  positiveSurprises: number
  totalEarnings: number
  surpriseRate: number
}> => {
  try {
    const earnings = await getEarningsCalendar(symbol)
    
    if (earnings.length === 0) {
      return {
        averageSurprise: 0,
        positiveSurprises: 0,
        totalEarnings: 0,
        surpriseRate: 0
      }
    }

    const surprises = earnings
      .filter(event => event.surprise !== undefined)
      .map(event => event.surprise!)

    const positiveSurprises = surprises.filter(surprise => surprise > 0).length
    const averageSurprise = surprises.length > 0 ? 
      surprises.reduce((sum, surprise) => sum + surprise, 0) / surprises.length : 0
    const surpriseRate = surprises.length > 0 ? (positiveSurprises / surprises.length) * 100 : 0

    return {
      averageSurprise,
      positiveSurprises,
      totalEarnings: earnings.length,
      surpriseRate
    }
  } catch (error) {
    console.error(`[Earnings] Error getting earnings surprise for ${symbol}:`, error)
    return {
      averageSurprise: 0,
      positiveSurprises: 0,
      totalEarnings: 0,
      surpriseRate: 0
    }
  }
}

// Clear earnings cache (useful for testing or manual refresh)
export const clearEarningsCache = (): void => {
  earningsCache.clear()
}

// Get cache statistics
export const getEarningsCacheStats = (): {
  size: number
  symbols: string[]
} => {
  return {
    size: earningsCache.size,
    symbols: Array.from(earningsCache.keys())
  }
} 