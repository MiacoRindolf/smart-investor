const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Use modular route
app.use('/api', require('./routes/yahoo'));

app.get('/', (req, res) => {
  res.send('SmartInvestor Yahoo Finance Proxy is running.');
});

app.listen(PORT, () => {
  console.log(`Yahoo Finance Proxy server running on port ${PORT}`);
}); 