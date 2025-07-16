import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Info, DollarSign, Loader, BarChart3, Target, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import { backtestService, BacktestConfig, BacktestResult, TradingStrategy } from '../services/backtestService'

const Trading = () => {
  const { 
    watchlist, 
    portfolio, 
    setSelectedStock, 
    selectedStock, 
    error,
    searchStocks,
    addToWatchlist 
  } = useStore()
  
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Backtest state
  const [activeTab, setActiveTab] = useState<'trading' | 'backtest'>('trading')
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null)
  const [strategyParams, setStrategyParams] = useState<{ [key: string]: any }>({})
  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig | null>(null)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [isRunningBacktest, setIsRunningBacktest] = useState(false)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const results = await searchStocks(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error('Search failed:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchStocks])

  // Combined list of watchlist and search results
  const displayStocks = searchQuery.trim() 
    ? searchResults 
    : watchlist

  const calculateOrderValue = () => {
    if (!selectedStock || !shares) return 0
    return parseFloat(shares) * selectedStock.price
  }

  const canAffordOrder = () => {
    const orderValue = calculateOrderValue()
    return orderValue <= portfolio.cash
  }

  const handleAddToWatchlist = async (stock: any) => {
    try {
      await addToWatchlist(stock)
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
    }
  }

  // Backtest functions
  const handleStrategySelect = (strategy: TradingStrategy) => {
    setSelectedStrategy(strategy)
    const defaultParams: { [key: string]: any } = {}
    strategy.parameters.forEach(param => {
      defaultParams[param.name] = param.defaultValue
    })
    setStrategyParams(defaultParams)
  }

  const handleParamChange = (paramName: string, value: any) => {
    setStrategyParams(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const runBacktest = async () => {
    if (!selectedStock || !selectedStrategy) return

    setIsRunningBacktest(true)
    try {
      const config: BacktestConfig = {
        symbol: selectedStock.symbol,
        startDate: '2023-01-01', // Default to 1 year ago
        endDate: new Date().toISOString().split('T')[0],
        initialCapital: 10000, // Default $10k
        strategy: selectedStrategy,
        parameters: strategyParams,
        commission: 0.001, // 0.1% commission
        slippage: 0.001 // 0.1% slippage
      }

      const result = await backtestService.runBacktest(config)
      setBacktestResult(result)
      setBacktestConfig(config)
    } catch (error) {
      console.error('Backtest failed:', error)
      alert('Backtest failed. Please try again.')
    } finally {
      setIsRunningBacktest(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trading</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Available Cash</p>
          <p className="text-2xl font-bold text-success-600">${portfolio.cash.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('trading')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'trading'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Live Trading</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'backtest'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Backtest Strategies</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'trading' && (
        <>
          {/* API Status Alert */}
          {error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Using sample data. For real-time stock search and prices, set up your Alpha Vantage API key. 
                    See the <code className="bg-blue-100 px-1 rounded">ALPHA_VANTAGE_SETUP.md</code> file for instructions.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Search */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {error ? 'Browse Stocks' : 'Search Stocks (Live)'}
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={error ? "Search watchlist..." : "Search any stock symbol or name..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <Loader className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Search Results / Watchlist */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-4">
                  <Loader className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Searching stocks...</p>
                </div>
              ) : displayStocks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    {searchQuery.trim() 
                      ? (error ? 'No stocks found in watchlist' : 'No stocks found. Try a different search term.')
                      : 'Your watchlist will appear here'
                    }
                  </p>
                </div>
              ) : (
                displayStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStock?.symbol === stock.symbol
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{stock.symbol}</p>
                        <p className="text-sm text-gray-500 truncate">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${stock.price.toFixed(2)}</p>
                        <div className={`flex items-center text-sm ${
                          stock.change >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          <span>{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add to Watchlist button for search results */}
                    {searchQuery.trim() && !watchlist.find(w => w.symbol === stock.symbol) && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToWatchlist(stock)
                          }}
                          className="w-full text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                        >
                          Add to Watchlist
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Real-time indicator */}
            {!error && !searchQuery && (
              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Real-time data from Alpha Vantage
              </div>
            )}
          </div>
        </div>

        {/* Trading Interface */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStock ? (
            <>
              {/* Stock Details */}
              <div className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
                    <p className="text-gray-600">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${selectedStock.price.toFixed(2)}</p>
                    <div className={`flex items-center ${
                      selectedStock.change >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {selectedStock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span>${Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-medium">{selectedStock.volume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Cap</p>
                    <p className="font-medium">{selectedStock.marketCap ? `$${(selectedStock.marketCap / 1e9).toFixed(1)}B` : 'N/A'}</p>
                  </div>
                </div>

                {/* Live data indicator */}
                {!error && (
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Live market data • Last updated: {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Order Form */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
                
                {/* Order Type Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      orderType === 'buy'
                        ? 'bg-success-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setOrderType('buy')}
                  >
                    Buy
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      orderType === 'sell'
                        ? 'bg-danger-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setOrderType('sell')}
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                    />
                  </div>

                  {shares && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Order Value:</span>
                        <span className="font-medium">${calculateOrderValue().toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Cash:</span>
                        <span className="font-medium">${portfolio.cash.toLocaleString()}</span>
                      </div>
                      {orderType === 'buy' && !canAffordOrder() && (
                        <p className="text-danger-600 text-sm mt-2">Insufficient funds for this order</p>
                      )}
                    </div>
                  )}

                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderType === 'buy'
                        ? 'btn-success'
                        : 'btn-danger'
                    }`}
                    disabled={!shares || (orderType === 'buy' && !canAffordOrder())}
                  >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {shares || '0'} Shares
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Stock to Trade</h3>
              <p className="text-gray-500">
                {error 
                  ? 'Choose a stock from your watchlist to view details and simulate orders'
                  : 'Search for any stock or choose from your watchlist to get real-time quotes and place orders'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Educational Section for Beginners */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-3">📚 Trading Basics for Beginners</h3>
            <div className="space-y-3 text-purple-800">
              <div>
                <strong>Real-Time vs Demo Trading:</strong>
                <p className="text-sm text-purple-700">
                  {error 
                    ? 'You\'re currently in demo mode with sample data. This is perfect for learning without risk!'
                    : 'You\'re seeing real market data! Prices update live, but orders are simulated for learning purposes.'
                  }
                </p>
              </div>
              <div>
                <strong>Stock Search & Selection:</strong>
                <p className="text-sm text-purple-700">
                  {error
                    ? 'Browse your watchlist to practice selecting stocks and understanding price movements.'
                    : 'Search any publicly traded stock by symbol (AAPL) or name (Apple). Real prices help you make informed decisions.'
                  }
                </p>
              </div>
              <div>
                <strong>Order Calculation:</strong>
                <p className="text-sm text-purple-700">Order value = Number of shares × Stock price. Always ensure you have enough cash before placing buy orders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Backtest Interface */}
      {activeTab === 'backtest' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Professional Backtest System</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Test trading strategies on historical data to evaluate performance before live trading.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strategy Selection */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Strategy</h3>
                
                <div className="space-y-3">
                  {backtestService.getAvailableStrategies().map((strategy) => (
                    <button
                      key={strategy.name}
                      onClick={() => handleStrategySelect(strategy)}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${
                        selectedStrategy?.name === strategy.name
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Parameters */}
              {selectedStrategy && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Parameters</h3>
                  
                  <div className="space-y-4">
                    {selectedStrategy.parameters.map((param) => (
                      <div key={param.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.label}
                        </label>
                        {param.type === 'number' && (
                          <input
                            type="number"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={strategyParams[param.name] || param.defaultValue}
                            onChange={(e) => handleParamChange(param.name, parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        )}
                        {param.type === 'boolean' && (
                          <input
                            type="checkbox"
                            checked={strategyParams[param.name] || param.defaultValue}
                            onChange={(e) => handleParamChange(param.name, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        )}
                        {param.type === 'select' && param.options && (
                          <select
                            value={strategyParams[param.name] || param.defaultValue}
                            onChange={(e) => handleParamChange(param.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {param.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Backtest Results */}
            <div className="lg:col-span-2 space-y-4">
              {selectedStock ? (
                <>
                  {/* Stock Info */}
                  <div className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
                        <p className="text-gray-600">{selectedStock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${selectedStock.price.toFixed(2)}</p>
                        <div className={`flex items-center ${
                          selectedStock.change >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {selectedStock.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span>${Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Run Backtest Button */}
                  <div className="card">
                    <button
                      onClick={runBacktest}
                      disabled={!selectedStrategy || isRunningBacktest}
                      className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRunningBacktest ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Running Backtest...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>Run Backtest</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Backtest Results */}
                  {backtestResult && (
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Backtest Results</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Return</p>
                          <p className={`text-xl font-bold ${backtestResult.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            ${backtestResult.totalReturn.toLocaleString()}
                          </p>
                          <p className={`text-sm ${backtestResult.totalReturnPercent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {backtestResult.totalReturnPercent.toFixed(2)}%
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Annualized Return</p>
                          <p className={`text-xl font-bold ${backtestResult.annualizedReturn >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {(backtestResult.annualizedReturn * 100).toFixed(2)}%
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Max Drawdown</p>
                          <p className="text-xl font-bold text-danger-600">
                            {backtestResult.maxDrawdownPercent.toFixed(2)}%
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Sharpe Ratio</p>
                          <p className="text-xl font-bold text-gray-900">
                            {backtestResult.sharpeRatio.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Trades</p>
                          <p className="text-xl font-bold text-gray-900">{backtestResult.totalTrades}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Win Rate</p>
                          <p className="text-xl font-bold text-gray-900">{backtestResult.winRate.toFixed(1)}%</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Profit Factor</p>
                          <p className="text-xl font-bold text-gray-900">{backtestResult.profitFactor.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Final Capital</p>
                          <p className="text-xl font-bold text-gray-900">${backtestResult.finalCapital.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Stock to Backtest</h3>
                  <p className="text-gray-500">
                    Choose a stock from your watchlist or search for one to run backtest strategies.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trading 