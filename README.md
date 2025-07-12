# 📈 Smart Investor - AI-Powered Investment Analysis Platform

A comprehensive investment research and analysis platform built with **React TypeScript**, featuring **AI-powered market insights**, **real-time data**, and **advanced stock analysis tools**. Perfect for both beginners and experienced investors looking to make informed investment decisions.

![Smart Investor Dashboard](https://via.placeholder.com/800x400?text=Smart+Investor+Dashboard)

## 🚀 Features

### 🤖 **AI-Powered Investment Assistant**
- ✅ **Intelligent chat bot** for investment advice and market analysis
- ✅ **Real-time market insights** with AI interpretation
- ✅ **Stock recommendations** based on comprehensive analysis
- ✅ **Portfolio guidance** and risk assessment
- ✅ **Educational Q&A** for learning investment concepts

### 📊 **Advanced Stock Analysis**
- ✅ **Technical analysis** with RSI, MACD, Bollinger Bands
- ✅ **Fundamental analysis** with P/E, P/B ratios, financial health
- ✅ **Comprehensive scoring** system (1-5 stars)
- ✅ **Buy/Hold/Sell recommendations** with reasoning
- ✅ **Detailed stock profiles** with key metrics

### 🔍 **Powerful Stock Research**
- ✅ **Smart stock search** with filtering and sorting
- ✅ **Market overview** with sentiment indicators
- ✅ **Sector performance** analysis and trends
- ✅ **Top gainers/losers** with analysis
- ✅ **Market news** with sentiment analysis

### 📈 **Real-Time Market Data**
- ✅ **Live stock prices** from NASDAQ-licensed Alpha Vantage API
- ✅ **Market sentiment indicators** (Fear & Greed Index, VIX)
- ✅ **Real-time charts** and technical indicators
- ✅ **500 free API calls daily** - Perfect for research
- ✅ **Comprehensive fallback data** for seamless experience

### 🎨 **Professional Dashboard**
- ✅ **Modern, responsive design** with advanced UI components
- ✅ **Interactive charts and graphs** for data visualization
- ✅ **Customizable watchlists** with real-time updates
- ✅ **Portfolio tracking** with performance analytics
- ✅ **Mobile-optimized** for research on the go

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express (Yahoo Finance proxy)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Market Data**: Alpha Vantage API (primary) + Yahoo Finance (fallback)

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd SmartInvestor
npm install
```

### 2. Set Up Real-Time Data (Optional)
For live stock market data, you have two options:

#### Option A: Alpha Vantage API (Recommended)
1. **Get API Key**: Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. **Create .env file** in project root:
```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

#### Option B: Yahoo Finance Backend (Free)
1. **Start Backend Server**:
```bash
cd server
npm install
node index.js
```
2. **Frontend will automatically use Yahoo Finance** when Alpha Vantage is unavailable

> **Note**: The app works with either option - Yahoo Finance is completely free!

### 3. Run the App
```bash
npm run dev
```

Visit `http://localhost:3000` and start exploring!

## 📖 How to Use

### 🔍 **Getting Real-Time Data**
1. **Dashboard**: See your portfolio with live market updates
2. **Live Indicator**: Green WiFi icon = real data, Demo mode if no API key
3. **Auto-Refresh**: Watchlist updates every 5 minutes automatically

### 🔍 **Stock Search & Trading**
1. **Search Stocks**: Type any symbol (AAPL) or company name (Apple)
2. **Real-Time Quotes**: Get current prices for any stock
3. **Add to Watchlist**: Save interesting stocks for monitoring
4. **Simulate Orders**: Practice buying and selling with real prices

### 📚 **Learning Features**
1. **Educational Tips**: Learn investment basics throughout the app
2. **Market Explanations**: Understand price changes, volume, etc.
3. **Risk Management**: Built-in affordability checks and warnings
4. **Beginner-Friendly**: Complex concepts explained simply

## 📊 Market Data Features

### ✅ **Live Stock Data**
- Real-time stock prices and changes
- Current market volume and activity
- Price movement indicators (↑ green, ↓ red)
- Market cap and key metrics

### ✅ **Intelligent Search**
- Search any publicly traded stock
- Instant results with real prices
- Add search results to watchlist
- Works with symbols or company names

### ✅ **Portfolio Tracking**
- Real-time portfolio valuation
- Live gain/loss calculations
- Asset allocation visualization
- Performance tracking over time

## 🎓 Perfect for Beginners

### **What You'll Learn:**
- ✅ **Stock Basics**: Understanding prices, volume, market cap
- ✅ **Market Movements**: Why prices go up and down
- ✅ **Trading Concepts**: Buy orders, sell orders, market timing
- ✅ **Risk Management**: Never invest more than you can afford
- ✅ **Portfolio Diversification**: Spreading investments across stocks

### **Built-in Education:**
- 📚 Tips and explanations on every page
- 💡 Real-time market data explanations
- ⚠️ Risk warnings and best practices
- 📊 Interactive charts with context
- 🎯 Step-by-step guidance

## 🔒 About Robinhood API

**Important**: Robinhood does **NOT** offer a public stock trading API for developers. Here's the current situation:

### ❌ **What Robinhood Doesn't Offer:**
- No public stock trading API
- No way to get API tokens for stock trading
- Only crypto trading API (launched 2024)

### ✅ **What We Use Instead:**
- **Alpha Vantage**: NASDAQ-licensed, professional market data (primary)
- **Yahoo Finance**: Free, reliable market data via backend proxy (fallback)
- **Real-time prices**: Live quotes for all major stocks
- **Multiple sources**: Automatic fallback for reliability
- **Trusted sources**: Used by financial institutions worldwide

### 🔄 **For Actual Trading:**
This app is perfect for **learning and simulation**. For real trading, consider:
- **Robinhood**: Mobile app for commission-free trading
- **Interactive Brokers**: Professional platform with API
- **Alpaca**: Developer-friendly trading API
- **TD Ameritrade**: API available for approved developers

## 🛠️ Advanced Setup

### **Environment Variables**
```env
# Alpha Vantage API (for real-time data)
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### **API Rate Limits**
- **Free Tier**: 500 calls/day (perfect for learning)
- **Premium**: Higher limits and more features available
- **Built-in Management**: App automatically handles rate limiting

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

## 📝 Project Structure

```
SmartInvestor/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Main application pages
│   ├── services/        # API integration (Alpha Vantage + Yahoo Finance)
│   ├── store/           # State management (Zustand)
│   ├── utils/           # Utility functions and helpers
│   └── App.tsx          # Main application component
├── server/              # Backend server (Yahoo Finance proxy)
│   ├── routes/          # API routes
│   ├── services/        # Backend services
│   └── index.js         # Server entry point
├── public/              # Static assets
├── ALPHA_VANTAGE_SETUP.md  # Detailed API setup guide
└── README.md           # This file
```

## 🌟 Key Benefits

### **For Beginners:**
- 📚 **Learn with real data** - See actual market movements
- 🎯 **Safe environment** - Simulate trading without financial risk
- 💡 **Built-in education** - Understand concepts as you explore
- 🔄 **Real-time updates** - Stay current with market changes

### **For Developers:**
- 🚀 **Modern tech stack** - React 18, TypeScript, Vite
- 🎨 **Professional design** - Tailwind CSS with custom components
- 📊 **Real API integration** - Learn to work with financial APIs
- 🔧 **Well-structured code** - Easy to understand and extend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add some feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📖 **Setup Help**: See `ALPHA_VANTAGE_SETUP.md` for detailed API instructions
- 💬 **Questions**: Open an issue on GitHub
- 🐛 **Bug Reports**: Create an issue with steps to reproduce
- 💡 **Feature Requests**: Let us know what you'd like to see added!

---

**Ready to start learning stock trading with real market data?** 
🚀 Get your free API key and dive into the world of investing! 