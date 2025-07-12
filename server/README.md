# SmartInvestor Backend Server

This is the backend server for the SmartInvestor application, providing real-time stock data via Yahoo Finance API.

## Features

- **Yahoo Finance Proxy**: Fetches real-time stock quotes using the `yahoo-finance2` package
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

The frontend calls `http://localhost:4000/api/quote/:symbol` to get real-time stock data. 