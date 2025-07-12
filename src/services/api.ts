import axios from 'axios'
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../config/constants'
import { StockQuote, MarketIndex, NewsItem } from '../types'
import { dbService } from './database'
import { getYahooStockQuote } from './yahooFinanceService'
import { delay, getCompanyName, getIndexName, isConservationMode, logEnvironmentInfo } from '../utils/helpers'

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

// API instance with timeout
const alphaVantageAPI = axios.create({
  baseURL: API_CONFIG.ALPHA_VANTAGE.BASE_URL,
  timeout: API_CONFIG.ALPHA_VANTAGE.TIMEOUT
})

// Helper to handle API responses and detect rate limits
const handleAPIResponse = (response: any, symbol?: string) => {
  console.log(`[API] Response for ${symbol || 'request'}:`, response.data)
  
  if (response.data?.Information || response.data?.Note) {
    const message = response.data.Information || response.data.Note
    console.error('[API] Rate limit detected:', message)
    
    // Set rate limit flag
    localStorage.setItem(STORAGE_KEYS.RATE_LIMIT_FLAG, Date.now().toString())
    
    throw new RateLimitError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED)
  }
  
  return response.data
}



// Log environment info for debugging
logEnvironmentInfo()

// Stock Quote API with database integration
export const getStockQuote = async (symbol: string): Promise<StockQuote & { lastUpdated: string, isLive: boolean, source?: string }> => {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  // Try Alpha Vantage first if API key is present
  if (apiKey && apiKey !== 'demo') {
    try {
      await enforceRateLimit()
      const response = await alphaVantageAPI.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: apiKey
        }
      })
      const data = handleAPIResponse(response, symbol)
      if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
        throw new Error('No data from Alpha Vantage')
      }
      const quote = data['Global Quote']
      const result: StockQuote & { lastUpdated: string, isLive: boolean, source?: string } = {
        symbol: quote['01. symbol'],
        name: getCompanyName(quote['01. symbol']),
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: new Date().toLocaleString(),
        isLive: true,
        source: 'Alpha Vantage'
      }
      await dbService.saveStockPrice(result, 'live')
      return result
    } catch (error) {
      console.error(`[API] Alpha Vantage failed for ${symbol}, falling back to Yahoo:`, error)
      // If rate limit or error, fall through to Yahoo
    }
  }
  // Try Yahoo Finance as fallback
  try {
    const yahooQuote = await getYahooStockQuote(symbol)
    await dbService.saveStockPrice(yahooQuote, 'live')
    return yahooQuote
  } catch (error) {
    console.error(`[API] Yahoo Finance failed for ${symbol}:`, error)
    // Try cached data from database
    const cachedPrice = await dbService.getLatestPrice(symbol)
    if (cachedPrice) {
      return {
        symbol: cachedPrice.symbol,
        name: getCompanyName(symbol),
        price: cachedPrice.price,
        change: cachedPrice.change,
        changePercent: cachedPrice.changePercent,
        volume: cachedPrice.volume,
        lastUpdated: new Date(cachedPrice.timestamp).toLocaleString(),
        isLive: false,
        source: 'Cache'
      }
    }
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING)
  }
}

// Market Overview with database integration
export const getMarketOverview = async () => {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  
  if (!apiKey || apiKey === 'demo') {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING)
  }

  try {
    const indices = isConservationMode() 
      ? ['SPY', 'QQQ']  // Reduced set for conservation mode
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

    // Generate mock market sentiment (could be enhanced with real data)
    const marketSentiment = {
      sentiment: 'Bullish',
      fearGreedIndex: 65,
      vixLevel: 18.5
    }

    // Mock sector performance (could be enhanced with real ETF data)
    const sectorPerformance = [
      { sector: 'Technology', performance: 2.1, stocks: ['AAPL', 'MSFT', 'GOOGL'] },
      { sector: 'Healthcare', performance: 1.5, stocks: ['UNH', 'JNJ', 'PFE'] },
      { sector: 'Finance', performance: -0.8, stocks: ['JPM', 'BAC', 'WFC'] }
    ]

    return {
      marketIndices,
      sectorPerformance,
      marketSentiment,
      lastUpdated: new Date().toLocaleString(),
      isLive: marketIndices.some(index => index.isLive)
    }

  } catch (error) {
    console.error('Market overview error:', error)
    throw error
  }
}



// Market News with caching
export const getMarketNews = async (): Promise<(NewsItem & { lastUpdated: string })[]> => {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  
  if (!apiKey || apiKey === 'demo') {
    // Return cached news from database
    const cachedNews = await dbService.getLatestNews(10)
    return cachedNews.map(news => ({
      ...news,
      lastUpdated: new Date(news.timestamp).toLocaleString()
    }))
  }

  try {
    await enforceRateLimit()
    
    const response = await alphaVantageAPI.get('', {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: 'AAPL,MSFT,GOOGL,AMZN,TSLA',
        limit: 10,
        apikey: apiKey
      }
    })

    const data = handleAPIResponse(response, 'news')
    
    if (!data.feed || data.feed.length === 0) {
      // Return cached news
      const cachedNews = await dbService.getLatestNews(10)
      return cachedNews.map(news => ({
        ...news,
        lastUpdated: new Date(news.timestamp).toLocaleString()
      }))
    }

    const news: (NewsItem & { lastUpdated: string })[] = data.feed.slice(0, 10).map((item: any) => ({
      title: item.title,
      summary: item.summary,
      sentiment: item.overall_sentiment_label?.toLowerCase() || 'neutral',
      impact: 'medium',
      timestamp: new Date(item.time_published).toLocaleString(),
      source: item.source,
      url: item.url,
      lastUpdated: new Date().toLocaleString()
    }))

    // Save to database
    await dbService.saveNews(news)
    
    return news

  } catch (error) {
    console.error('News fetch error:', error)
    
    // Return cached news on error
    const cachedNews = await dbService.getLatestNews(10)
    return cachedNews.map(news => ({
      ...news,
      lastUpdated: new Date(news.timestamp).toLocaleString()
    }))
  }
}

