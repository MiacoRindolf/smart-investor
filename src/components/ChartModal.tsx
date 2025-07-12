import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, BarChart3, Target, Activity, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { marketAPI, getStockHistoricalData } from '../services/api'
import Card from './ui/Card'
import Button from './ui/Button'

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: string
  patternName: string
}

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  technicalIndicators: {
    rsi: number
    macd: {
      value: number
      signal: number
      histogram: number
    }
    bollingerBands: {
      upper: number
      middle: number
      lower: number
    }
    movingAverage50: number
    movingAverage200: number
  }
  fundamentals: {
    peRatio: number
    eps: number
    dividendYield: number
    beta: number
    revenue: number
    debt: number
    pbRatio: number
  }
  analysisScore: {
    overall: number
    technical: number
    fundamental: number
    recommendation: string
  }
}

const ChartModal = ({ isOpen, onClose, symbol, patternName }: ChartModalProps) => {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [priceData, setPriceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && symbol) {
      loadStockData()
    }
  }, [isOpen, symbol])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const loadStockData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading stock data for:', symbol)
      
      // Fetch stock analysis and historical data
      const [analysis, history] = await Promise.all([
        marketAPI.getStockAnalysis(symbol),
        getStockHistoricalData(symbol, 365)
      ])
      
      setStockData(analysis)
      setPriceData(
        history.map((h) => ({
          date: new Date(h.date).toLocaleDateString(),
          price: h.close,
          volume: h.volume,
          timestamp: h.timestamp
        }))
      )
      console.log('Stock data loaded successfully for:', symbol)
    } catch (error) {
      console.error('Failed to load stock data:', error)
      setError('Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{symbol} Analysis</h2>
            <p className="text-gray-600 dark:text-gray-300">Pattern: {patternName}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading stock data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : stockData ? (
            <div className="space-y-6">
              {/* Stock Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Current Price</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stockData.price.toFixed(2)}</p>
                    </div>
                    <div className={`flex items-center ${stockData.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stockData.changePercent >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      <span className="ml-1 font-medium">{stockData.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Volume</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {(stockData.volume / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">RSI</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {stockData.technicalIndicators.rsi.toFixed(1)}
                      </p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Score</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {stockData.analysisScore.overall}/5
                      </p>
                    </div>
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                </Card>
              </div>

              {/* Price Chart */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Price History (1 Year)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                          minTickGap={30}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Technical Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Indicators</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">RSI (14)</span>
                        <span className={`font-medium ${
                          stockData.technicalIndicators.rsi > 70 ? 'text-red-600 dark:text-red-400' :
                          stockData.technicalIndicators.rsi < 30 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {stockData.technicalIndicators.rsi.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">MACD</span>
                        <span className={`font-medium ${
                          stockData.technicalIndicators.macd.value > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {stockData.technicalIndicators.macd.value.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">MA50</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${stockData.technicalIndicators.movingAverage50.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">MA200</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${stockData.technicalIndicators.movingAverage200.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fundamental Data</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">P/E Ratio</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {stockData.fundamentals.peRatio > 0 ? stockData.fundamentals.peRatio.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">EPS</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {stockData.fundamentals.eps > 0 ? `$${stockData.fundamentals.eps.toFixed(2)}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dividend Yield</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {stockData.fundamentals.dividendYield > 0 ? `${stockData.fundamentals.dividendYield.toFixed(2)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Beta</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {stockData.fundamentals.beta > 0 ? stockData.fundamentals.beta.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Analysis Summary */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Overall Score</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stockData.analysisScore.overall}/5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Technical Score</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stockData.analysisScore.technical}/5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Recommendation</p>
                      <p className={`text-lg font-semibold ${
                        stockData.analysisScore.recommendation.includes('Buy') ? 'text-green-600 dark:text-green-400' :
                        stockData.analysisScore.recommendation.includes('Sell') ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {stockData.analysisScore.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button 
            onClick={() => onClose()} 
            variant="outline"
            type="button"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChartModal 