// Core Types
export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
}

export interface StockQuote extends Stock {
  previousClose?: number
  dayHigh?: number
  dayLow?: number
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

export interface MarketOverview {
  marketIndices: MarketIndex[]
  sectorPerformance: SectorPerformance[]
  marketSentiment: MarketSentiment
}

export interface SectorPerformance {
  sector: string
  performance: number
  stocks: string[]
}

export interface MarketSentiment {
  sentiment: string
  fearGreedIndex: number
  vixLevel: number
}

export interface NewsItem {
  title: string
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  timestamp: string
  source: string
  url: string
}

export interface TechnicalIndicators {
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
  }
  bollingerBands: {
    upper: number
    middle: number
    lower: number
  }
  movingAverages: {
    ma20: number
    ma50: number
    ma200: number
  }
}

export interface FundamentalData {
  marketCap: number
  peRatio: number
  eps: number
  dividend: number
  beta: number
  week52High: number
  week52Low: number
}

export interface AnalysisScore {
  overall: number
  technical: number
  fundamental: number
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
}

export interface StockAnalysis {
  quote: StockQuote
  technical: TechnicalIndicators
  fundamental: FundamentalData
  analysis: AnalysisScore
}

// API Response Types
export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface APIError {
  message: string
  code?: string
  details?: any
}

// UI State Types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ConservationMode {
  isActive: boolean
  activatedAt: number
  resetTime: number
}

// Component Props Types
export interface ComponentWithChildren {
  children: React.ReactNode
}

export interface ComponentWithClassName {
  className?: string
}

// Custom Pattern Types
export interface PatternCondition {
  indicator: 'EMA' | 'RSI' | 'MACD' | 'MACD_SIGNAL' | 'PRICE' | 'VOLUME'
  operator: 'above' | 'below' | 'equals' | 'greater_than' | 'less_than'
  value: number | string // can be a number, 'PRICE', or 'EMA_20', 'EMA_50', 'EMA_100'
  timeframe?: number // For indicators like EMA (20, 50, 100, 200, etc.)
}

export interface CustomPattern {
  id: string
  name: string
  description: string
  conditions: PatternCondition[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  matchCount: number
}

export interface PatternMatch {
  symbol: string
  name: string
  price: number
  changePercent: number
  pattern: CustomPattern
  matchedConditions: PatternCondition[]
  confidence: number
  lastUpdated: string
}

export interface PatternAnalysis {
  pattern: CustomPattern
  matches: PatternMatch[]
  totalStocksAnalyzed: number
  matchRate: number
  averageConfidence: number
  lastAnalysis: string
}

// Portfolio Types
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

// Nancy Pelosi Options Tracker Types
export interface PelosiTrade {
  id: string
  symbol: string
  companyName: string
  tradeType: 'BUY' | 'SELL' | 'CALL' | 'PUT'
  optionType?: 'CALL' | 'PUT'
  strikePrice?: number
  expirationDate?: string
  shares?: number
  contracts?: number
  tradeDate: string
  tradePrice: number
  currentPrice: number
  profitLoss: number
  profitLossPercent: number
  daysHeld: number
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED'
  disclosureDate: string
  filingDate: string
  source: string
}

export interface PelosiAnalytics {
  totalTrades: number
  activeTrades: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  winRate: number
  averageReturn: number
  bestTrade: PelosiTrade
  worstTrade: PelosiTrade
  topPerformers: PelosiTrade[]
  recentActivity: PelosiTrade[]
  sectorBreakdown: {
    sector: string
    trades: number
    profitLoss: number
    percentage: number
  }[]
  monthlyPerformance: {
    month: string
    profitLoss: number
    trades: number
  }[]
}

export interface PelosiInsights {
  averageHoldTime: number
  preferredSectors: string[]
  tradingPatterns: {
    pattern: string
    frequency: number
    successRate: number
  }[]
  marketTiming: {
    accuracy: number
    averageReturn: number
  }
  correlationWithMarket: number
} 