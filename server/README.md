# SmartInvestor Backend Server

This is the backend server for the SmartInvestor application, providing real-time stock data via Yahoo Finance API.

## Features

- **Yahoo Finance Proxy**: Fetches real-time stock quotes using the `yahoo-finance2` package
- **Historical Data**: Provides historical price data for technical analysis
- **Symbol Search**: Search for stock symbols by company name
- **CORS Support**: Configured for frontend integration
- **Modular Architecture**: Organized with routes and services
- **Error Handling**: Robust error handling and logging

## Setup

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Start the Server**
   ```bash
   node index.js
   ```
   
   The server will start on port 4000 by default.

## API Endpoints

### GET `/api/quote/:symbol`
Fetches real-time stock quote for a given symbol.

**Example:**
```bash
curl http://localhost:4000/api/quote/AAPL
```

**Response:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 175.43,
  "change": 2.15,
  "changePercent": 1.24,
  "volume": 45678900,
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "source": "Yahoo Finance",
  "isLive": true
}
```

### GET `/api/historical/:symbol`
Fetches historical price data for a given symbol.

**Parameters:**
- `days` (optional): Number of days of historical data (1-365, default: 365)

**Example:**
```bash
curl "http://localhost:4000/api/historical/AAPL?days=30"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "open": 175.23,
      "high": 176.45,
      "low": 174.89,
      "close": 175.43,
      "volume": 45678900,
      "timestamp": 1705315200000
    }
  ]
}
```

### GET `/api/search/:query`
Searches for stock symbols by company name or symbol.

**Example:**
```bash
curl http://localhost:4000/api/search/Apple
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "symbol": "AAPL",
      "shortname": "Apple Inc.",
      "quoteType": "EQUITY"
    }
  ]
}
```

## Architecture

```
server/
├── index.js          # Main server file
├── routes/
│   └── yahoo.js      # Yahoo Finance API routes
├── services/
│   └── yahooService.js # Yahoo Finance service logic
└── README.md         # This file
```

## Environment Variables

- `PORT`: Server port (default: 4000)

## Integration with Frontend

The frontend automatically falls back to this backend when:
1. Alpha Vantage API key is not available
2. Alpha Vantage rate limit is exceeded
3. Alpha Vantage API fails

The frontend calls:
- `http://localhost:4000/api/quote/:symbol` to get real-time stock data
- `http://localhost:4000/api/historical/:symbol` to get historical data for technical analysis
- `http://localhost:4000/api/search/:query` to search for stock symbols 