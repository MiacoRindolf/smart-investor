// Yahoo Finance service to avoid browser compatibility issues
// In a real implementation, this would be a backend service

// Track backend health to reduce noise
let backendFailureCount = 0
let lastBackendFailureTime = 0
const BACKEND_FAILURE_THRESHOLD = 5
const BACKEND_RESET_TIME = 60000 // 1 minute

const getCompanyName = (symbol: string): string => {
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'TSLA': 'Tesla Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'AMD': 'Advanced Micro Devices Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'JNJ': 'Johnson & Johnson',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'PG': 'Procter & Gamble Co.',
    'UNH': 'UnitedHealth Group Inc.',
    'HD': 'Home Depot Inc.',
    'MA': 'Mastercard Inc.',
    'DIS': 'Walt Disney Co.',
    'PYPL': 'PayPal Holdings Inc.',
    'ADBE': 'Adobe Inc.',
    'NFLX': 'Netflix Inc.',
    'SPY': 'SPDR S&P 500 ETF',
    'QQQ': 'Invesco QQQ Trust',
    'DIA': 'SPDR Dow Jones Industrial Average ETF',
    'IWM': 'iShares Russell 2000 ETF'
  }
  return companyNames[symbol.toUpperCase()] || `${symbol.toUpperCase()} Corp.`
}

// Normalize symbol for Yahoo Finance (convert dots to dashes, etc.)
const normalizeSymbol = (symbol: string): string => {
  // Common symbol mappings for Yahoo Finance
  const symbolMappings: { [key: string]: string } = {
    'BRK.B': 'BRK-B',
    'BRK.A': 'BRK-A',
    'BF.B': 'BF-B',
    'BF.A': 'BF-A'
  }
  
  return symbolMappings[symbol] || symbol.replace(/\./g, '-')
}

export const getYahooStockQuote = async (symbol: string) => {
  const normalizedSymbol = normalizeSymbol(symbol)
  
  // Check if backend is consistently failing
  const now = Date.now()
  if (backendFailureCount >= BACKEND_FAILURE_THRESHOLD && (now - lastBackendFailureTime) < BACKEND_RESET_TIME) {
    // Backend is failing consistently, throw error instead of using fallback
    throw new Error(`Yahoo Finance backend is down. Please try again later.`)
  }
  
  try {
    const response = await fetch(`http://localhost:4000/api/quote/${encodeURIComponent(normalizedSymbol)}`)
    
    if (!response.ok) {
      // If the normalized symbol fails, try the original symbol
      if (normalizedSymbol !== symbol) {
        const fallbackResponse = await fetch(`http://localhost:4000/api/quote/${encodeURIComponent(symbol)}`)
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          backendFailureCount = 0 // Reset failure count on success
          return data
        }
      }
      
      // Track backend failures
      backendFailureCount++
      lastBackendFailureTime = now
      
      // Only log the first few failures to reduce noise
      if (backendFailureCount <= 3) {
        console.warn(`Yahoo Finance proxy error for ${symbol}: ${response.status} ${response.statusText}`)
      } else if (backendFailureCount === BACKEND_FAILURE_THRESHOLD) {
        console.warn(`Yahoo Finance backend appears to be down.`)
      }
      
      throw new Error(`Yahoo Finance proxy returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    backendFailureCount = 0 // Reset failure count on success
    return data
  } catch (error) {
    // Track backend failures
    backendFailureCount++
    lastBackendFailureTime = now
    
    // Only log the first few failures to reduce noise
    if (backendFailureCount <= 3) {
      console.warn(`Yahoo Finance proxy error for ${symbol}:`, error instanceof Error ? error.message : String(error))
    }
    
    // Re-throw the error instead of returning fallback data
    throw error
  }
} 