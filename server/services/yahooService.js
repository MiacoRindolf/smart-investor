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

module.exports = { getQuote }; 