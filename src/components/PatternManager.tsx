import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Play, 
  Save,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { CustomPattern, PatternCondition, PatternAnalysis } from '../types'
import { 
  savePattern, 
  getPatterns, 
  deletePattern, 
  scanStocksForPattern,
  updatePattern
} from '../services/patternService'
import Card from './ui/Card'
import Button from './ui/Button'
import StockAnalysis from './StockAnalysis'
import ChartModal from './ChartModal'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { marketAPI, getStockHistoricalData } from '../services/api'
import { dbService } from '../services/database'

interface PatternManagerProps {
  onPatternSelect?: (pattern: CustomPattern) => void
}

const CRYPTO_SYMBOLS = [
  'BTC-USD', 'ETH-USD', 'USDT-USD', 'BNB-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'TON-USD', 'ADA-USD', 'AVAX-USD',
  'SHIB-USD', 'TRX-USD', 'LINK-USD', 'DOT-USD', 'MATIC-USD', 'WBTC-USD', 'BCH-USD', 'LTC-USD', 'ICP-USD', 'DAI-USD',
  'UNI-USD', 'APT-USD', 'ETC-USD', 'MNT-USD', 'FIL-USD', 'STX-USD', 'OKB-USD', 'LEO-USD', 'CRO-USD', 'ARB-USD',
  'XMR-USD', 'IMX-USD', 'HBAR-USD', 'VET-USD', 'INJ-USD', 'OP-USD', 'MKR-USD', 'RUNE-USD', 'AAVE-USD', 'GRT-USD',
  'SUI-USD', 'QNT-USD', 'SNX-USD', 'LDO-USD', 'NEAR-USD', 'BGB-USD', 'USDC-USD', 'SEI-USD', 'MNT-USD', 'RPL-USD',
  'FTM-USD', 'EGLD-USD', 'KAS-USD', 'XLM-USD', 'ALGO-USD', 'XTZ-USD', 'THETA-USD', 'AXS-USD', 'SAND-USD', 'MANA-USD',
  'CHZ-USD', 'ENJ-USD', 'GALA-USD', 'FLOW-USD', 'KAVA-USD', 'ZEC-USD', 'BAT-USD', '1INCH-USD', 'COMP-USD', 'CRV-USD',
  'DYDX-USD', 'ENS-USD', 'FET-USD', 'GMT-USD', 'HOT-USD', 'KSM-USD', 'LRC-USD', 'MINA-USD', 'NEXO-USD', 'OCEAN-USD',
  'OMG-USD', 'PAXG-USD', 'QTUM-USD', 'RSR-USD', 'SKL-USD', 'SRM-USD', 'STORJ-USD', 'SUSHI-USD', 'UMA-USD', 'WAVES-USD',
  'YFI-USD', 'ZIL-USD', 'ZRX-USD', 'BNT-USD', 'CEL-USD', 'CVC-USD', 'DASH-USD', 'DCR-USD', 'DGB-USD', 'DODO-USD',
  'ELF-USD', 'FLOKI-USD', 'GLM-USD', 'HNT-USD', 'ICX-USD', 'KNC-USD', 'LSK-USD', 'LUNA-USD', 'MOB-USD', 'NANO-USD',
  'NMR-USD', 'OXT-USD', 'PERP-USD', 'POWR-USD', 'REN-USD', 'RLC-USD', 'SC-USD', 'SNT-USD', 'STMX-USD', 'STPT-USD',
  'SXP-USD', 'TOMO-USD', 'TWT-USD', 'VTHO-USD', 'WAXP-USD', 'XEM-USD', 'XNO-USD', 'XVS-USD', 'YGG-USD', 'ZEN-USD',
  'AGIX-USD', 'AKT-USD', 'ANKR-USD', 'API3-USD', 'ASTR-USD', 'BAND-USD', 'BICO-USD', 'BLUR-USD', 'BUSD-USD', 'C98-USD',
  'CELO-USD', 'CKB-USD', 'CTSI-USD', 'DENT-USD', 'DFI-USD', 'DIA-USD', 'DOCK-USD', 'DUSK-USD', 'EWT-USD', 'FARM-USD',
  'FORTH-USD', 'FRONT-USD', 'FXS-USD', 'GNO-USD', 'GTC-USD', 'HIVE-USD', 'IDEX-USD', 'ILV-USD', 'JASMY-USD', 'JOE-USD',
  'KLAY-USD', 'LIT-USD', 'LOOM-USD', 'LPT-USD', 'LQTY-USD', 'LUNA2-USD', 'MATIC-USD', 'MDT-USD', 'MIR-USD', 'MLN-USD',
  'MOVR-USD', 'MXC-USD', 'NKN-USD', 'NU-USD', 'OGN-USD', 'OMG-USD', 'ORN-USD', 'OXT-USD', 'POLS-USD', 'POND-USD',
  'QKC-USD', 'QUICK-USD', 'RAY-USD', 'REEF-USD', 'REN-USD', 'REP-USD', 'REQ-USD', 'RIF-USD', 'RLY-USD', 'RUNE-USD',
  'SAND-USD', 'SFP-USD', 'SLP-USD', 'SNT-USD', 'SOL-USD', 'SRM-USD', 'STMX-USD', 'STORJ-USD', 'SUSHI-USD', 'SXP-USD',
  'TOMO-USD', 'TRB-USD', 'TRU-USD', 'TWT-USD', 'UMA-USD', 'UNI-USD', 'USDC-USD', 'USDT-USD', 'VET-USD', 'VGX-USD',
  'WAVES-USD', 'WAXP-USD', 'WIN-USD', 'WOO-USD', 'XEM-USD', 'XLM-USD', 'XMR-USD', 'XNO-USD', 'XRP-USD', 'XTZ-USD',
  'YFI-USD', 'YGG-USD', 'ZEC-USD', 'ZEN-USD', 'ZIL-USD', 'ZRX-USD'
]

const PatternManager = ({}: PatternManagerProps) => {
  const [patterns, setPatterns] = useState<CustomPattern[]>([])
  const [selectedPattern, setSelectedPattern] = useState<CustomPattern | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [scanResults, setScanResults] = useState<PatternAnalysis | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [newPattern, setNewPattern] = useState<CustomPattern>({
    id: '',
    name: '',
    description: '',
    conditions: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    matchCount: 0
  })
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [expandedData, setExpandedData] = useState<any>(null)
  const [expandedLoading, setExpandedLoading] = useState(false)
  const [expandedPriceData, setExpandedPriceData] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'changePercent' | 'confidence'>('confidence')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Modal and pagination state
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadPatterns()
  }, [])

  // Reset pagination when scan results change, but preserve if modal is open
  useEffect(() => {
    if (scanResults && !isChartModalOpen) {
      setCurrentPage(1)
    }
  }, [scanResults, isChartModalOpen])

  const loadPatterns = () => {
    const savedPatterns = getPatterns()
    setPatterns(savedPatterns)
    if (savedPatterns.length > 0 && !selectedPattern) {
      setSelectedPattern(savedPatterns[0])
    }
  }

  const handleCreatePattern = () => {
    setIsCreating(true)
    setNewPattern({
      id: `pattern-${Date.now()}`,
      name: '',
      description: '',
      conditions: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      matchCount: 0
    })
  }

  const handleSavePattern = () => {
    if (newPattern.name.trim() && newPattern.conditions.length > 0) {
      if (isEditing) {
        updatePattern(newPattern)
      } else {
        savePattern(newPattern)
      }
      loadPatterns()
      setIsCreating(false)
      setIsEditing(false)
      setNewPattern({
        id: '',
        name: '',
        description: '',
        conditions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        matchCount: 0
      })
    }
  }

  const handleDeletePattern = (patternId: string) => {
    if (patternId !== 'default-pattern') {
      deletePattern(patternId)
      loadPatterns()
      if (selectedPattern?.id === patternId) {
        setSelectedPattern(patterns[0] || null)
      }
    }
  }

  const handleScanPattern = async (pattern: CustomPattern) => {
    setIsScanning(true)
    setScanResults(null)
    setCurrentPage(1) // Reset to first page
    
    try {
      // Use crypto symbols if on crypto tab, else stocks
      const symbols = activeTab === 'crypto' ? CRYPTO_SYMBOLS : []
      // Always use the latest pattern from storage
      const latestPattern = getPatterns().find(p => p.id === pattern.id) || pattern
      const results = await scanStocksForPattern(latestPattern, symbols)
      setScanResults(results)
      updatePattern(latestPattern) // Update pattern stats
      loadPatterns()
    } catch (error) {
      console.error('Error scanning pattern:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const addCondition = () => {
    const newCondition: PatternCondition = {
      indicator: 'RSI',
      operator: 'above',
      value: 50
    }
    setNewPattern(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }))
  }

  const updateCondition = (index: number, condition: PatternCondition) => {
    setNewPattern(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => i === index ? condition : c)
    }))
  }

  const removeCondition = (index: number) => {
    setNewPattern(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  const getIndicatorLabel = (indicator: string, timeframe?: number) => {
    switch (indicator) {
      case 'EMA':
        return `EMA ${timeframe || ''}`
      case 'RSI':
        return 'RSI'
      case 'MACD':
        return 'MACD Line'
      case 'MACD_SIGNAL':
        return 'MACD Signal'
      case 'PRICE':
        return 'Price'
      case 'VOLUME':
        return 'Volume'
      default:
        return indicator
    }
  }

  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case 'above':
        return 'Above'
      case 'below':
        return 'Below'
      case 'equals':
        return 'Equals'
      case 'greater_than':
        return 'Greater Than'
      case 'less_than':
        return 'Less Than'
      default:
        return operator
    }
  }

  const handleExpandMatch = async (symbol: string) => {
    console.log('Opening modal for symbol:', symbol)
    setSelectedSymbol(symbol)
    setIsChartModalOpen(true)
  }

  const handleSort = (field: 'symbol' | 'price' | 'changePercent' | 'confidence') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortedMatches = () => {
    if (!scanResults?.matches) return []
    
    return [...scanResults.matches].sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'symbol':
          aValue = a.symbol
          bValue = b.symbol
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'changePercent':
          aValue = a.changePercent
          bValue = b.changePercent
          break
        case 'confidence':
          aValue = a.confidence
          bValue = b.confidence
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const getPaginatedMatches = () => {
    const sorted = getSortedMatches()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sorted.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil((scanResults?.matches?.length || 0) / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCloseModal = () => {
    setIsChartModalOpen(false)
    setSelectedSymbol('')
    // Ensure we don't lose any state
    console.log('Modal closed, preserving scan results and pagination state')
  }

  const SortButton = ({ field, label }: { field: 'symbol' | 'price' | 'changePercent' | 'confidence', label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span>{label}</span>
      {sortBy === field ? (
        sortOrder === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )
      ) : (
        <div className="h-4 w-4" />
      )}
    </button>
  )

  const handleTabSwitch = (tab: 'stocks' | 'crypto') => {
    setActiveTab(tab)
    setSelectedPattern(null)
    setScanResults(null)
    setIsEditing(false)
    setIsCreating(false)
    setExpandedMatch(null)
    setExpandedData(null)
    setExpandedPriceData([])
    setCurrentPage(1) // Reset to first page
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'stocks' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
          onClick={() => handleTabSwitch('stocks')}
        >
          Stocks
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'crypto' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
          onClick={() => handleTabSwitch('crypto')}
        >
          Crypto
        </button>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Custom Pattern Scanner</h2>
          <p className="text-gray-600 dark:text-gray-300">Create and scan custom stock market patterns</p>
        </div>
        <Button onClick={handleCreatePattern} disabled={isCreating || isEditing}>
          <Plus className="h-4 w-4 mr-2" />
          New Pattern
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pattern List */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Saved Patterns</h3>
            <div className="space-y-2">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPattern?.id === pattern.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 dark:border-blue-400'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500'
                  }`}
                  onClick={() => {
                    setSelectedPattern(pattern)
                    setIsEditing(false)
                    setIsCreating(false)
                    // Only reset scan results if we're switching to a different pattern
                    if (selectedPattern?.id !== pattern.id) {
                      setScanResults(null)
                      setCurrentPage(1)
                    }
                    setExpandedMatch(null)
                    setExpandedData(null)
                    setExpandedPriceData([])
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{pattern.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{pattern.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{pattern.conditions.length} conditions</span>
                        <span>{pattern.matchCount} matches</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleScanPattern(pattern)
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Scan pattern"
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setNewPattern(pattern)
                          setIsEditing(true)
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edit pattern"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      {pattern.id !== 'default-pattern' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePattern(pattern.id)
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Delete pattern"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pattern Editor/Scanner */}
        <div className="lg:col-span-2">
          {isCreating || isEditing ? (
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isEditing ? 'Edit Pattern' : 'Create New Pattern'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setIsEditing(false)
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pattern Name
                  </label>
                  <input
                    type="text"
                    value={newPattern.name}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Bullish Momentum Pattern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPattern.description}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Describe what this pattern looks for..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Conditions
                    </label>
                    <Button onClick={addCondition} size="sm" variant="secondary">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newPattern.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <select
                          value={condition.indicator}
                          onChange={(e) => updateCondition(index, { ...condition, indicator: e.target.value as any })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                          <option value="EMA">EMA</option>
                          <option value="RSI">RSI</option>
                          <option value="MACD">MACD Line</option>
                          <option value="MACD_SIGNAL">MACD Signal</option>
                          <option value="PRICE">Price</option>
                          <option value="VOLUME">Volume</option>
                        </select>

                        {condition.indicator === 'EMA' && (
                          <select
                            value={condition.timeframe || 50}
                            onChange={(e) => updateCondition(index, { ...condition, timeframe: Number(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          >
                            <option value={50}>50</option>
                            <option value={200}>200</option>
                          </select>
                        )}

                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, { ...condition, operator: e.target.value as any })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                          <option value="above">Above</option>
                          <option value="below">Below</option>
                          <option value="equals">Equals</option>
                          <option value="greater_than">Greater Than</option>
                          <option value="less_than">Less Than</option>
                        </select>

                        {condition.indicator === 'EMA' && condition.value === 'PRICE' ? (
                          <span className="text-sm text-gray-600 dark:text-gray-300">Price</span>
                        ) : (
                          <input
                            type="number"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, { ...condition, value: Number(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm w-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder="Value"
                          />
                        )}

                        <button
                          onClick={() => removeCondition(index)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      setIsCreating(false)
                      setIsEditing(false)
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSavePattern} disabled={!newPattern.name.trim() || newPattern.conditions.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Pattern
                  </Button>
                </div>
              </div>
            </Card>
          ) : selectedPattern ? (
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {/* Pattern Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedPattern.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedPattern.description}</p>
                </div>
                <Button
                  onClick={() => handleScanPattern(selectedPattern)}
                  disabled={isScanning}
                  className="ml-4"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Scan Market
                    </>
                  )}
                </Button>
              </div>

              {/* Pattern Conditions */}
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Pattern Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPattern.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {getIndicatorLabel(condition.indicator, condition.timeframe)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getOperatorLabel(condition.operator)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {condition.value === 'PRICE' ? 'Price' : condition.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Scan Results */}
              {scanResults && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Scan Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-200">Stocks Analyzed</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{scanResults.totalStocksAnalyzed}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/40 p-4 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-200">Matches Found</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{scanResults.matches.length}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/40 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-200">Match Rate</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{scanResults.matchRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/40 p-4 rounded-lg">
                      <p className="text-sm text-orange-600 dark:text-orange-200">Avg Confidence</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{scanResults.averageConfidence.toFixed(1)}%</p>
                    </div>
                  </div>

                  {scanResults.matches.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">Matching Stocks ({scanResults.matches.length})</h5>
                        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                          <SortButton field="symbol" label="Symbol" />
                          <SortButton field="price" label="Price" />
                          <SortButton field="changePercent" label="Change" />
                          <SortButton field="confidence" label="Confidence" />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conditions</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confidence</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                              {getPaginatedMatches().map((match) => (
                                <tr 
                                  key={match.symbol} 
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                  onClick={() => handleExpandMatch(match.symbol)}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{match.symbol}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-32">{match.name}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">${match.price.toFixed(2)}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className={`flex items-center justify-end text-sm ${match.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}> 
                                      {match.changePercent >= 0 ? (
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                      )}
                                      {match.changePercent.toFixed(2)}%
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {match.matchedConditions.length}/{match.pattern.conditions.length}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {match.confidence.toFixed(0)}%
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleExpandMatch(match.symbol)
                                      }}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                                    >
                                      View Chart
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, scanResults.matches.length)} of {scanResults.matches.length} results
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </button>
                            
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                  pageNum = i + 1
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i
                                } else {
                                  pageNum = currentPage - 2 + i
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                      currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                )
                              })}
                            </div>
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      )}
                      

                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Matches Found</h5>
                      <p className="text-gray-600 dark:text-gray-300">No stocks currently match this pattern. Try adjusting the conditions or scan again later.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Pattern</h3>
              <p className="text-gray-600">Choose a pattern from the list to view details and scan for matches.</p>
            </Card>
          )}
        </div>
      </div>
      
      {/* Chart Modal */}
      <ChartModal
        isOpen={isChartModalOpen}
        onClose={handleCloseModal}
        symbol={selectedSymbol}
        patternName={selectedPattern?.name || ''}
      />
    </div>
  )
}

export default PatternManager 