import axios from 'axios'
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../config/constants'
import { StockQuote, MarketIndex, NewsItem, PelosiTrade, PelosiAnalytics, PelosiInsights } from '../types'
import { dbService } from './database'
import { getYahooStockQuote } from './yahooFinanceService'
import { delay, getCompanyName, getIndexName, isConservationMode, logEnvironmentInfo } from '../utils/helpers'
import { isPreEarningsTrade } from './earningsService'
import { calculateTradeMarketCorrelation, calculateMarketTimingAccuracy } from './marketCorrelationService'

// Rate limiting and caching
let lastCallTime = 0
let callCount = 0

// Enhanced error handling
class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

// Helper function to check and enforce rate limits
const enforceRateLimit = async () => {
  const now = Date.now()
  const timeSinceLastCall = now - lastCallTime
  
  if (timeSinceLastCall < API_CONFIG.ALPHA_VANTAGE.MIN_DELAY_BETWEEN_CALLS) {
    await delay(API_CONFIG.ALPHA_VANTAGE.MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall)
  }
  
  lastCallTime = Date.now()
  callCount++
  
  console.log(`[API] Call #${callCount} - Conservation mode: ${isConservationMode()}`)
}

// Helper to get next midnight ET timestamp
const getNextMidnightET = () => {
  const now = new Date()
  const currentET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const nextMidnight = new Date(currentET)
  nextMidnight.setHours(24, 0, 0, 0)
  return nextMidnight.getTime()
}

// Helper to check if Alpha Vantage is blocked
const isAlphaVantageBlocked = () => {
  const blockInfo = localStorage.getItem('alphaVantageRateLimit')
  if (!blockInfo) return false
  try {
    const { until } = JSON.parse(blockInfo)
    return Date.now() < until
  } catch {
    return false
  }
}

// Helper to set block until next reset
const setAlphaVantageBlocked = () => {
  const until = getNextMidnightET()
  localStorage.setItem('alphaVantageRateLimit', JSON.stringify({ until }))
}

// Helper to clear block (after reset)
const clearAlphaVantageBlocked = () => {
  localStorage.removeItem('alphaVantageRateLimit')
}

// API instance with timeout
const alphaVantageAPI = axios.create({
  baseURL: API_CONFIG.ALPHA_VANTAGE.BASE_URL,
  timeout: API_CONFIG.ALPHA_VANTAGE.TIMEOUT
})

let hasLoggedAlphaVantageLimit = false;

// Helper to handle API responses and detect rate limits
const handleAPIResponse = (response: any, symbol?: string) => {
  console.log(`[API] Response for ${symbol || 'request'}:`, response.data)
  
  if (response.data?.Information || response.data?.Note) {
    const message = response.data.Information || response.data.Note
    if (!hasLoggedAlphaVantageLimit) {
      console.info('[API] Alpha Vantage rate limit reached. Falling back to Yahoo Finance for all requests.');
      hasLoggedAlphaVantageLimit = true;
    }
    // No further noisy logs
    setAlphaVantageBlocked()
    throw new RateLimitError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED)
  }
  
  return response.data
}



// Log environment info for debugging
logEnvironmentInfo()

// Stock Quote API with Yahoo Finance as default
export const getStockQuote = async (symbol: string): Promise<StockQuote & { lastUpdated: string, isLive: boolean, source?: string }> => {
  try {
    const quote = await getYahooStockQuote(symbol)
    return {
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      lastUpdated: quote.lastUpdated || new Date().toLocaleString(),
      isLive: true,
      source: 'Yahoo Finance'
    }
  } catch (error) {
    throw error
  }
}

// Market Overview with Yahoo Finance as default
export const getMarketOverview = async () => {
  try {
    const indices = isConservationMode() 
      ? ['SPY', 'QQQ']
      : ['SPY', 'QQQ', 'DIA', 'IWM']
    const indexPromises = indices.map(async (symbol) => {
      try {
        const quote = await getStockQuote(symbol)
        return {
          symbol,
          name: getIndexName(symbol),
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          lastUpdated: quote.lastUpdated,
          isLive: quote.isLive
        }
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error)
        return null
      }
    })
    const results = await Promise.allSettled(indexPromises)
    const marketIndices = results
      .filter((result): result is PromiseFulfilledResult<MarketIndex & { lastUpdated: string, isLive: boolean }> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
    const marketSentiment = {
      sentiment: 'Neutral',
      fearGreedIndex: 50,
      vixLevel: 0
    }
    const sectorPerformance: any[] = []
    return {
      marketIndices,
      sectorPerformance,
      marketSentiment,
      lastUpdated: new Date().toLocaleString(),
      isLive: marketIndices.some(index => index.isLive)
    }
  } catch (error) {
    throw error
  }
}

