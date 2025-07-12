// Core Types
export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
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
  value: number | string
  timeframe?: number // For indicators like EMA (50, 200, etc.)
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