// Stock Search with database fallback
export const searchStocks = async (query: string): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  
  if (!apiKey || apiKey === 'demo') {
    // Search in database for symbols
    const symbols = await dbService.getAllSymbols()
    const filtered = symbols.filter(symbol => 
      symbol.toLowerCase().includes(query.toLowerCase()) ||
      getCompanyName(symbol).toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
    
    const results = []
    for (const symbol of filtered) {
      try {
        const quote = await getStockQuote(symbol)
        results.push({
          symbol: quote.symbol,
          name: quote.name,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          lastUpdated: quote.lastUpdated,
          isLive: quote.isLive
        })
      } catch (error) {
        // Skip symbols that don't have data
      }
    }
    
    return results
  }

  try {
    await enforceRateLimit()
    
    const response = await alphaVantageAPI.get('', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: apiKey
      }
    })

    const data = handleAPIResponse(response, `search: ${query}`)
    
    if (!data.bestMatches || data.bestMatches.length === 0) {
      return []
    }

    // Get quotes for search results
    const symbols = data.bestMatches.slice(0, 5).map((match: any) => match['1. symbol'])
    const quotes = []
    
    for (const symbol of symbols) {
      try {
        const quote = await getStockQuote(symbol)
        quotes.push({
          symbol: quote.symbol,
          name: quote.name,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          lastUpdated: quote.lastUpdated,
          isLive: quote.isLive,
          analysisScore: {
            overall: Math.floor(Math.random() * 5) + 1,
            recommendation: ['Strong Buy', 'Buy', 'Hold', 'Sell'][Math.floor(Math.random() * 4)]
          }
        })
      } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error)
      }
    }

    return quotes

  } catch (error) {
    console.error('Search error:', error)
    
    // Fallback to popular stocks with cached data
    const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    const filtered = popularSymbols.filter(symbol => 
      symbol.toLowerCase().includes(query.toLowerCase()) ||
      getCompanyName(symbol).toLowerCase().includes(query.toLowerCase())
    )
    
    const results = []
    for (const symbol of filtered) {
      try {
        const quote = await getStockQuote(symbol)
        results.push({
          symbol: quote.symbol,
          name: quote.name,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          lastUpdated: quote.lastUpdated,
          isLive: quote.isLive
        })
      } catch (error) {
        // Skip symbols that don't have data
      }
    }
    
    return results
  }
}

// Calculate technical indicators (mock implementation)
export const getTechnicalIndicators = (_symbol: string) => {
  // Mock technical analysis - in real app, this would use historical data
  return {
    rsi: Math.random() * 100,
    macd: {
      value: (Math.random() - 0.5) * 10,
      signal: (Math.random() - 0.5) * 10,
      histogram: (Math.random() - 0.5) * 5
    },
    bollingerBands: {
      upper: 150 + Math.random() * 50,
      middle: 120 + Math.random() * 30,
      lower: 100 + Math.random() * 20
    },
    movingAverages: {
      ma20: 120 + Math.random() * 20,
      ma50: 115 + Math.random() * 25,
      ma200: 110 + Math.random() * 30
    }
  }
}

// Get comprehensive stock analysis
export const getStockAnalysis = async (symbol: string) => {
  const quote = await getStockQuote(symbol)
  const technical = getTechnicalIndicators(symbol)
  
  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    marketCap: quote.marketCap || Math.random() * 1000000000000,
    technicalIndicators: {
      rsi: technical.rsi,
      macd: technical.macd,
      bollingerBands: technical.bollingerBands,
      movingAverage50: technical.movingAverages.ma50,
      movingAverage200: technical.movingAverages.ma200
    },
    fundamentals: {
      peRatio: Math.random() * 30 + 10,
      eps: Math.random() * 10 + 1,
      dividendYield: Math.random() * 5,
      beta: Math.random() * 2 + 0.5,
      revenue: Math.random() * 100000000000,
      debt: Math.random() * 50000000000,
      pbRatio: Math.random() * 10 + 1
    },
    analysisScore: {
      overall: Math.floor(Math.random() * 5) + 1,
      technical: Math.floor(Math.random() * 5) + 1,
      fundamental: Math.floor(Math.random() * 5) + 1,
      recommendation: ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][Math.floor(Math.random() * 5)] as any
    }
  }
}

// AI Chat API (mock implementation)
export const aiChatAPI = {
  sendMessage: async (message: string) => {
    // Mock AI response - in real app, this would connect to OpenAI/Claude API
    await delay(1000 + Math.random() * 2000) // Simulate API delay
    
    const responses = [
      `Based on current market analysis, ${message.includes('buy') ? 'this could be a good entry point' : 'I recommend careful consideration'}.`,
      `Market conditions suggest that ${message.includes('stock') ? 'diversification is key' : 'timing is important'}.`,
      `From a technical perspective, ${message.includes('price') ? 'support levels are holding' : 'momentum indicators look interesting'}.`,
      `Risk management is crucial here. ${message.includes('invest') ? 'Consider your portfolio allocation' : 'Always do your research'}.`
    ]
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString()
    }
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