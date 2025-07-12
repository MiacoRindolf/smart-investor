const yahooFinance = require('yahoo-finance2').default;

async function getQuote(symbol) {
  const quote = await yahooFinance.quote(symbol);
  return {
    symbol: quote.symbol,
    name: quote.shortName || symbol,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    volume: quote.regularMarketVolume,
    lastUpdated: new Date().toISOString(),
    source: 'Yahoo Finance',
    isLive: true
  };
}

async function searchSymbolsYahoo(query) {
  try {
    const results = await yahooFinance.search(query, { quotesCount: 10, newsCount: 0 })
    // Only return equity symbols
    return (results.quotes || []).filter(q => q.quoteType === 'EQUITY')
  } catch (error) {
    throw new Error('Yahoo Finance symbol search failed: ' + error.message)
  }
}

async function getHistoricalData(symbol, days = 365) {
  try {
    // Calculate the start date based on the number of days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const historicalData = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    })
    
    // Transform the data to match the expected format
    return historicalData.map(item => ({
      date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      timestamp: item.date.getTime()
    }))
  } catch (error) {
    throw new Error('Yahoo Finance historical data failed: ' + error.message)
  }
}

module.exports = {
  getQuote,
  searchSymbolsYahoo,
  getHistoricalData,
}; 