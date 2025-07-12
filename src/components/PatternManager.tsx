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
  TrendingDown
} from 'lucide-react'
import { CustomPattern, PatternCondition, PatternAnalysis } from '../types'
import { 
  savePattern, 
  getPatterns, 
  deletePattern, 
  scanStocksForPattern
} from '../services/patternService'
import Card from './ui/Card'
import Button from './ui/Button'

interface PatternManagerProps {
  onPatternSelect?: (pattern: CustomPattern) => void
}

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

  useEffect(() => {
    loadPatterns()
  }, [])

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
      savePattern(newPattern)
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
    
    try {
      const results = await scanStocksForPattern(pattern)
      setScanResults(results)
      savePattern(pattern) // Update pattern stats
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Pattern Scanner</h2>
          <p className="text-gray-600">Create and scan custom stock market patterns</p>
        </div>
        <Button onClick={handleCreatePattern} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Pattern
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pattern List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Patterns</h3>
            <div className="space-y-2">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPattern?.id === pattern.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{pattern.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span>{pattern.conditions.length} conditions</span>
                        <span>{pattern.matchCount} matches</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleScanPattern(pattern)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Scan pattern"
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </button>
                      {pattern.id !== 'default-pattern' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setNewPattern(pattern)
                              setIsEditing(true)
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit pattern"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePattern(pattern.id)
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete pattern"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </>
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
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Pattern' : 'Create New Pattern'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setIsEditing(false)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pattern Name
                  </label>
                  <input
                    type="text"
                    value={newPattern.name}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bullish Momentum Pattern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPattern.description}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what this pattern looks for..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Conditions
                    </label>
                    <Button onClick={addCondition} size="sm" variant="secondary">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newPattern.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <select
                          value={condition.indicator}
                          onChange={(e) => updateCondition(index, { ...condition, indicator: e.target.value as any })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
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
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={50}>50</option>
                            <option value={200}>200</option>
                          </select>
                        )}

                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, { ...condition, operator: e.target.value as any })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="above">Above</option>
                          <option value="below">Below</option>
                          <option value="equals">Equals</option>
                          <option value="greater_than">Greater Than</option>
                          <option value="less_than">Less Than</option>
                        </select>

                        {condition.indicator === 'EMA' && condition.value === 'PRICE' ? (
                          <span className="text-sm text-gray-600">Price</span>
                        ) : (
                          <input
                            type="number"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, { ...condition, value: Number(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                            placeholder="Value"
                          />
                        )}

                        <button
                          onClick={() => removeCondition(index)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
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
            <Card className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedPattern.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedPattern.description}</p>
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
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Pattern Conditions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPattern.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {getIndicatorLabel(condition.indicator, condition.timeframe)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getOperatorLabel(condition.operator)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {condition.value === 'PRICE' ? 'Price' : condition.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scan Results */}
              {scanResults && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Scan Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Stocks Analyzed</p>
                      <p className="text-2xl font-bold text-blue-900">{scanResults.totalStocksAnalyzed}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Matches Found</p>
                      <p className="text-2xl font-bold text-green-900">{scanResults.matches.length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">Match Rate</p>
                      <p className="text-2xl font-bold text-purple-900">{scanResults.matchRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600">Avg Confidence</p>
                      <p className="text-2xl font-bold text-orange-900">{scanResults.averageConfidence.toFixed(1)}%</p>
                    </div>
                  </div>

                  {scanResults.matches.length > 0 ? (
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Matching Stocks</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scanResults.matches.map((match) => (
                          <div key={match.symbol} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h6 className="font-medium text-gray-900">{match.symbol}</h6>
                                <p className="text-sm text-gray-600">{match.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">${match.price.toFixed(2)}</p>
                                <div className={`flex items-center text-sm ${
                                  match.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {match.changePercent >= 0 ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                  )}
                                  {match.changePercent.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-600">
                                  {match.matchedConditions.length}/{match.pattern.conditions.length} conditions
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {match.confidence.toFixed(0)}% confidence
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h5>
                      <p className="text-gray-600">No stocks currently match this pattern. Try adjusting the conditions or scan again later.</p>
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
    </div>
  )
}

export default PatternManager 