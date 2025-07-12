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

module.exports = router; 