// Market News with Yahoo Finance as default
export const getMarketNews = async (): Promise<(NewsItem & { lastUpdated: string })[]> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
    const response = await fetch(`${backendUrl}/api/news`)
    if (!response.ok) {
      throw new Error('Failed to fetch news from Yahoo Finance backend')
    }
    const data = await response.json()
    if (!data.success || !data.news) {
      throw new Error('No news data available')
    }
    return data.news.map((item: any) => ({
      ...item,
      lastUpdated: item.lastUpdated || new Date().toLocaleString()
    }))
  } catch (error) {
    throw error
  }
}

// Fallback news data when APIs are unavailable
const getFallbackNewsData = (): (NewsItem & { lastUpdated: string })[] => {
  return [
    {
      title: "Tech Stocks Rally on Strong Earnings Reports",
      summary: "Major technology companies reported better-than-expected quarterly results, driving market optimism and pushing indices higher.",
      sentiment: "positive",
      impact: "high",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
      source: "Financial Times",
      url: "#",
      lastUpdated: new Date().toLocaleString()
    },
    {
      title: "Federal Reserve Signals Potential Rate Cut",
      summary: "The Fed's latest meeting minutes suggest a possible interest rate reduction in the coming months, boosting market sentiment.",
      sentiment: "positive",
      impact: "high",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
      source: "Reuters",
      url: "#",
      lastUpdated: new Date().toLocaleString()
    },
    {
      title: "Oil Prices Stabilize After Recent Volatility",
      summary: "Crude oil prices have found support levels after recent geopolitical tensions caused significant market swings.",
      sentiment: "neutral",
      impact: "medium",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString(),
      source: "Bloomberg",
      url: "#",
      lastUpdated: new Date().toLocaleString()
    },
    {
      title: "Retail Sales Data Exceeds Expectations",
      summary: "Consumer spending remained strong in the latest retail sales report, indicating continued economic resilience.",
      sentiment: "positive",
      impact: "medium",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleString(),
      source: "MarketWatch",
      url: "#",
      lastUpdated: new Date().toLocaleString()
    },
    {
      title: "Cryptocurrency Markets Show Mixed Signals",
      summary: "Digital asset prices are trading in a narrow range as investors await regulatory clarity and institutional adoption news.",
      sentiment: "neutral",
      impact: "medium",
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toLocaleString(),
      source: "CoinDesk",
      url: "#",
      lastUpdated: new Date().toLocaleString()
    }
  ]
}

// Stock Search with Yahoo Finance as default
export const searchStocks = async (query: string): Promise<any[]> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
    const response = await fetch(`${backendUrl}/api/search/${encodeURIComponent(query)}`)
    const data = await response.json()
    if (!data.success || !data.results) return []
    const results = await Promise.all(
      data.results.map(async (item: any) => {
        try {
          const quote = await getYahooStockQuote(item.symbol)
          return {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            lastUpdated: quote.lastUpdated,
            isLive: quote.isLive
          }
        } catch {
          return null
        }
      })
    )
    return results.filter(Boolean)
  } catch (error) {
    return []
  }
}

// Calculate technical indicators from historical data
export const getTechnicalIndicators = async (symbol: string) => {
  try {
    // Get historical data to calculate real technical indicators
    const historicalData = await getStockHistoricalData(symbol, 200) // Need at least 200 days for MA200
    
    if (!historicalData || historicalData.length < 14) {
      throw new Error('Insufficient historical data for technical analysis')
    }
    
    // Calculate RSI (14-period)
    const rsi = calculateRSI(historicalData, 14)
    
    // Calculate MACD
    const macd = calculateMACD(historicalData)
    
    // Calculate Bollinger Bands (20-period)
    const bollingerBands = calculateBollingerBands(historicalData, 20)
    
    // Calculate Moving Averages
    const movingAverages = calculateMovingAverages(historicalData)
    
    return {
      rsi,
      macd,
      bollingerBands,
      movingAverages
    }
  } catch (error) {
    console.error('Failed to calculate technical indicators:', error)
    throw new Error('Unable to calculate technical indicators')
  }
}

