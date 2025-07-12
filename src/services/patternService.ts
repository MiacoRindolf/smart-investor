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

export const EMA_STACK_PATTERN: CustomPattern = {
  id: 'ema-stack-bullish',
  name: 'EMA Stack Bullish Pattern',
  description: 'EMA 20 below price, EMA 50 below EMA 20, EMA 100 below EMA 50',
  conditions: [
    {
      indicator: 'EMA',
      operator: 'below',
      value: 'PRICE',
      timeframe: 20
    },
    {
      indicator: 'EMA',
      operator: 'below',
      value: 'EMA_20',
      timeframe: 50
    },
    {
      indicator: 'EMA',
      operator: 'below',
      value: 'EMA_50',
      timeframe: 100
    }
  ],
  isActive: true,
  createdAt: new Date().toISOString(),
  matchCount: 0
}

const DEFAULT_STOCK_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'V',
  'LLY', 'JPM', 'XOM', 'MA', 'AVGO', 'HD', 'PG', 'COST', 'ORCL', 'ABBV',
  'MRK', 'PEP', 'CVX', 'ADBE', 'WMT', 'CRM', 'ACN', 'MCD', 'ABT', 'DHR',
  'LIN', 'BAC', 'TMO', 'DIS', 'TXN', 'NEE', 'WFC', 'AMD', 'BMY', 'AMGN',
  'LOW', 'PM', 'SBUX', 'INTU', 'UNP', 'MDT', 'QCOM', 'RTX', 'HON', 'GS',
  'ISRG', 'CAT', 'NOW', 'SCHW', 'C', 'BLK', 'SPGI', 'PLD', 'LMT', 'DE',
  'GE', 'SYK', 'ZTS', 'TJX', 'AXP', 'T', 'MO', 'BKNG', 'MMC', 'CB',
  'ADI', 'DUK', 'GILD', 'SO', 'ELV', 'CI', 'USB', 'APD', 'FISV', 'PGR',
  'BDX', 'ITW', 'REGN', 'CME', 'VRTX', 'ADP', 'EOG', 'SHW', 'CSCO', 'FDX',
  'CL', 'NSC', 'BSX', 'WM', 'MCO', 'HUM', 'EMR', 'ETN', 'PFE', 'ROP',
  'MCK', 'AON', 'KMB', 'PSA', 'TRV', 'D', 'PSX', 'MAR', 'AEP', 'EXC',
  'ORLY', 'VLO', 'SRE', 'MNST', 'AIG', 'ALL', 'WELL', 'STZ', 'ECL', 'MTD',
  'IDXX', 'ROST', 'NOC', 'VRSK', 'OXY', 'HLT', 'WMB', 'PCAR', 'MS', 'DLR',
  'AWK', 'PEG', 'ED', 'CTAS', 'F', 'DOV', 'PRU', 'CMI', 'PAYX', 'AMP',
  'PH', 'RSG', 'HSY', 'VICI', 'LVS', 'TSCO', 'EXR', 'LEN', 'KEYS', 'NUE',
  'WEC', 'STE', 'BALL', 'GWW', 'CHD', 'PPG', 'FAST', 'HCA', 'MLM', 'STT',
  'AVB', 'TYL', 'FITB', 'CNP', 'XYL', 'ESS', 'MAA', 'PKG', 'IRM', 'MTB',
  'FMC', 'GLW', 'NDAQ', 'CF', 'CMS', 'TSN', 'VTR', 'HIG', 'L', 'NTAP',
  'DRI', 'SWK', 'SNA', 'BRO', 'CEG', 'CINF', 'WST', 'MKC', 'BR', 'CARR',
  'TXT', 'DHI', 'LKQ', 'TSCO', 'NVR', 'ALLE', 'AEE', 'ATO', 'BKR', 'BAX',
  'CDW', 'CHRW', 'CMA', 'CMS', 'COO', 'CPB', 'CPRT', 'CPT', 'CRL', 'CSGP',
  'CTLT', 'CZR', 'D', 'DAL', 'DD', 'DFS', 'DG', 'DGX', 'DLTR', 'DOV',
  'DPZ', 'DRE', 'DRI', 'DTE', 'DUK', 'DVA', 'DVN', 'DXCM', 'EA', 'EBAY',
  'ECL', 'ED', 'EFX', 'EG', 'EIX', 'EL', 'EMN', 'EMR', 'ENPH', 'EOG',
  'EPAM', 'EQIX', 'EQR', 'EQT', 'ES', 'ESS', 'ETN', 'ETR', 'EVRG', 'EW',
  'EXC', 'EXPD', 'EXPE', 'EXR', 'F', 'FANG', 'FAST', 'FCX', 'FDS', 'FDX',
  'FE', 'FFIV', 'FICO', 'FIS', 'FISV', 'FITB', 'FLT', 'FMC', 'FOX', 'FOXA',
  'FRT', 'FTNT', 'FTV', 'GD', 'GE', 'GEHC', 'GEN', 'GILD', 'GIS', 'GL',
  'GLW', 'GM', 'GNRC', 'GOOG', 'GOOGL', 'GPC', 'GPN', 'GRMN', 'GS', 'GWW',
  'HAL', 'HAS', 'HBAN', 'HCA', 'HD', 'HES', 'HIG', 'HII', 'HLT', 'HOLX',
  'HON', 'HPE', 'HPQ', 'HRL', 'HSIC', 'HST', 'HSY', 'HUBB', 'HUM', 'HWM',
  'IBM', 'ICE', 'IDXX', 'IEX', 'IFF', 'ILMN', 'INCY', 'INTC', 'INTU',
  'INVH', 'IP', 'IPG', 'IQV', 'IR', 'IRM', 'ISRG', 'IT', 'ITW', 'IVZ',
  'J', 'JBHT', 'JCI', 'JKHY', 'JNJ', 'JNPR', 'JPM', 'K', 'KEY', 'KEYS',
  'KHC', 'KIM', 'KLAC', 'KMB', 'KMI', 'KMX', 'KO', 'KR', 'L', 'LDOS',
  'LEN', 'LH', 'LHX', 'LIN', 'LKQ', 'LLY', 'LMT', 'LNC', 'LNT', 'LOW',
  'LRCX', 'LUMN', 'LUV', 'LVS', 'LW', 'LYB', 'LYV', 'MA', 'MAA', 'MAR',
  'MAS', 'MCD', 'MCHP', 'MCK', 'MCO', 'MDLZ', 'MDT', 'MET', 'META', 'MGM',
  'MHK', 'MKC', 'MKTX', 'MLM', 'MMC', 'MMM', 'MNST', 'MO', 'MOS', 'MPC',
  'MPWR', 'MRK', 'MS', 'MSCI', 'MSFT', 'MSI', 'MTB', 'MTCH', 'MTD', 'MU',
  'NCLH', 'NDAQ', 'NDSN', 'NEE', 'NEM', 'NFLX', 'NI', 'NKE', 'NOC', 'NOW',
  'NRG', 'NSC', 'NTAP', 'NTRS', 'NUE', 'NVDA', 'NVR', 'NWS', 'NWSA', 'O',
  'ODFL', 'OGN', 'OKE', 'OMC', 'ON', 'ORCL', 'ORLY', 'OTIS', 'OXY', 'PARA',
  'PAYC', 'PAYX', 'PBCT', 'PCAR', 'PCG', 'PEAK', 'PEG', 'PEP', 'PFE',
  'PFG', 'PG', 'PGR', 'PH', 'PHM', 'PKG', 'PLD', 'PLTR', 'PM', 'PNC',
  'PNR', 'PNW', 'POOL', 'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PTC', 'PWR',
  'PXD', 'PYPL', 'QCOM', 'QRVO', 'RCL', 'REG', 'REGN', 'RF', 'RHI', 'RJF',
  'RL', 'RMD', 'ROK', 'ROL', 'ROP', 'ROST', 'RSG', 'SBAC', 'SBNY', 'SBUX',
  'SCHW', 'SEDG', 'SEE', 'SHW', 'SIVB', 'SJM', 'SLB', 'SNA', 'SNPS', 'SO',
  'SPG', 'SPGI', 'SRE', 'STE', 'STLD', 'STT', 'STX', 'STZ', 'SWK', 'SWKS',
  'SYF', 'SYK', 'SYY', 'T', 'TAP', 'TDG', 'TEL', 'TER', 'TFC', 'TFX',
  'TGT', 'TJX', 'TMO', 'TMUS', 'TPR', 'TRGP', 'TRMB', 'TROW', 'TRV',
  'TSCO', 'TSLA', 'TSN', 'TT', 'TTWO', 'TXN', 'TXT', 'TYL', 'UAL', 'UDR',
  'UHS', 'ULTA', 'UNH', 'UNP', 'UPS', 'URI', 'USB', 'V', 'VFC', 'VICI',
  'VLO', 'VMC', 'VRSK', 'VRSN', 'VTR', 'VTRS', 'VZ', 'WAB', 'WAT', 'WBA',
  'WBD', 'WDC', 'WEC', 'WELL', 'WFC', 'WHR', 'WM', 'WMB', 'WMT', 'WRB',
  'WRK', 'WST', 'WTW', 'WY', 'WYNN', 'XEL', 'XOM', 'XRAY', 'XYL', 'YUM'
]

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
      if (timeframe === 20) {
        actualValue = stockData.technicalIndicators?.movingAverages?.ma20 || stockData.price
      } else if (timeframe === 50) {
        actualValue = stockData.technicalIndicators?.movingAverages?.ma50 || stockData.price
      } else if (timeframe === 100) {
        actualValue = stockData.technicalIndicators?.ma100 || stockData.price
      } else if (timeframe === 200) {
        actualValue = stockData.technicalIndicators?.movingAverages?.ma200 || stockData.price
      } else {
        actualValue = stockData.price
      }
      if (typeof value === 'string' && value.startsWith('EMA_')) {
        // Compare to another EMA
        const emaRef = Number(value.split('_')[1])
        if (emaRef === 20) {
          compareValue = stockData.technicalIndicators?.movingAverages?.ma20 || stockData.price
        } else if (emaRef === 50) {
          compareValue = stockData.technicalIndicators?.movingAverages?.ma50 || stockData.price
        } else if (emaRef === 100) {
          compareValue = stockData.technicalIndicators?.ma100 || stockData.price
        } else if (emaRef === 200) {
          compareValue = stockData.technicalIndicators?.movingAverages?.ma200 || stockData.price
        } else {
          compareValue = stockData.price
        }
      } else if (value === 'PRICE') {
        compareValue = stockData.price
      } else {
        compareValue = Number(value)
      }
      break;

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
    // Log error but don't throw - this allows scanning to continue
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn(`Skipping ${symbol} due to API error:`, errorMessage)
    return null
  }
}

