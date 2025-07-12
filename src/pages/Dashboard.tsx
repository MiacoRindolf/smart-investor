import React, { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Target,
  Newspaper,
  Zap,
  Plus
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts'
import { marketAPI } from '../services/api'
import AIChat from '../components/AIChat'
import StockAnalysis from '../components/StockAnalysis'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { 
  MarketIndexSkeleton, 
  ChartSkeleton, 
  RateLimitError,
  DashboardStatsSkeleton
} from '../components/ui/LoadingSkeleton'
import type { StockQuote, MarketIndex, NewsItem } from '../types'

interface MarketStat {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

interface DashboardData {
  marketIndices: (MarketIndex & { lastUpdated: string, isLive: boolean, source?: string })[]
  news: (NewsItem & { lastUpdated: string })[]
  watchlist: (StockQuote & { lastUpdated: string, isLive: boolean, source?: string })[]
  sectorPerformance: any[]
  marketSentiment: any
  lastUpdated: string
  isLive: boolean
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch market overview and news
      const [marketOverview, news] = await Promise.all([
        marketAPI.getMarketOverview(),
        marketAPI.getMarketNews()
      ])

      // Get watchlist symbols from localStorage
      const watchlistSymbols = JSON.parse(localStorage.getItem('smartinvestor_watchlist') || '["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]')
      
      // Fetch watchlist data
      const watchlistPromises = watchlistSymbols.slice(0, 5).map((symbol: string) => 
        marketAPI.getStockQuote(symbol).catch((error) => {
          console.error(`Failed to fetch ${symbol}:`, error)
          return null
        })
      )
      
      const watchlistResults = await Promise.all(watchlistPromises)
      const watchlist = watchlistResults.filter(result => result !== null)

      setData({
        marketIndices: marketOverview.marketIndices,
        sectorPerformance: marketOverview.sectorPerformance,
        marketSentiment: marketOverview.marketSentiment,
        news,
        watchlist,
        lastUpdated: marketOverview.lastUpdated,
        isLive: marketOverview.isLive
      })

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const portfolioHistory = [
    { date: 'Jan', value: 20000, growth: 5.2 },
    { date: 'Feb', value: 21500, growth: 7.5 },
    { date: 'Mar', value: 23000, growth: 15.0 },
    { date: 'Apr', value: 22500, growth: 12.5 },
    { date: 'May', value: 24000, growth: 20.0 },
    { date: 'Jun', value: 25000, growth: 25.0 },
  ]

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200'
      case 'negative': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const marketStats: MarketStat[] = data ? [
    {
      label: 'Market Cap',
      value: '$2.4T',
      change: 2.3,
      icon: <DollarSign className="h-6 w-6" />,
      trend: 'up',
      color: 'bg-blue-500'
    },
    {
      label: 'Active Positions',
      value: '12',
      change: 8.1,
      icon: <Target className="h-6 w-6" />,
      trend: 'up',
      color: 'bg-green-500'
    },
    {
      label: 'Daily Volume',
      value: '$847B',
      change: -1.2,
      icon: <Activity className="h-6 w-6" />,
      trend: 'down',
      color: 'bg-orange-500'
    },
    {
      label: 'AI Insights',
      value: '94%',
      change: 12.5,
      icon: <Brain className="h-6 w-6" />,
      trend: 'up',
      color: 'bg-purple-500'
    }
  ] : []

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Section Skeleton */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/20 rounded w-96"></div>
            <div className="h-6 bg-white/20 rounded w-80"></div>
            <div className="flex space-x-4 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/20 rounded-lg p-4 w-32 h-20"></div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats Skeleton */}
        <DashboardStatsSkeleton />

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton height="h-80" />
          <ChartSkeleton height="h-80" />
        </div>

        {/* Market Overview Skeleton */}
        <Card>
          <Card.Header>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <MarketIndexSkeleton key={i} />
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  if (error) {
    if (error.includes('rate limit') || error.includes('Daily API limit')) {
      return <RateLimitError />
    }

    return (
      <div className="space-y-6">
        <Alert variant="error" title="Dashboard Error" size="lg">
          <p className="mb-4">{error}</p>
          <Alert.Actions>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </Alert.Actions>
        </Alert>

        {error.includes('API key') && (
          <Alert variant="info" title="Setup Required" size="lg">
            <div className="space-y-3">
              <p>Configure your API keys to enable real-time features:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Alpha Vantage API key for market data</li>
                <li>OpenAI API key for AI analysis</li>
              </ul>
              <p className="text-sm">
                See <code className="bg-gray-100 px-2 py-1 rounded">OPENAI_SETUP.md</code> for details.
              </p>
            </div>
          </Alert>
        )}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card 
        variant="glass" 
        padding="lg" 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-3">Investment Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Real-time market analysis powered by artificial intelligence
              </p>
            </div>
            
            {/* Market Sentiment Indicators */}
            {data.marketSentiment && (
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Market Sentiment', value: data.marketSentiment.sentiment },
                  { label: 'Fear & Greed', value: data.marketSentiment.fearGreedIndex },
                  { label: 'VIX Level', value: data.marketSentiment.vixLevel }
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="text-sm text-blue-100 font-medium">{item.label}</div>
                    <div className="text-xl font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => setShowAIChat(!showAIChat)}
              variant={showAIChat ? 'secondary' : 'outline'}
              icon={<Zap className="h-4 w-4" />}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              AI Assistant
            </Button>
            <Button
              variant="outline"
              icon={<Plus className="h-4 w-4" />}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Quick Trade
            </Button>
          </div>
        </div>
      </Card>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketStats.map((stat, index) => (
          <Card key={index} variant="elevated" hover className="cursor-pointer">
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <div className={`flex items-center text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portfolio Performance */}
        <Card variant="elevated">
          <Card.Header divider>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Portfolio Performance</h3>
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Market Overview */}
        <Card variant="elevated">
          <Card.Header divider>
            <h3 className="text-xl font-semibold text-gray-900">Market Indices</h3>
          </Card.Header>
          <Card.Content>
            {data.marketIndices ? (
              <div className="space-y-4">
                {data.marketIndices.slice(0, 4).map((index: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-gray-900">{index.symbol}</div>
                        <div className="text-sm text-gray-600">{index.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${index.price?.toFixed(2) || 'N/A'}
                      </div>
                      <div className={`text-sm flex items-center ${
                        (index.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(index.change || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {((index.changePercent || 0) * 100).toFixed(2)}%
                      </div>
                      {index.source && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                            index.source === 'Alpha Vantage' ? 'bg-blue-100 text-blue-800' :
                            index.source === 'Yahoo Finance' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index.source}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No market data available
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Watchlist */}
      {data.watchlist && data.watchlist.length > 0 && (
        <Card variant="elevated">
          <Card.Header divider>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Watchlist
              </h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.watchlist.map((stock, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer" onClick={() => setSelectedStock(stock.symbol)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{stock.symbol}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${stock.price?.toFixed(2) || 'N/A'}
                      </div>
                      <div className={`text-sm flex items-center ${
                        (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(stock.changePercent || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {stock.changePercent?.toFixed(2) || '0.00'}%
                      </div>
                    </div>
                  </div>
                  
                  {stock.lastUpdated && (
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Updated: {stock.lastUpdated}</span>
                      {stock.source && (
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                          stock.source === 'Alpha Vantage' ? 'bg-blue-100 text-blue-800' :
                          stock.source === 'Yahoo Finance' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stock.source}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Market News */}
      {data.news && data.news.length > 0 && (
        <Card variant="elevated">
          <Card.Header divider>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Newspaper className="h-5 w-5 mr-2" />
                Market News & Analysis
              </h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {data.news.slice(0, 4).map((news, index) => (
                <article key={index} className="flex space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      news.sentiment === 'positive' ? 'bg-green-500' :
                      news.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {news.summary}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span>{news.timestamp}</span>
                      <span className={`px-2 py-1 rounded-full ${getSentimentColor(news.sentiment)}`}>
                        {news.sentiment}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowAIChat(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">AI Investment Assistant</h2>
                  <Button onClick={() => setShowAIChat(false)} variant="secondary">
                    Close
                  </Button>
                </div>
                <AIChat />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Analysis Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setSelectedStock(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Stock Analysis - {selectedStock}</h2>
                  <Button onClick={() => setSelectedStock(null)} variant="secondary">
                    Close
                  </Button>
                </div>
                <StockAnalysis symbol={selectedStock} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 