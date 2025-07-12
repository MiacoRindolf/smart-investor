import React, { useState, useMemo } from 'react'
import Card from '../components/ui/Card'
import PatternManager from '../components/PatternManager'
import StockAnalysis from '../components/StockAnalysis'
import { useStore } from '../store/useStore'

const marketCards = [
  {
    title: 'Market Sentiment',
    value: 'Neutral',
    subtitle: 'Fear & Greed: 50',
    icon: '📈',
    bg: 'bg-gradient-to-tr from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700',
    text: 'text-white',
  },
  {
    title: 'Volatility (VIX)',
    value: '0',
    subtitle: 'Low Volatility',
    icon: '🌪️',
    bg: 'bg-gradient-to-tr from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700',
    text: 'text-white',
  },
  {
    title: 'Top Sector',
    value: 'N/A',
    subtitle: 'No data',
    icon: '🏆',
    bg: 'bg-gradient-to-tr from-green-500 to-emerald-500 dark:from-green-700 dark:to-emerald-700',
    text: 'text-white',
  },
  {
    title: 'Market Direction',
    value: 'Bearish',
    subtitle: 'S&P 500 trend',
    icon: '🧭',
    bg: 'bg-gradient-to-tr from-blue-500 to-indigo-500 dark:from-blue-700 dark:to-indigo-700',
    text: 'text-white',
  },
]

const Market: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pattern'>('overview')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const {
    searchQuery,
    setSearchQuery,
    searchStocks,
    searchResults,
    isSearching,
    searchError,
    clearSearch
  } = useStore()

  const handleTabSwitch = (tab: 'overview' | 'pattern') => {
    setActiveTab(tab)
    clearSearch()
    setSelectedStock(null)
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchStocks(searchQuery)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 animate-pulse">
            <span className="mr-1 text-green-500 dark:text-green-300">●</span> Live Market Data
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: 7/12/2025, 2:19:15 AM
          </span>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition font-semibold shadow-sm">
          Refresh Market Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-2 py-3 text-sm font-medium border-b-2 focus:outline-none ${activeTab === 'overview' ? 'text-blue-700 dark:text-blue-300 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 border-transparent'}`}
          onClick={() => handleTabSwitch('overview')}
        >
          <span className="mr-2">📊</span> Market Overview
        </button>
        <button
          className={`px-2 py-3 text-sm font-medium border-b-2 focus:outline-none ${activeTab === 'pattern' ? 'text-blue-700 dark:text-blue-300 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 border-transparent'}`}
          onClick={() => handleTabSwitch('pattern')}
        >
          <span className="mr-2">🧩</span> Pattern Scanner
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Market Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketCards.map((card, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-6 shadow-lg transition-transform transform hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-400 ${card.bg} ${card.text}`}
                tabIndex={0}
                role="region"
                aria-label={card.title}
              >
                <div className="absolute top-4 right-4 text-3xl opacity-30 pointer-events-none select-none">{card.icon}</div>
                <div className="text-sm font-semibold opacity-90 mb-1">{card.title}</div>
                <div className="text-3xl font-extrabold mb-1 drop-shadow-sm">{card.value}</div>
                <div className="text-xs opacity-80">{card.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Search Section */}
          <Card className="mt-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-8">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Search stocks by symbol or company name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                    />
                  </div>
                  <button
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 font-semibold transition shadow"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {searchError && (
                  <div className="text-red-600 dark:text-red-400 text-sm font-semibold">{searchError}</div>
                )}
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {searchResults.map(stock => (
                      <Card key={stock.symbol} className="transition hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-400">
                        <div
                          className="cursor-pointer hover:scale-[1.03] p-4 rounded-xl transition"
                          onClick={() => setSelectedStock(stock.symbol)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedStock(stock.symbol) }}
                        >
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{stock.symbol}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{stock.name}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 48 48" stroke="currentColor">
                      <circle cx="22" cy="22" r="10" strokeWidth="4" />
                      <line x1="32" y1="32" x2="44" y2="44" strokeWidth="4" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Discover Stocks</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl">
                      Search for any publicly traded stock to get comprehensive analysis including technical indicators, fundamental data, and AI-powered recommendations.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-6">
                      {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].map((sym) => (
                        <button
                          key={sym}
                          className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={() => setSearchQuery(sym)}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          {/* Stock Analysis Modal */}
          {selectedStock && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setSelectedStock(null)}>
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Stock Analysis - {selectedStock}</h2>
                      <button onClick={() => setSelectedStock(null)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
                    </div>
                    <StockAnalysis symbol={selectedStock} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {activeTab === 'pattern' && (
        <PatternManager />
      )}
    </div>
  )
}

export default Market 