const express = require('express');
const router = express.Router();
const { getQuote } = require('../services/yahooService');

router.get('/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  try {
    const data = await getQuote(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote', details: error.message });
  }
});

module.exports = router; 