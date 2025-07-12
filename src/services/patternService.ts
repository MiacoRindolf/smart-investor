import { CustomPattern, PatternCondition, PatternMatch, PatternAnalysis } from '../types'
import { marketAPI } from './api'

// Default pattern as requested by user
export const DEFAULT_PATTERN: CustomPattern = {
  id: 'default-pattern',
  name: 'Bullish Momentum Pattern',
  description: 'EMA 50 below price, RSI above 50, MACD Line and Signal above 0',
  conditions: [
    {
      indicator: 'EMA',
      operator: 'below',
      value: 'PRICE',
      timeframe: 50
    },
    {
      indicator: 'RSI',
      operator: 'above',
      value: 50
    },
    {
      indicator: 'MACD',
      operator: 'above',
      value: 0
    },
    {
      indicator: 'MACD_SIGNAL',
      operator: 'above',
      value: 0
    }
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  matchCount: 0
}

// Helper function to evaluate a single condition
const evaluateCondition = (
  condition: PatternCondition,
  stockData: any
): boolean => {
  const { indicator, operator, value, timeframe } = condition

  let actualValue: number
  let compareValue: number

  switch (indicator) {
    case 'EMA':
      if (timeframe === 50) {
        actualValue = stockData.technicalIndicators?.movingAverage50 || stockData.price
      } else if (timeframe === 200) {
        actualValue = stockData.technicalIndicators?.movingAverage200 || stockData.price
      } else {
        actualValue = stockData.price
      }
      compareValue = value === 'PRICE' ? stockData.price : Number(value)
      break

    case 'RSI':
      actualValue = stockData.technicalIndicators?.rsi || 50
      compareValue = Number(value)
      break

    case 'MACD':
      actualValue = stockData.technicalIndicators?.macd?.value || 0
      compareValue = Number(value)
      break

    case 'MACD_SIGNAL':
      actualValue = stockData.technicalIndicators?.macd?.signal || 0
      compareValue = Number(value)
      break

    case 'PRICE':
      actualValue = stockData.price
      compareValue = Number(value)
      break

    case 'VOLUME':
      actualValue = stockData.volume
      compareValue = Number(value)
      break

    default:
      return false
  }

  switch (operator) {
    case 'above':
      return actualValue > compareValue
    case 'below':
      return actualValue < compareValue
    case 'equals':
      return Math.abs(actualValue - compareValue) < 0.01
    case 'greater_than':
      return actualValue > compareValue
    case 'less_than':
      return actualValue < compareValue
    default:
      return false
  }
}

// Calculate confidence score based on how well conditions are met
const calculateConfidence = (
  conditions: PatternCondition[],
  stockData: any
): number => {
  let matchedConditions = 0
  let totalConditions = conditions.length

  for (const condition of conditions) {
    if (evaluateCondition(condition, stockData)) {
      matchedConditions++
    }
  }

  return (matchedConditions / totalConditions) * 100
}

// Check if a stock matches a pattern
export const checkPatternMatch = async (
  pattern: CustomPattern,
  symbol: string
): Promise<PatternMatch | null> => {
  try {
    const stockData = await marketAPI.getStockAnalysis(symbol)
    const confidence = calculateConfidence(pattern.conditions, stockData)
    
    // Consider it a match if confidence is above 75%
    if (confidence >= 75) {
      const matchedConditions = pattern.conditions.filter(condition => 
        evaluateCondition(condition, stockData)
      )

      return {
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price,
        changePercent: stockData.changePercent,
        pattern,
        matchedConditions,
        confidence,
        lastUpdated: new Date().toLocaleString()
      }
    }

    return null
  } catch (error) {
    console.error(`Error checking pattern match for ${symbol}:`, error)
    return null
  }
}

// Scan multiple stocks for pattern matches
export const scanStocksForPattern = async (
  pattern: CustomPattern,
  symbols: string[] = []
): Promise<PatternAnalysis> => {
  const matches: PatternMatch[] = []
  const stocksToAnalyze = symbols.length > 0 ? symbols : [
    'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'AMD', 
    'JPM', 'JNJ', 'V', 'WMT', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL'
  ]

  let totalAnalyzed = 0
  let totalConfidence = 0

  for (const symbol of stocksToAnalyze) {
    try {
      const match = await checkPatternMatch(pattern, symbol)
      if (match) {
        matches.push(match)
        totalConfidence += match.confidence
      }
      totalAnalyzed++
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error)
      totalAnalyzed++
    }
  }

  const averageConfidence = matches.length > 0 ? totalConfidence / matches.length : 0
  const matchRate = (matches.length / totalAnalyzed) * 100

  // Update pattern stats
  pattern.matchCount = matches.length
  pattern.lastUsed = new Date().toISOString()

  return {
    pattern,
    matches,
    totalStocksAnalyzed: totalAnalyzed,
    matchRate,
    averageConfidence,
    lastAnalysis: new Date().toLocaleString()
  }
}

// Save pattern to localStorage
export const savePattern = (pattern: CustomPattern): void => {
  const patterns = getPatterns()
  const existingIndex = patterns.findIndex(p => p.id === pattern.id)
  
  if (existingIndex >= 0) {
    patterns[existingIndex] = pattern
  } else {
    patterns.push(pattern)
  }
  
  localStorage.setItem('customPatterns', JSON.stringify(patterns))
}

// Get all saved patterns
export const getPatterns = (): CustomPattern[] => {
  try {
    const stored = localStorage.getItem('customPatterns')
    if (stored) {
      const patterns = JSON.parse(stored)
      // Ensure default pattern is always included
      const hasDefault = patterns.some((p: CustomPattern) => p.id === 'default-pattern')
      if (!hasDefault) {
        patterns.unshift(DEFAULT_PATTERN)
      }
      return patterns
    }
  } catch (error) {
    console.error('Error loading patterns:', error)
  }
  
  return [DEFAULT_PATTERN]
}

// Delete a pattern
export const deletePattern = (patternId: string): void => {
  const patterns = getPatterns().filter(p => p.id !== patternId)
  localStorage.setItem('customPatterns', JSON.stringify(patterns))
}

// Update pattern
export const updatePattern = (pattern: CustomPattern): void => {
  savePattern(pattern)
}

// Get pattern by ID
export const getPatternById = (patternId: string): CustomPattern | undefined => {
  return getPatterns().find(p => p.id === patternId)
} 