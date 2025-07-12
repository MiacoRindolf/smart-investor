// Mock Yahoo Finance service to avoid browser compatibility issues
// In a real implementation, this would be a backend service

const mockStockData: { [key: string]: any } = {
  'AAPL': { price: 175.43, change: 2.15, changePercent: 1.24, volume: 45678900 },
  'GOOGL': { price: 142.56, change: -1.23, changePercent: -0.85, volume: 23456700 },
  'MSFT': { price: 378.85, change: 3.45, changePercent: 0.92, volume: 34567800 },
  'TSLA': { price: 248.42, change: -5.67, changePercent: -2.23, volume: 56789000 },
  'AMZN': { price: 145.24, change: 1.78, changePercent: 1.24, volume: 45678900 },
  'META': { price: 334.92, change: 4.56, changePercent: 1.38, volume: 34567800 },
  'NVDA': { price: 485.09, change: 12.34, changePercent: 2.61, volume: 67890100 },
  'AMD': { price: 128.45, change: -2.34, changePercent: -1.79, volume: 45678900 },
  'JPM': { price: 172.34, change: 0.67, changePercent: 0.39, volume: 23456700 },
  'JNJ': { price: 162.78, change: -0.89, changePercent: -0.54, volume: 12345600 },
  'V': { price: 267.89, change: 1.23, changePercent: 0.46, volume: 23456700 },
  'WMT': { price: 162.45, change: 0.34, changePercent: 0.21, volume: 34567800 },
  'PG': { price: 156.78, change: -0.56, changePercent: -0.36, volume: 12345600 },
  'UNH': { price: 523.67, change: 3.45, changePercent: 0.66, volume: 23456700 },
  'HD': { price: 378.92, change: -2.34, changePercent: -0.61, volume: 34567800 },
  'MA': { price: 445.23, change: 5.67, changePercent: 1.29, volume: 23456700 },
  'DIS': { price: 89.45, change: -1.23, changePercent: -1.36, volume: 45678900 },
  'PYPL': { price: 67.89, change: 0.78, changePercent: 1.16, volume: 34567800 },
  'ADBE': { price: 567.34, change: 8.90, changePercent: 1.59, volume: 23456700 },
  'NFLX': { price: 478.56, change: -3.45, changePercent: -0.72, volume: 34567800 },
  'SPY': { price: 456.78, change: 2.34, changePercent: 0.51, volume: 78901200 },
  'QQQ': { price: 378.90, change: 3.45, changePercent: 0.92, volume: 56789000 },
  'DIA': { price: 345.67, change: 1.23, changePercent: 0.36, volume: 45678900 },
  'IWM': { price: 189.45, change: -0.67, changePercent: -0.35, volume: 34567800 }
}

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

export const getYahooStockQuote = async (symbol: string) => {
  try {
    const response = await fetch(`http://localhost:4000/api/quote/${symbol}`)
    if (!response.ok) throw new Error('Failed to fetch from Yahoo Finance proxy')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Yahoo Finance proxy error:', error)
    throw new Error('Failed to fetch stock price from Yahoo Finance proxy')
  }
} 