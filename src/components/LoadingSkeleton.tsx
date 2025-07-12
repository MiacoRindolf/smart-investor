import React from 'react'

interface SkeletonProps {
  className?: string
  height?: string
  width?: string
  lines?: number
}

const Skeleton = ({ className = '', height = 'h-4', width = 'w-full', lines = 1 }: SkeletonProps) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} ${width} ${index > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </div>
  )
}

// Stock Card Skeleton
export const StockCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="text-right">
        <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  </div>
)

// Market Index Skeleton
export const MarketIndexSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div>
        <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="text-right">
        <div className="h-5 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  </div>
)

// News Item Skeleton
export const NewsItemSkeleton = () => (
  <div className="border-b border-gray-200 pb-4 last:border-b-0 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
    <div className="flex items-center justify-between">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
)

// Portfolio Summary Skeleton
export const PortfolioSummarySkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-18 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-14"></div>
      </div>
    </div>
  </div>
)

// Chart Skeleton
export const ChartSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse`}>
    <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
    <div className={`bg-gray-200 rounded ${height} flex items-end justify-between px-4 pb-4`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-300 rounded-t w-8"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
)

// Table Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Error State Component
interface ErrorStateProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const ErrorState = ({ title, message, action }: ErrorStateProps) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="text-red-600 mb-4">
      <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
    <p className="text-red-700 mb-4">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
)

// Rate Limit Error Component with Countdown
export const RateLimitError = () => {
  const [timeUntilReset, setTimeUntilReset] = React.useState('')

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const currentET = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
      
      // Next midnight EST
      const nextMidnight = new Date(currentET)
      nextMidnight.setHours(24, 0, 0, 0)
      
      const diff = nextMidnight.getTime() - currentET.getTime()
      
      if (diff <= 0) {
        setTimeUntilReset('Reset available! Refresh the page.')
        return
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s until reset`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="text-yellow-600 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-yellow-900 mb-2">🚫 Daily API Limit Reached</h3>
      <p className="text-yellow-700 mb-4">
        You've reached the 25 requests per day limit for Alpha Vantage's free tier.
      </p>
      
      {/* Countdown Timer */}
      <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 mb-4">
        <div className="text-yellow-900 font-mono text-lg font-bold">
          ⏰ {timeUntilReset}
        </div>
        <div className="text-sm text-yellow-700 mt-1">
          (Midnight Eastern Time)
        </div>
      </div>

      <div className="bg-yellow-100 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Solutions:</h4>
        <ul className="text-left text-yellow-800 space-y-1">
          <li>• ⏳ Wait for the countdown above to reach zero (free)</li>
          <li>• 💳 <a href="https://www.alphavantage.co/premium/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Upgrade to Alpha Vantage Premium</a> for unlimited requests</li>
          <li>• 🎮 Use the app in demo mode until your limit resets</li>
        </ul>
      </div>
      
      {/* Conservation Mode Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="text-sm text-green-800">
          <strong>🌱 Conservation Mode Active:</strong> The app now uses 5-minute caching and 2-second delays between API calls to preserve your quota for tomorrow.
        </div>
      </div>
      <div className="text-sm text-yellow-600">
        <strong>API Key:</strong> your_alpha_vantage_api_key_here
      </div>
    </div>
  )
}

export default Skeleton 