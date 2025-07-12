// Common utility functions for the SmartInvestor app

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getCompanyName = (symbol: string): string => {
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

export const getIndexName = (symbol: string): string => {
  const indexNames: { [key: string]: string } = {
    'SPY': 'S&P 500 ETF',
    'QQQ': 'NASDAQ-100 ETF',
    'DIA': 'Dow Jones ETF',
    'IWM': 'Russell 2000 ETF'
  }
  return indexNames[symbol.toUpperCase()] || symbol.toUpperCase()
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export const formatNumber = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  }
  return value.toLocaleString()
}

export const getRecommendationColor = (recommendation: string) => {
  switch (recommendation.toLowerCase()) {
    case 'strong buy':
      return 'text-green-600 bg-green-100'
    case 'buy':
      return 'text-green-600 bg-green-50'
    case 'hold':
      return 'text-yellow-600 bg-yellow-50'
    case 'sell':
      return 'text-red-600 bg-red-50'
    case 'strong sell':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getSourceColor = (source: string) => {
  switch (source) {
    case 'Alpha Vantage':
      return 'bg-blue-100 text-blue-800'
    case 'Yahoo Finance':
      return 'bg-purple-100 text-purple-800'
    case 'Cache':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const isConservationMode = () => {
  return !!localStorage.getItem('alphaVantageRateLimit')
}

export const logEnvironmentInfo = () => {
  const alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  console.log('[ENV] Alpha Vantage API Key:', alphaVantageKey ? 'Present' : 'Missing')
  console.log('[ENV] OpenAI API Key:', openaiKey ? 'Present' : 'Missing')
  console.log('[ENV] Conservation Mode:', isConservationMode() ? 'Active' : 'Inactive')
} 