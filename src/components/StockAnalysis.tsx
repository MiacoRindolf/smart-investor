import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { marketAPI } from '../services/api'

interface StockAnalysisProps {
  symbol: string
  onClose?: () => void
}

const StockAnalysis = ({ symbol, onClose }: StockAnalysisProps) => {
  const [stockData, setStockData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'fundamental'>('overview')

  useEffect(() => {
    const fetchStockAnalysis = async () => {
      try {
        setLoading(true)
        const data = await marketAPI.getStockAnalysis(symbol)
        setStockData(data)
      } catch (error) {
        console.error('Failed to fetch stock analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStockAnalysis()
  }, [symbol])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stockData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Unable to Load Analysis</h3>
        <p className="text-gray-600">Failed to fetch analysis for {symbol}</p>
      </div>
    )
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'strong buy':
        return 'text-green-600 bg-green-100'
      case 'buy':
        return 'text-green-600 bg-green-50'
      case 'hold':
        return 'text-yellow-600 bg-yellow-50'
      case 'sell':
        return 'text-red-600 bg-red-50'
      case 'strong sell':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (score >= 3) return <Target className="h-5 w-5 text-yellow-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  // Mock chart data for price movement
  const priceData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: stockData.price + (Math.random() - 0.5) * 20
  }))

  // RSI gauge data
  const rsiData = [{
    name: 'RSI',
    value: stockData.technicalIndicators.rsi,
    fill: stockData.technicalIndicators.rsi > 70 ? '#ef4444' : 
          stockData.technicalIndicators.rsi < 30 ? '#22c55e' : '#f59e0b'
  }]

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
            <p className="text-blue-100">{stockData.name}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-3xl font-bold">${stockData.price.toFixed(2)}</span>
              <div className={`flex items-center space-x-1 ${
                stockData.change >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {stockData.change >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="font-medium">
                  ${Math.abs(stockData.change).toFixed(2)} ({Math.abs(stockData.changePercent).toFixed(2)}%)
                </span>
              </div>
            </div>
            {stockData.source && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  stockData.source === 'Alpha Vantage' ? 'bg-blue-100 text-blue-800' :
                  stockData.source === 'Yahoo Finance' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Data: {stockData.source}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              getRecommendationColor(stockData.analysisScore.recommendation)
            }`}>
              {stockData.analysisScore.recommendation}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < stockData.analysisScore.overall ? 'text-yellow-300 fill-current' : 'text-gray-400'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-blue-100">
                {stockData.analysisScore.overall}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'technical', name: 'Technical Analysis', icon: TrendingUp },
            { id: 'fundamental', name: 'Fundamental Data', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Volume</p>
                <p className="text-xl font-bold text-gray-900">{stockData.volume.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Market Cap</p>
                <p className="text-xl font-bold text-gray-900">
                  ${(stockData.marketCap / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">P/E Ratio</p>
                <p className="text-xl font-bold text-gray-900">{stockData.fundamentals.peRatio.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Dividend Yield</p>
                <p className="text-xl font-bold text-gray-900">{stockData.fundamentals.dividendYield.toFixed(2)}%</p>
              </div>
            </div>

            {/* Price Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Price Movement (30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Price']} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Analysis Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Overall Score</span>
                  {getScoreIcon(stockData.analysisScore.overall)}
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < stockData.analysisScore.overall ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Technical</span>
                  {getScoreIcon(stockData.analysisScore.technical)}
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < stockData.analysisScore.technical ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Fundamental</span>
                  {getScoreIcon(stockData.analysisScore.fundamental)}
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < stockData.analysisScore.fundamental ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RSI Gauge */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">RSI (Relative Strength Index)</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={rsiData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill={rsiData[0].fill} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <p className="text-2xl font-bold">{stockData.technicalIndicators.rsi.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">
                    {stockData.technicalIndicators.rsi > 70 ? 'Overbought' : 
                     stockData.technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </p>
                </div>
              </div>

              {/* Moving Averages */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Moving Averages</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">50-Day MA</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${stockData.technicalIndicators.movingAverage50.toFixed(2)}</span>
                      {stockData.price > stockData.technicalIndicators.movingAverage50 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">200-Day MA</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${stockData.technicalIndicators.movingAverage200.toFixed(2)}</span>
                      {stockData.price > stockData.technicalIndicators.movingAverage200 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Indicators Table */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Technical Indicators</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Indicator</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Value</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 text-sm text-gray-900">MACD</td>
                      <td className="py-2 text-sm text-gray-900">{stockData.technicalIndicators.macd.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          stockData.technicalIndicators.macd > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {stockData.technicalIndicators.macd > 0 ? 'Bullish' : 'Bearish'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-gray-900">Bollinger Upper</td>
                      <td className="py-2 text-sm text-gray-900">${stockData.technicalIndicators.bollingerBands.upper.toFixed(2)}</td>
                      <td className="py-2 text-sm text-gray-600">Resistance</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-gray-900">Bollinger Lower</td>
                      <td className="py-2 text-sm text-gray-900">${stockData.technicalIndicators.bollingerBands.lower.toFixed(2)}</td>
                      <td className="py-2 text-sm text-gray-600">Support</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fundamental' && (
          <div className="space-y-6">
            {/* Valuation Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">P/E Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{stockData.fundamentals.peRatio.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">Price to Earnings</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">P/B Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{stockData.fundamentals.pbRatio.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">Price to Book</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">EPS</p>
                <p className="text-2xl font-bold text-gray-900">${stockData.fundamentals.eps.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Earnings Per Share</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Dividend Yield</p>
                <p className="text-2xl font-bold text-gray-900">{stockData.fundamentals.dividendYield.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">Annual Dividend</p>
              </div>
            </div>

            {/* Financial Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue & Debt</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Annual Revenue</span>
                    <span className="font-medium">${(stockData.fundamentals.revenue / 1e9).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Debt</span>
                    <span className="font-medium">${(stockData.fundamentals.debt / 1e9).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Debt-to-Revenue</span>
                    <span className={`font-medium ${
                      (stockData.fundamentals.debt / stockData.fundamentals.revenue) < 0.3 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {((stockData.fundamentals.debt / stockData.fundamentals.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Quality */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Investment Quality</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valuation</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        stockData.fundamentals.peRatio < 20 ? 'text-green-600' : 
                        stockData.fundamentals.peRatio < 30 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stockData.fundamentals.peRatio < 20 ? 'Good' : 
                         stockData.fundamentals.peRatio < 30 ? 'Fair' : 'Expensive'}
                      </span>
                      {stockData.fundamentals.peRatio < 20 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Dividend</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        stockData.fundamentals.dividendYield > 2 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {stockData.fundamentals.dividendYield > 2 ? 'Good Yield' : 'Low Yield'}
                      </span>
                      {stockData.fundamentals.dividendYield > 2 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Analysis
          </button>
        </div>
      )}
    </div>
  )
}

export default StockAnalysis 