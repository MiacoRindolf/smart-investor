# 🚀 Smart Investor API Setup Guide

## Why Alpha Vantage?

Alpha Vantage is a **NASDAQ-licensed** provider of real-time and historical financial market data. It offers:

- ✅ **FREE Tier** - No credit card required
- ✅ **Real-time stock quotes**
- ✅ **500 API calls per day** (free tier)
- ✅ **Professional grade data**
- ✅ **25 years of historical data**

## 🔑 Getting Your FREE API Key

### Step 1: Get Your API Key
1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email address
3. Click "GET FREE API KEY"
4. Check your email for the API key

### Step 2: Set Up Your Environment
1. **Create a `.env` file** in your project root (same folder as package.json)
2. **Add your API key** to the file:

```env
# Smart Investor - Environment Configuration

# Alpha Vantage API (for stock market data) - REQUIRED
VITE_ALPHA_VANTAGE_API_KEY=YOUR_ALPHA_VANTAGE_KEY_HERE

# OpenAI API (for AI investment assistant) - OPTIONAL
VITE_OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE

# Replace YOUR_*_KEY_HERE with your actual API keys
```

### Step 3: Restart Your App
```bash
npm run dev
```

## 🤖 AI Investment Assistant Setup (Optional)

### Why Add AI Assistant?
- ✅ **Personalized investment advice** based on market data
- ✅ **Real-time market analysis** and interpretation
- ✅ **Educational Q&A** for learning investment concepts
- ✅ **Stock recommendations** with reasoning
- ✅ **Portfolio guidance** and risk assessment

### Getting Your OpenAI API Key
1. **Visit**: https://platform.openai.com/api-keys
2. **Sign up** for an OpenAI account (if you don't have one)
3. **Create a new API key**
4. **Copy the key** and add it to your `.env` file
5. **Note**: OpenAI offers $5 free credits for new users

### Without OpenAI Key
- The AI assistant will still work with **smart demo responses**
- All other features remain fully functional
- No impact on stock analysis or market data

## 🎯 What You'll Get With Real Data

### ✅ Live Stock Prices
- Real-time quotes for all major stocks
- Automatic price updates
- Current market data from NASDAQ, NYSE, etc.

### ✅ Real Stock Search
- Search any publicly traded stock
- Get instant quotes for search results
- Add any stock to your watchlist

### ✅ Market Data
- Live price changes and percentages
- Real trading volumes
- Market news and sentiment

### ✅ Historical Data
- Intraday charts
- Historical price trends
- Performance analysis

## 🔍 How to Verify It's Working

1. **Check the Dashboard**: Look for the "Live Data" indicator with a WiFi icon
2. **Watch for Updates**: Stock prices will refresh automatically
3. **Try Stock Search**: Search for any stock symbol (e.g., "AAPL", "GOOGL")
4. **No Error Messages**: The yellow warning box will disappear

## 📊 API Usage Limits

### Free Tier (500 calls/day):
- Perfect for personal use
- About 20-50 stock quotes per hour
- Automatic rate limiting built-in

### Premium Tiers Available:
- Higher rate limits
- Real-time streaming data
- Advanced features

## ⚠️ Troubleshooting

### "Using Demo Data" Warning?
- Check your .env file exists
- Verify API key is correct
- Restart development server
- Check browser console for errors

### API Rate Limit Reached?
- Free tier: 500 calls per day
- Wait 24 hours for reset
- Consider upgrading for higher limits

### No Stock Data Appearing?
- Verify internet connection
- Check API key validity
- Try different stock symbols

## 🎓 For Beginners: Understanding Real-Time Data

### What is Real-Time Data?
- **Live prices** that update as the market moves
- **Immediate reflection** of buying and selling activity
- **Current market sentiment** and trends

### Why It Matters:
- **Better decisions** with up-to-date information
- **Market timing** for buying and selling
- **Risk management** with current prices

### Key Terms:
- **Price**: Current trading price per share
- **Change**: Dollar amount up or down from yesterday's close
- **Volume**: Number of shares traded today
- **Market Cap**: Total company value (price × shares outstanding)

## 🔐 Security Notes

- ✅ Your API key is free and safe to use
- ✅ Only market data access (no trading permissions)
- ✅ Keep your .env file private (never commit to git)
- ✅ Alpha Vantage is a trusted, regulated provider

## 🎯 Next Steps

1. **Get your Alpha Vantage API key** for real-time market data
2. **Get your OpenAI API key** for AI investment assistant (optional)
3. **Create your .env file** with both keys
4. **Restart the app** and enjoy the full experience!
5. **Ask the AI assistant** about market conditions and stock recommendations
6. **Use the stock research tools** to analyze investment opportunities

---

**Ready to start investing with AI-powered insights?**
- [🔑 Get Alpha Vantage API Key](https://www.alphavantage.co/support/#api-key) (Required)
- [🤖 Get OpenAI API Key](https://platform.openai.com/api-keys) (Optional but Recommended) 