// Scan multiple stocks for pattern matches
export const scanStocksForPattern = async (
  pattern: CustomPattern,
  symbols: string[] = []
): Promise<PatternAnalysis> => {
  const matches: PatternMatch[] = []
  const stocksToAnalyze = symbols.length > 0 ? symbols : DEFAULT_STOCK_SYMBOLS

  let totalAnalyzed = 0
  let totalConfidence = 0

  // Optimize: process in parallel batches
  const BATCH_SIZE = 8 // Tune as needed for your API limits
  for (let i = 0; i < stocksToAnalyze.length; i += BATCH_SIZE) {
    const batch = stocksToAnalyze.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (symbol) => {
        try {
          const match = await checkPatternMatch(pattern, symbol)
          if (match) {
            matches.push(match)
            totalConfidence += match.confidence
          }
          totalAnalyzed++
        } catch (error) {
          console.error(`Error analyzing ${symbol}:`, error)
          totalAnalyzed++
        }
      })
    )
    // Add delay between batches to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 400))
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
    let patterns: CustomPattern[] = []
    if (stored) {
      patterns = JSON.parse(stored)
    }
    // Ensure default pattern is always included
    const hasDefault = patterns.some((p: CustomPattern) => p.id === 'default-pattern')
    if (!hasDefault) {
      patterns.unshift(DEFAULT_PATTERN)
    }
    // Ensure EMA stack pattern is always included
    const hasEMAStack = patterns.some((p: CustomPattern) => p.id === 'ema-stack-bullish')
    if (!hasEMAStack) {
      patterns.push(EMA_STACK_PATTERN)
    }
    return patterns
  } catch (error) {
    console.error('Error loading patterns:', error)
  }
  return [DEFAULT_PATTERN, EMA_STACK_PATTERN]
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