// Helper functions for technical analysis
const calculateRSI = (data: any[], period: number = 14): number => {
  if (data.length < period + 1) return 50 // Default neutral value
  
  let gains = 0
  let losses = 0
  
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close
    if (change > 0) {
      gains += change
    } else {
      losses += Math.abs(change)
    }
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

const calculateMACD = (data: any[]): any => {
  if (data.length < 26) return { value: 0, signal: 0, histogram: 0 }
  
  // Calculate EMA12 and EMA26
  const ema12 = calculateEMA(data, 12)
  const ema26 = calculateEMA(data, 26)
  
  const macdLine = ema12 - ema26
  const signalLine = calculateEMA([...data.slice(0, 9).map(d => ({ close: macdLine })), ...data.slice(9)], 9)
  const histogram = macdLine - signalLine
  
  return {
    value: macdLine,
    signal: signalLine,
    histogram
  }
}

const calculateEMA = (data: any[], period: number): number => {
  if (data.length < period) return data[data.length - 1]?.close || 0
  
  const multiplier = 2 / (period + 1)
  let ema = data[0].close
  
  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close * multiplier) + (ema * (1 - multiplier))
  }
  
  return ema
}

const calculateBollingerBands = (data: any[], period: number = 20): any => {
  if (data.length < period) {
    return { upper: 0, middle: 0, lower: 0 }
  }
  
  const recentData = data.slice(-period)
  const prices = recentData.map(d => d.close)
  const sma = prices.reduce((sum, price) => sum + price, 0) / period
  
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  const standardDeviation = Math.sqrt(variance)
  
  return {
    upper: sma + (standardDeviation * 2),
    middle: sma,
    lower: sma - (standardDeviation * 2)
  }
}

const calculateMovingAverages = (data: any[]): any => {
  const ma20 = data.length >= 20 ? 
    data.slice(-20).reduce((sum, d) => sum + d.close, 0) / 20 : 0
  const ma50 = data.length >= 50 ? 
    data.slice(-50).reduce((sum, d) => sum + d.close, 0) / 50 : 0
  const ma200 = data.length >= 200 ? 
    data.slice(-200).reduce((sum, d) => sum + d.close, 0) / 200 : 0
  
  return { ma20, ma50, ma200 }
}

// Get comprehensive stock analysis
export const getStockAnalysis = async (symbol: string) => {
  const quote = await getStockQuote(symbol)
  const technical = await getTechnicalIndicators(symbol)
  
  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    marketCap: quote.marketCap || 0,
    technicalIndicators: {
      rsi: technical.rsi,
      macd: technical.macd,
      bollingerBands: technical.bollingerBands,
      movingAverage50: technical.movingAverages.ma50,
      movingAverage200: technical.movingAverages.ma200
    },
    fundamentals: {
      peRatio: 0,
      eps: 0,
      dividendYield: 0,
      beta: 0,
      revenue: 0,
      debt: 0,
      pbRatio: 0
    },
    analysisScore: {
      overall: 3,
      technical: 3,
      fundamental: 3,
      recommendation: 'Hold' as any
    }
  }
}

// AI Chat API - requires OpenAI API key
export const aiChatAPI = {
  sendMessage: async (message: string) => {
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!openAIKey || openAIKey === 'demo') {
      throw new Error('OpenAI API key is required for AI chat functionality')
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful investment advisor. Provide concise, accurate financial advice based on market analysis.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        response: data.choices[0]?.message?.content || 'Unable to generate response',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('AI Chat error:', error)
      throw new Error('Failed to get AI response')
    }
  }
}

