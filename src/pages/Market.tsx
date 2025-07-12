import { useState, useEffect } from 'react'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Star,
  RefreshCw,
  StarOff,
  Target
} from 'lucide-react'
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { marketAPI } from '../services/api'
import { useStore } from '../store/useStore'
import StockAnalysis from '../components/StockAnalysis'
import PatternManager from '../components/PatternManager'
import { MarketIndexSkeleton, StockCardSkeleton, ErrorState, RateLimitError } from '../components/LoadingSkeleton'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'


const Market = () => {
  const { addToWatchlist, removeFromWatchlist, watchlist } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [marketData, setMarketData] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [_activeFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'market' | 'patterns'>('market')

  // Fetch market data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await marketAPI.getMarketOverview()
        setMarketData(data)
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load market data. Please check your API configuration.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const results = await marketAPI.searchStocks(searchQuery)
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
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Filter results (simplified for now)
  const filteredResults = searchResults

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Market Overview Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <MarketIndexSkeleton key={i} />
          ))}
        </div>

        {/* Search Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
        </div>

        {/* Stock Results Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <StockCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    // Check if it's a rate limit error
    if (error.includes('Daily API limit reached') || error.includes('rate limit')) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Research & Analysis</h1>
              <p className="text-gray-600 mt-1">Discover, analyze, and research stocks with AI-powered insights</p>
            </div>
          </div>
          
          <RateLimitError />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Research & Analysis</h1>
            <p className="text-gray-600 mt-1">Discover, analyze, and research stocks with AI-powered insights</p>
          </div>
        </div>
        
        <ErrorState
          title="Failed to Load Market Data"
          message={error}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
        
        {/* Show setup instructions if it's an API key issue */}
        {error.includes('API key') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ API Configuration Required</h3>
            <div className="text-yellow-800 space-y-2">
              <p>The stock research features require valid API keys to function:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Alpha Vantage API:</strong> For real-time stock quotes, search, and market data</li>
                <li><strong>OpenAI API:</strong> For AI-powered stock analysis and investment advice</li>
              </ul>
              <p className="text-sm">Without these keys, you'll see this error instead of mock data so you know when APIs are working vs not working.</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Data Status */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market Research</h1>
          {marketData && (
            <div className="flex items-center mt-2 space-x-4">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                marketData.isLive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  marketData.isLive ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span>{marketData.isLive ? 'Live Market Data' : 'Cached Market Data'}</span>
              </div>
              <span className="text-sm text-gray-500">
                Last updated: {marketData.lastUpdated}
              </span>
            </div>
          )}
        </div>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Refresh Market Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'market'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Market Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'patterns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } transition-colors`}
          >
            <Target className="h-4 w-4" />
            <span>Pattern Scanner</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'patterns' ? (
        <PatternManager />
      ) : (
        <>

      {/* Market Overview Cards */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Market Sentiment */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Market Sentiment</h3>
            <p className="text-2xl font-bold">{marketData.marketSentiment.sentiment}</p>
            <p className="text-blue-100 text-sm">Fear & Greed: {marketData.marketSentiment.fearGreedIndex}</p>
          </div>

          {/* VIX Level */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Volatility (VIX)</h3>
            <p className="text-2xl font-bold">{marketData.marketSentiment.vixLevel}</p>
            <p className="text-orange-100 text-sm">
              {marketData.marketSentiment.vixLevel > 20 ? 'High Volatility' : 'Low Volatility'}
            </p>
          </div>

          {/* Best Performing Sector */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Top Sector</h3>
            <p className="text-xl font-bold">
              {marketData.sectorPerformance.reduce((a: any, b: any) => a.performance > b.performance ? a : b).sector}
            </p>
            <p className="text-green-100 text-sm">
              +{marketData.sectorPerformance.reduce((a: any, b: any) => a.performance > b.performance ? a : b).performance.toFixed(2)}%
            </p>
          </div>

          {/* Market Direction */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Market Direction</h3>
            <div className="flex items-center space-x-2">
              {marketData.marketIndices[0].change >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
              <p className="text-xl font-bold">
                {marketData.marketIndices[0].change >= 0 ? 'Bullish' : 'Bearish'}
              </p>
            </div>
            <p className="text-indigo-100 text-sm">S&P 500 trend</p>
          </div>
        </div>
      )}

      {/* Stock Search */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={() => setIsSearching(true)} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Analyzing stocks...</p>
          </div>
        ) : searchQuery.trim() && filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map((stock) => (
                <Card key={stock.symbol} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{stock.symbol}</h4>
                                                 {stock.isLive !== undefined && (
                           <div className={`w-2 h-2 rounded-full ${
                             stock.isLive ? 'bg-green-500' : 'bg-yellow-500'
                           }`} title={stock.isLive ? 'Live data' : 'Cached data'}></div>
                         )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{stock.name}</p>
                    </div>
                    <button
                      onClick={() => watchlist.includes(stock.symbol) 
                        ? removeFromWatchlist(stock.symbol)
                        : addToWatchlist(stock.symbol)
                      }
                      className="ml-2 p-1 hover:bg-gray-100 rounded"
                    >
                      {watchlist.includes(stock.symbol) ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        ${stock.price?.toFixed(2) || 'N/A'}
                      </span>
                      <span className={`text-sm font-medium flex items-center ${
                        (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(stock.changePercent || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {stock.changePercent?.toFixed(2) || '0.00'}%
                      </span>
                    </div>
                    
                    {stock.lastUpdated && (
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Updated: {stock.lastUpdated}</span>
                        {stock.source && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stock.source === 'Alpha Vantage' ? 'bg-blue-100 text-blue-800' :
                            stock.source === 'Yahoo Finance' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stock.source}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {stock.analysisScore && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-600">Analysis Score</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < stock.analysisScore.overall ? 'bg-blue-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => setSelectedStock(stock.symbol)}
                      variant="secondary"
                      size="sm"
                      className="w-full mt-2"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Discover Stocks</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Search for any publicly traded stock to get comprehensive analysis including technical indicators, 
              fundamental data, and AI-powered recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].map(symbol => (
                <button
                  key={symbol}
                  onClick={() => setSearchQuery(symbol)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      {/* Market Performance Charts */}
      {marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Performance Today</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketData.sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                <Bar dataKey="performance" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Indices Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Major Indices Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketData.marketIndices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Change %']} />
                <Bar dataKey="changePercent" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stock Analysis Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <StockAnalysis 
              symbol={selectedStock} 
              onClose={() => setSelectedStock(null)} 
            />
          </div>
        </div>
      )}

      {/* Educational Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">🎯 Stock Research Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-800">
          <div>
            <strong>How to Use Stock Search:</strong>
            <p className="text-sm text-purple-700">
              Search by ticker symbol (AAPL) or company name (Apple). Use filters to find stocks by recommendation 
              or rating. Each stock shows technical and fundamental analysis scores to help your decisions.
            </p>
          </div>
          <div>
            <strong>Understanding Analysis Scores:</strong>
            <p className="text-sm text-purple-700">
              Technical scores (1-5) analyze price patterns and momentum. Fundamental scores evaluate financial health. 
              Overall scores combine both for investment recommendations.
            </p>
          </div>
          <div>
            <strong>Market Sentiment Indicators:</strong>
            <p className="text-sm text-purple-700">
              Fear & Greed Index shows market emotions. VIX measures volatility. Sector performance helps identify 
              trending industries for potential investment opportunities.
            </p>
          </div>
          <div>
            <strong>Making Investment Decisions:</strong>
            <p className="text-sm text-purple-700">
              Use the detailed analysis to understand each stock's strengths and risks. Compare P/E ratios, 
              market caps, and recommendations before making investment decisions.
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default Market 