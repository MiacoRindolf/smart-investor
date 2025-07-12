import React from 'react'
import { TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { useMultipleStockSubscription } from '../hooks/useWebSocket'
import { useStore } from '../store/useStore'
import { Stock } from '../types'
import Card from './ui/Card'
import Button from './ui/Button'

const RealtimeWatchlist: React.FC = () => {
  const { watchlist, removeFromWatchlist } = useStore()
  const symbols = watchlist.map((stock: Stock) => stock.symbol)
  
  const { data: realtimeData, loading } = useMultipleStockSubscription(symbols)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  return (
    <Card variant="elevated" className="dark:bg-gray-800 dark:border-gray-700">
      <Card.Header divider className="dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Watchlist
          </h3>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/trading' }))}
          >
            Add Stock
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        {loading && symbols.length > 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : symbols.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Your watchlist is empty
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/trading' }))}
            >
              Add Stocks
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((stock: Stock) => {
              const realtimeStock = realtimeData.get(stock.symbol)
              const price = realtimeStock?.price || stock.price
              const change = realtimeStock?.change || stock.change
              const changePercent = realtimeStock?.changePercent || stock.changePercent
              const volume = realtimeStock?.volume || stock.volume

              return (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {stock.symbol}
                      </h4>
                      {realtimeStock && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stock.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Vol: {formatVolume(volume)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(price)}
                    </p>
                    <div className={`flex items-center justify-end space-x-1 ${
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {formatCurrency(Math.abs(change))} ({changePercent > 0 ? '+' : ''}{formatNumber(changePercent)}%)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromWatchlist(stock.symbol)}
                    className="ml-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

export default RealtimeWatchlist