// Get historical data from Yahoo Finance as default
export const getHistoricalData = async (symbol: string, days: number = 365): Promise<any[]> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
    const response = await fetch(`${backendUrl}/api/historical/${encodeURIComponent(symbol)}?days=${days}`)
    if (!response.ok) {
      throw new Error('Failed to fetch historical data from Yahoo Finance')
    }
    const data = await response.json()
    if (!data.success || !data.data) {
      throw new Error('No historical data available')
    }
    return data.data.map((item: any) => ({
      date: item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume),
      timestamp: new Date(item.date).getTime()
    }))
  } catch (error) {
    throw error
  }
}

// Get historical data with fallback
export const getStockHistoricalData = async (symbol: string, days: number = 365): Promise<any[]> => {
  // Check if Alpha Vantage is blocked
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  if (!apiKey || apiKey === 'demo') {
    return getHistoricalData(symbol, days)
  }
  
  try {
    return await getHistoricalData(symbol, days)
  } catch (error) {
    console.info('[API] Alpha Vantage historical data failed, using Yahoo Finance fallback.')
    return getHistoricalData(symbol, days)
  }
}

// Export market API object
export const marketAPI = {
  getStockQuote,
  getMarketOverview,
  getMarketNews,
  searchStocks,
  getTechnicalIndicators,
  getStockAnalysis
}

// Nancy Pelosi Trading Data API Functions
export const getPelosiTrades = async (): Promise<PelosiTrade[]> => {
  try {
    // Try multiple data sources for congressional trading data
    const sources = [
      fetchFromSECFilings,
      fetchFromQuiverQuantitative,
      fetchFromOpenSecrets,
      fetchFromHouseStockWatcher
    ]

    for (const source of sources) {
      try {
        const trades = await source()
        if (trades && trades.length > 0) {
          console.log(`[Pelosi API] Successfully fetched ${trades.length} trades from ${source.name}`)
          return await enrichTradesWithCurrentPrices(trades)
        }
      } catch (error) {
        console.warn(`[Pelosi API] Failed to fetch from ${source.name}:`, error)
        continue
      }
    }

    console.warn('[Pelosi API] All data sources failed, using fallback sample data')
    return await getFallbackSampleData()
  } catch (error) {
    console.error('[Pelosi API] Error fetching Pelosi trades:', error)
    return await getFallbackSampleData()
  }
}

// Fallback sample data when APIs are unavailable
const getFallbackSampleData = async (): Promise<PelosiTrade[]> => {
  const sampleTrades: PelosiTrade[] = [
    {
      id: 'sample_1',
      symbol: 'NVDA',
      companyName: 'NVIDIA Corporation',
      tradeType: 'CALL',
      optionType: 'CALL',
      strikePrice: 450,
      expirationDate: '2024-12-20',
      shares: 0,
      contracts: 100,
      tradeDate: '2024-01-15',
      tradePrice: 12.50,
      currentPrice: 18.75,
      profitLoss: 62500,
      profitLossPercent: 50.0,
      daysHeld: 45,
      status: 'ACTIVE',
      disclosureDate: '2024-01-20',
      filingDate: '2024-01-20',
      source: 'Sample Data (API Unavailable)'
    },
    {
      id: 'sample_2',
      symbol: 'TSLA',
      companyName: 'Tesla, Inc.',
      tradeType: 'BUY',
      optionType: undefined,
      strikePrice: undefined,
      expirationDate: undefined,
      shares: 5000,
      contracts: 0,
      tradeDate: '2024-02-01',
      tradePrice: 185.50,
      currentPrice: 245.30,
      profitLoss: 299000,
      profitLossPercent: 32.2,
      daysHeld: 30,
      status: 'ACTIVE',
      disclosureDate: '2024-02-05',
      filingDate: '2024-02-05',
      source: 'Sample Data (API Unavailable)'
    },
    {
      id: 'sample_3',
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      tradeType: 'PUT',
      optionType: 'PUT',
      strikePrice: 180,
      expirationDate: '2024-06-21',
      shares: 0,
      contracts: 50,
      tradeDate: '2024-01-20',
      tradePrice: 8.25,
      currentPrice: 5.10,
      profitLoss: -15750,
      profitLossPercent: -38.2,
      daysHeld: 40,
      status: 'ACTIVE',
      disclosureDate: '2024-01-25',
      filingDate: '2024-01-25',
      source: 'Sample Data (API Unavailable)'
    },
    {
      id: 'sample_4',
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      tradeType: 'CALL',
      optionType: 'CALL',
      strikePrice: 380,
      expirationDate: '2024-09-20',
      shares: 0,
      contracts: 75,
      tradeDate: '2024-02-10',
      tradePrice: 15.80,
      currentPrice: 22.45,
      profitLoss: 49875,
      profitLossPercent: 42.1,
      daysHeld: 20,
      status: 'ACTIVE',
      disclosureDate: '2024-02-15',
      filingDate: '2024-02-15',
      source: 'Sample Data (API Unavailable)'
    },
    {
      id: 'sample_5',
      symbol: 'META',
      companyName: 'Meta Platforms, Inc.',
      tradeType: 'SELL',
      optionType: undefined,
      strikePrice: undefined,
      expirationDate: undefined,
      shares: 2000,
      contracts: 0,
      tradeDate: '2024-01-25',
      tradePrice: 385.75,
      currentPrice: 485.20,
      profitLoss: -198900,
      profitLossPercent: -25.8,
      daysHeld: 35,
      status: 'ACTIVE',
      disclosureDate: '2024-01-30',
      filingDate: '2024-01-30',
      source: 'Sample Data (API Unavailable)'
    }
  ]

  // Enrich with current prices (using mock data for demo)
  return sampleTrades.map(trade => ({
    ...trade,
    currentPrice: trade.currentPrice, // Already set in sample data
    profitLoss: trade.profitLoss, // Already calculated
    profitLossPercent: trade.profitLossPercent, // Already calculated
    daysHeld: trade.daysHeld // Already calculated
  }))
}

