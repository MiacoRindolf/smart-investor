const express = require('express');
const router = express.Router();
const { getQuote, searchSymbolsYahoo, getHistoricalData } = require('../services/yahooService');

router.get('/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  try {
    const data = await getQuote(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote', details: error.message });
  }
});

// GET /api/search/:query - Search for stock symbols using Yahoo Finance
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const results = await searchSymbolsYahoo(query);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/historical/:symbol - Get historical data for a symbol
router.get('/historical/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const days = parseInt(req.query.days) || 365;
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return res.status(400).json({ 
        success: false, 
        message: 'Days parameter must be between 1 and 365' 
      });
    }
    
    const data = await getHistoricalData(symbol, days);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET /api/news - Get latest Yahoo Finance news (placeholder)
router.get('/news', async (req, res) => {
  try {
    // TODO: Replace with real Yahoo Finance news fetching logic
    res.json({
      success: true,
      news: [
        {
          title: "Tech Stocks Rally on Strong Earnings Reports",
          summary: "Major technology companies reported better-than-expected quarterly results, driving market optimism and pushing indices higher.",
          sentiment: "positive",
          impact: "high",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
          source: "Yahoo Finance",
          url: "https://finance.yahoo.com/",
          lastUpdated: new Date().toLocaleString()
        },
        {
          title: "Federal Reserve Signals Potential Rate Cut",
          summary: "The Fed's latest meeting minutes suggest a possible interest rate reduction in the coming months, boosting market sentiment.",
          sentiment: "positive",
          impact: "high",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
          source: "Yahoo Finance",
          url: "https://finance.yahoo.com/",
          lastUpdated: new Date().toLocaleString()
        },
        {
          title: "Oil Prices Stabilize After Recent Volatility",
          summary: "Crude oil prices have found support levels after recent geopolitical tensions caused significant market swings.",
          sentiment: "neutral",
          impact: "medium",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString(),
          source: "Yahoo Finance",
          url: "https://finance.yahoo.com/",
          lastUpdated: new Date().toLocaleString()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 