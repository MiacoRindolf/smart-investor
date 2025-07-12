import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Users,
  Building,
  Zap
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import Card from './ui/Card'
import Button from './ui/Button'
import Alert from './ui/Alert'
import type { PelosiTrade, PelosiAnalytics, PelosiInsights } from '../types'
import { getPelosiTrades, calculatePelosiAnalytics, calculatePelosiInsights } from '../services/api'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

const PelosiTracker: React.FC = () => {
  const [trades, setTrades] = useState<PelosiTrade[]>([])
  const [analytics, setAnalytics] = useState<PelosiAnalytics | null>(null)
  const [insights, setInsights] = useState<PelosiInsights | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<PelosiTrade | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PROFITABLE' | 'LOSING'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const fetchedTrades = await getPelosiTrades()
        setTrades(fetchedTrades)
        
        if (fetchedTrades.length > 0) {
          const fetchedAnalytics = await calculatePelosiAnalytics(fetchedTrades)
          const fetchedInsights = await calculatePelosiInsights(fetchedTrades)
          
          setAnalytics(fetchedAnalytics)
          setInsights(fetchedInsights)
        }
      } catch (error: any) {
        console.error('Error loading Pelosi tracker data:', error)
        setError(error.message || 'Failed to load trading data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredTrades = trades.filter(trade => {
    switch (filter) {
      case 'ACTIVE':
        return trade.status === 'ACTIVE'
      case 'PROFITABLE':
        return trade.profitLoss > 0
      case 'LOSING':
        return trade.profitLoss < 0
      default:
        return true
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CLOSED':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getTradeTypeColor = (tradeType: string) => {
    switch (tradeType) {
      case 'BUY':
      case 'CALL':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'SELL':
      case 'PUT':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/20 rounded w-96"></div>
            <div className="h-6 bg-white/20 rounded w-80"></div>
            <div className="flex space-x-4 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/20 rounded-lg p-4 w-32 h-20"></div>
              ))}
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="error" title="Data Loading Error" size="lg">
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
      </div>
    )
  }

  if (!analytics || !insights) {
    return (
      <div className="space-y-6">
        <Alert variant="info" title="No Data Available" size="lg">
          <p>No congressional trading data is currently available.</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Nancy Pelosi Options Tracker</h1>
                <p className="text-purple-100 text-lg">
                  Congressional trading activity & profit analysis
                </p>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                <div className="text-sm text-purple-100 font-medium">Total P&L</div>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalProfitLoss)}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                <div className="text-sm text-purple-100 font-medium">Win Rate</div>
                <div className="text-2xl font-bold">{analytics.winRate}%</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                <div className="text-sm text-purple-100 font-medium">Active Trades</div>
                <div className="text-2xl font-bold">{analytics.activeTrades}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                <div className="text-sm text-purple-100 font-medium">Avg Return</div>
                <div className="text-2xl font-bold">{analytics.averageReturn}%</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              variant="outline"
              icon={<RefreshCw className="h-4 w-4" />}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              icon={<Download className="h-4 w-4" />}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Export Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <Card variant="elevated" className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
          <Card.Header divider className="dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Performance
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyPerformance}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      className="dark:text-gray-300"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      className="dark:text-gray-300"
                    />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Profit/Loss']}
                  />
                  <Area
                    type="monotone"
                    dataKey="profitLoss"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Sector Breakdown */}
        <Card variant="elevated" className="dark:bg-gray-800 dark:border-gray-700">
          <Card.Header divider className="dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Sector Breakdown
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analytics.sectorBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sector, percentage }) => `${sector} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="trades"
                  >
                    {analytics.sectorBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${name}: ${value} trades`,
                      'Trades'
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Trading Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trading Patterns */}
        <Card variant="elevated" className="dark:bg-gray-800 dark:border-gray-700">
          <Card.Header divider className="dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Trading Patterns
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {insights.tradingPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{pattern.pattern}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{pattern.frequency} occurrences</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{pattern.successRate}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Market Timing */}
        <Card variant="elevated" className="dark:bg-gray-800 dark:border-gray-700">
          <Card.Header divider className="dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Market Timing Analysis
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{insights.marketTiming.accuracy}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Timing Accuracy</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Return</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{insights.marketTiming.averageReturn}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Market Correlation</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{(insights.correlationWithMarket * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Hold Time</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{insights.averageHoldTime} days</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Trades Table */}
      <Card variant="elevated" className="dark:bg-gray-800 dark:border-gray-700">
        <Card.Header divider className="dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Trading Activity
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={filter === 'ACTIVE' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('ACTIVE')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'PROFITABLE' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('PROFITABLE')}
              >
                Profitable
              </Button>
              <Button
                variant={filter === 'LOSING' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('LOSING')}
              >
                Losing
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Trade Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Trade Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Trade Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Current Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">P&L</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{trade.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{trade.companyName}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTradeTypeColor(trade.tradeType)}`}>
                        {trade.tradeType}
                        {trade.optionType && ` ${trade.optionType}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(trade.tradeDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">${trade.tradePrice}</div>
                      {trade.strikePrice && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">Strike: ${trade.strikePrice}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">${trade.currentPrice}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-semibold ${trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(trade.profitLoss)}
                      </div>
                      <div className={`text-sm ${trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.profitLossPercent > 0 ? '+' : ''}{trade.profitLossPercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(trade.status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{trade.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => setSelectedTrade(trade)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setSelectedTrade(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedTrade.symbol} - {selectedTrade.companyName}
                  </h2>
                  <Button onClick={() => setSelectedTrade(null)} variant="secondary">
                    Close
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Trade Type</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedTrade.tradeType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedTrade.status)}
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedTrade.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Trade Date</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatDate(selectedTrade.tradeDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Held</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedTrade.daysHeld} days</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Trade Price</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">${selectedTrade.tradePrice}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Price</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">${selectedTrade.currentPrice}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Profit/Loss</span>
                      <div className={`text-2xl font-bold ${selectedTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedTrade.profitLoss)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Percentage Return</span>
                      <div className={`text-lg font-semibold ${selectedTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedTrade.profitLossPercent > 0 ? '+' : ''}{selectedTrade.profitLossPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Disclosure Date:</strong> {formatDate(selectedTrade.disclosureDate)}</p>
                    <p><strong>Filing Date:</strong> {formatDate(selectedTrade.filingDate)}</p>
                    <p><strong>Source:</strong> {selectedTrade.source}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PelosiTracker 