// Data source implementations
const fetchFromSECFilings = async (): Promise<PelosiTrade[]> => {
  try {
    // SEC EDGAR database for congressional trading disclosures
    // This would require specialized parsing of SEC filing documents
    // For now, return empty array as this requires complex implementation
    return []
  } catch (error) {
    throw new Error('SEC filings not accessible')
  }
}

const fetchFromQuiverQuantitative = async (): Promise<PelosiTrade[]> => {
  try {
    const apiKey = import.meta.env.VITE_QUIVER_QUANTITATIVE_API_KEY
    if (!apiKey) {
      throw new Error('Quiver Quantitative API key not configured')
    }

    const response = await fetch(`https://api.quiverquant.com/beta/congresstrading/nancypelosi`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Quiver API error: ${response.status}`)
    }

    const data = await response.json()
    return data.map((trade: any) => ({
      id: trade.id || `trade_${Date.now()}_${Math.random()}`,
      symbol: trade.ticker,
      companyName: trade.company_name || trade.ticker,
      tradeType: trade.type?.toUpperCase() || 'BUY',
      optionType: trade.option_type?.toUpperCase(),
      strikePrice: trade.strike_price,
      expirationDate: trade.expiration_date,
      shares: trade.shares,
      contracts: trade.contracts,
      tradeDate: trade.transaction_date,
      tradePrice: trade.price,
      currentPrice: 0, // Will be updated by enrichTradesWithCurrentPrices
      profitLoss: 0, // Will be calculated
      profitLossPercent: 0, // Will be calculated
      daysHeld: 0, // Will be calculated
      status: trade.status || 'ACTIVE',
      disclosureDate: trade.disclosure_date,
      filingDate: trade.filing_date,
      source: 'Quiver Quantitative'
    }))
  } catch (error) {
    console.warn('[Pelosi API] Quiver Quantitative unavailable:', error)
    throw new Error(`Quiver Quantitative: ${error}`)
  }
}

const fetchFromOpenSecrets = async (): Promise<PelosiTrade[]> => {
  try {
    const apiKey = import.meta.env.VITE_OPENSECRETS_API_KEY
    if (!apiKey) {
      throw new Error('OpenSecrets API key not configured')
    }

    const response = await fetch(`https://www.opensecrets.org/api/?method=candIndustry&cid=N00007360&cycle=2024&apikey=${apiKey}&output=json`)
    
    if (!response.ok) {
      throw new Error(`OpenSecrets API error: ${response.status}`)
    }

    const data = await response.json()
    // OpenSecrets provides industry data, not individual trades
    // This would need to be combined with other sources
    console.warn('[Pelosi API] OpenSecrets provides industry data, not individual trades')
    return []
  } catch (error) {
    console.warn('[Pelosi API] OpenSecrets unavailable:', error)
    throw new Error(`OpenSecrets: ${error}`)
  }
}

const fetchFromHouseStockWatcher = async (): Promise<PelosiTrade[]> => {
  try {
    // House Stock Watcher is a public database of congressional trading
    // Note: This API may have CORS restrictions in browser environments
    const response = await fetch('https://housestockwatcher.com/api/trades?member=nancy-pelosi', {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`House Stock Watcher API error: ${response.status}`)
    }

    const data = await response.json()
    return data.trades?.map((trade: any) => ({
      id: trade.id || `trade_${Date.now()}_${Math.random()}`,
      symbol: trade.ticker,
      companyName: trade.company_name || trade.ticker,
      tradeType: trade.transaction_type?.toUpperCase() || 'BUY',
      optionType: trade.option_type?.toUpperCase(),
      strikePrice: trade.strike_price,
      expirationDate: trade.expiration_date,
      shares: trade.amount,
      contracts: trade.contracts,
      tradeDate: trade.transaction_date,
      tradePrice: trade.price,
      currentPrice: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      daysHeld: 0,
      status: 'ACTIVE',
      disclosureDate: trade.disclosure_date,
      filingDate: trade.filing_date,
      source: 'House Stock Watcher'
    })) || []
  } catch (error) {
    console.warn('[Pelosi API] House Stock Watcher unavailable (CORS or network issue):', error)
    throw new Error(`House Stock Watcher: ${error}`)
  }
}

// Enrich trades with current market prices and calculate P&L
const enrichTradesWithCurrentPrices = async (trades: PelosiTrade[]): Promise<PelosiTrade[]> => {
  const enrichedTrades = await Promise.all(
    trades.map(async (trade) => {
      try {
        // Get current stock price
        const currentQuote = await getStockQuote(trade.symbol)
        const currentPrice = currentQuote.price
        
        // Calculate days held
        const tradeDate = new Date(trade.tradeDate)
        const today = new Date()
        const daysHeld = Math.floor((today.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Calculate profit/loss
        let profitLoss = 0
        let profitLossPercent = 0
        
        if (trade.tradeType === 'BUY' || trade.tradeType === 'CALL') {
          if (trade.shares) {
            profitLoss = (currentPrice - trade.tradePrice) * trade.shares
            profitLossPercent = ((currentPrice - trade.tradePrice) / trade.tradePrice) * 100
          } else if (trade.contracts) {
            profitLoss = (currentPrice - trade.tradePrice) * trade.contracts * 100
            profitLossPercent = ((currentPrice - trade.tradePrice) / trade.tradePrice) * 100
          }
        } else if (trade.tradeType === 'SELL' || trade.tradeType === 'PUT') {
          if (trade.shares) {
            profitLoss = (trade.tradePrice - currentPrice) * trade.shares
            profitLossPercent = ((trade.tradePrice - currentPrice) / trade.tradePrice) * 100
          } else if (trade.contracts) {
            profitLoss = (trade.tradePrice - currentPrice) * trade.contracts * 100
            profitLossPercent = ((trade.tradePrice - currentPrice) / trade.tradePrice) * 100
          }
        }
        
        return {
          ...trade,
          currentPrice,
          profitLoss,
          profitLossPercent,
          daysHeld
        }
      } catch (error) {
        console.warn(`Failed to enrich trade for ${trade.symbol}:`, error)
        return trade
      }
    })
  )
  
  return enrichedTrades
}

// Calculate analytics from trades data
export const calculatePelosiAnalytics = async (trades: PelosiTrade[]): Promise<PelosiAnalytics | null> => {
  try {
    if (trades.length === 0) return null
    
    const totalTrades = trades.length
    const activeTrades = trades.filter(trade => trade.status === 'ACTIVE').length
    const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0)
    const totalProfitLossPercent = trades.length > 0 ? 
      trades.reduce((sum, trade) => sum + trade.profitLossPercent, 0) / trades.length : 0
    const winRate = trades.length > 0 ? 
      (trades.filter(trade => trade.profitLoss > 0).length / trades.length) * 100 : 0
    const averageReturn = trades.length > 0 ? 
      trades.reduce((sum, trade) => sum + trade.profitLossPercent, 0) / trades.length : 0
    
    const bestTrade = trades.reduce((best, current) => 
      current.profitLoss > best.profitLoss ? current : best, trades[0])
    const worstTrade = trades.reduce((worst, current) => 
      current.profitLoss < worst.profitLoss ? current : worst, trades[0])
    
    const topPerformers = trades
      .filter(trade => trade.profitLoss > 0)
      .sort((a, b) => b.profitLoss - a.profitLoss)
      .slice(0, 3)
    
    const recentActivity = trades
      .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())
      .slice(0, 3)
    
    // Calculate sector breakdown using company data
    const sectorBreakdown = await calculateSectorBreakdown(trades)
    
    // Calculate monthly performance
    const monthlyPerformance = trades.reduce((acc, trade) => {
      const month = new Date(trade.tradeDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      const existing = acc.find(item => item.month === month)
      if (existing) {
        existing.profitLoss += trade.profitLoss
        existing.trades += 1
      } else {
        acc.push({ month, profitLoss: trade.profitLoss, trades: 1 })
      }
      return acc
    }, [] as { month: string; profitLoss: number; trades: number }[])
    
    return {
      totalTrades,
      activeTrades,
      totalProfitLoss,
      totalProfitLossPercent,
      winRate,
      averageReturn,
      bestTrade,
      worstTrade,
      topPerformers,
      recentActivity,
      sectorBreakdown,
      monthlyPerformance
    }
  } catch (error) {
    console.error('Error calculating analytics:', error)
    return null
  }
}

// Calculate sector breakdown from company data
const calculateSectorBreakdown = async (trades: PelosiTrade[]): Promise<any[]> => {
  try {
    const sectorMap: { [key: string]: { trades: number; profitLoss: number } } = {}
    
    for (const trade of trades) {
      const sector = await getCompanySector(trade.symbol)
      if (!sectorMap[sector]) {
        sectorMap[sector] = { trades: 0, profitLoss: 0 }
      }
      sectorMap[sector].trades++
      sectorMap[sector].profitLoss += trade.profitLoss
    }
    
    const totalTrades = trades.length
    return Object.entries(sectorMap).map(([sector, data]) => ({
      sector,
      trades: data.trades,
      profitLoss: data.profitLoss,
      percentage: (data.trades / totalTrades) * 100
    }))
  } catch (error) {
    console.error('Error calculating sector breakdown:', error)
    return [
      { sector: 'Technology', trades: 0, profitLoss: 0, percentage: 0 },
      { sector: 'Healthcare', trades: 0, profitLoss: 0, percentage: 0 },
      { sector: 'Finance', trades: 0, profitLoss: 0, percentage: 0 }
    ]
  }
}

// Get company sector information
const getCompanySector = async (symbol: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
    if (!apiKey || apiKey === 'demo') {
      return 'Unknown'
    }

    await enforceRateLimit()
    const response = await alphaVantageAPI.get('', {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: apiKey
      }
    })

    const data = handleAPIResponse(response, symbol)
    return data.Sector || 'Unknown'
  } catch (error) {
    console.warn(`Failed to get sector for ${symbol}:`, error)
    return 'Unknown'
  }
}

// Calculate trading insights and patterns
export const calculatePelosiInsights = async (trades: PelosiTrade[]): Promise<PelosiInsights | null> => {
  try {
    if (trades.length === 0) return null
    
    const averageHoldTime = trades.reduce((sum, trade) => sum + trade.daysHeld, 0) / trades.length
    
    // Calculate preferred sectors
    const sectorCounts: { [key: string]: number } = {}
    for (const trade of trades) {
      const sector = await getCompanySector(trade.symbol)
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
    }
    const preferredSectors = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([sector]) => sector)
    
    // Calculate trading patterns
    const tradingPatterns = await analyzeTradingPatterns(trades)
    
    // Calculate market timing accuracy
    const marketTiming = await calculateMarketTiming(trades)
    
    // Calculate correlation with market
    const correlationWithMarket = await calculateMarketCorrelation(trades)
    
    return {
      averageHoldTime,
      preferredSectors,
      tradingPatterns,
      marketTiming,
      correlationWithMarket
    }
  } catch (error) {
    console.error('Error calculating insights:', error)
    return null
  }
}

// Analyze trading patterns
const analyzeTradingPatterns = async (trades: PelosiTrade[]): Promise<any[]> => {
  try {
    const patterns = [
      { pattern: 'Pre-Earnings Activity', frequency: 0, successRate: 0 },
      { pattern: 'Sector Rotation', frequency: 0, successRate: 0 },
      { pattern: 'Momentum Following', frequency: 0, successRate: 0 }
    ]
    
    // Analyze pre-earnings activity using earnings calendar
    const preEarningsTrades: PelosiTrade[] = []
    for (const trade of trades) {
      const isPreEarnings = await isPreEarningsTrade(trade.symbol, trade.tradeDate)
      if (isPreEarnings) {
        preEarningsTrades.push(trade)
      }
    }
    
    if (preEarningsTrades.length > 0) {
      patterns[0].frequency = preEarningsTrades.length
      patterns[0].successRate = (preEarningsTrades.filter(t => t.profitLoss > 0).length / preEarningsTrades.length) * 100
    }
    
    // Analyze sector rotation (trades in different sectors)
    const sectors = new Set<string>()
    for (const trade of trades) {
      const sector = await getCompanySector(trade.symbol)
      sectors.add(sector)
    }
    
    patterns[1].frequency = sectors.size
    const sectorRotationTrades = trades.filter(trade => {
      // Consider trades in different sectors as sector rotation
      return sectors.size > 1
    })
    patterns[1].successRate = sectorRotationTrades.length > 0 ? 
      (sectorRotationTrades.filter(t => t.profitLoss > 0).length / sectorRotationTrades.length) * 100 : 0
    
    // Analyze momentum following (trades after significant price moves)
    const momentumTrades = trades.filter(trade => {
      // Consider trades with high profit/loss as momentum following
      return Math.abs(trade.profitLossPercent) > 20
    })
    
    patterns[2].frequency = momentumTrades.length
    patterns[2].successRate = momentumTrades.length > 0 ? 
      (momentumTrades.filter(t => t.profitLoss > 0).length / momentumTrades.length) * 100 : 0
    
    return patterns
  } catch (error) {
    console.error('Error analyzing trading patterns:', error)
    return [
      { pattern: 'Pre-Earnings Activity', frequency: 0, successRate: 0 },
      { pattern: 'Sector Rotation', frequency: 0, successRate: 0 },
      { pattern: 'Momentum Following', frequency: 0, successRate: 0 }
    ]
  }
}

// Calculate market timing accuracy
const calculateMarketTiming = async (trades: PelosiTrade[]): Promise<any> => {
  try {
    if (trades.length === 0) {
      return { accuracy: 0, averageReturn: 0 }
    }

    // Get date range from trades
    const dates = trades.map(trade => new Date(trade.tradeDate))
    const startDate = new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    const endDate = new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0]

    // Calculate real market timing accuracy
    const timingResult = await calculateMarketTimingAccuracy(trades, startDate, endDate)
    
    return {
      accuracy: timingResult.accuracy,
      averageReturn: timingResult.averageReturn,
      marketOutperformance: timingResult.marketOutperformance
    }
  } catch (error) {
    console.error('Error calculating market timing:', error)
    return { accuracy: 0, averageReturn: 0 }
  }
}

// Calculate correlation with market performance
const calculateMarketCorrelation = async (trades: PelosiTrade[]): Promise<number> => {
  try {
    if (trades.length === 0) {
      return 0
    }

    // Get date range from trades
    const dates = trades.map(trade => new Date(trade.tradeDate))
    const startDate = new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    const endDate = new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0]

    // Calculate real market correlation
    const correlationResult = await calculateTradeMarketCorrelation(trades, startDate, endDate)
    
    return correlationResult.correlation
  } catch (error) {
    console.error('Error calculating market correlation:', error)
    return 0
  }
} 