import React from 'react'
import { ComponentWithClassName } from '../../types'
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react'
import Button from './Button'

// Base skeleton component
interface SkeletonProps extends ComponentWithClassName {
  width?: string
  height?: string
  rounded?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}) => (
  <div className={`
    ${width} ${height} bg-gray-200 animate-pulse
    ${rounded ? 'rounded-full' : 'rounded'}
    ${className}
  `} />
)

// Stock Card Skeleton
export const StockCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse dark:bg-gray-800 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Skeleton width="w-10" height="h-10" rounded />
        <div>
          <Skeleton width="w-16" height="h-5" className="mb-2" />
          <Skeleton width="w-24" height="h-4" />
        </div>
      </div>
      <Skeleton width="w-8" height="h-8" rounded />
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton width="w-20" height="h-6" />
        <Skeleton width="w-16" height="h-6" />
      </div>
      <div className="flex justify-between">
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-12" height="h-4" />
      </div>
      <div className="flex justify-between">
        <Skeleton width="w-18" height="h-4" />
        <Skeleton width="w-20" height="h-4" />
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Skeleton width="w-full" height="h-8" />
    </div>
  </div>
)

// Market Index Skeleton
export const MarketIndexSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="w-16" height="h-6" />
      <Skeleton width="w-4" height="h-4" />
    </div>
    
    <div className="space-y-2">
      <Skeleton width="w-24" height="h-8" />
      <div className="flex items-center space-x-2">
        <Skeleton width="w-16" height="h-4" />
        <Skeleton width="w-12" height="h-4" />
      </div>
    </div>
  </div>
)

// News Item Skeleton
export const NewsItemSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start space-x-4">
      <Skeleton width="w-16" height="h-16" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-full" height="h-5" />
        <Skeleton width="w-5/6" height="h-5" />
        <Skeleton width="w-4/6" height="h-4" />
        <div className="flex items-center space-x-4 mt-3">
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-20" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
        </div>
      </div>
    </div>
  </div>
)

// Chart Skeleton
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse ${height}`}>
    <div className="flex items-center justify-between mb-6">
      <Skeleton width="w-32" height="h-6" />
      <Skeleton width="w-24" height="h-8" />
    </div>
    
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-end space-x-2">
          {[...Array(12)].map((_, j) => (
            <Skeleton 
              key={j} 
              width="w-8" 
              height={`h-${Math.floor(Math.random() * 20) + 8}`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width="w-16" height="h-4" />
            <Skeleton width="w-20" height="h-8" />
            <Skeleton width="w-24" height="h-4" />
          </div>
          <Skeleton width="w-12" height="h-12" rounded />
        </div>
      </div>
    ))}
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
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  action,
  className = ''
}) => (
  <div className={`text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-md mx-auto">{message}</p>
    {action && (
      <Button
        onClick={action.onClick}
        variant="primary"
        icon={<RefreshCw className="h-4 w-4" />}
      >
        {action.label}
      </Button>
    )}
  </div>
)

// Rate Limit Error Component
export const RateLimitError: React.FC = () => {
  const [timeUntilReset, setTimeUntilReset] = React.useState('')

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const currentET = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
      
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
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900 dark:border-yellow-700">
      <div className="flex items-center mb-4">
        <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300 mr-3" />
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
          🚫 Daily API Limit Reached
        </h3>
      </div>
      
      <p className="text-yellow-800 dark:text-yellow-200 mb-4">
        You've reached the 25 requests per day limit for Alpha Vantage's free tier.
      </p>
      
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4 dark:bg-yellow-800 dark:border-yellow-600">
        <div className="flex items-center justify-center">
          <Clock className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-300" />
          <span className="font-mono text-lg font-bold text-yellow-900 dark:text-yellow-100">
            {timeUntilReset}
          </span>
        </div>
        <div className="text-center text-sm text-yellow-700 dark:text-yellow-300 mt-1">
          until reset (Midnight Eastern Time)
        </div>
      </div>

      <div className="space-y-3 text-sm text-yellow-800 dark:text-yellow-200">
        <div className="flex items-start">
          <span className="mr-2">⏳</span>
          <span>Wait for the countdown above to reach zero (free)</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">💳</span>
          <span>
            <a 
              href="https://www.alphavantage.co/premium/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-medium"
            >
              Upgrade to Alpha Vantage Premium
            </a>
            {' '}for unlimited requests
          </span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">🎮</span>
          <span>Continue using the app with limited functionality</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center text-green-700 text-sm dark:text-green-300">
          <span className="mr-2">🌱</span>
          <strong>Conservation Mode:</strong>
          <span className="ml-1">
            Reduced API calls and 5-minute caching active
          </span>
        </div>
      </div>
    </div>
  )
} 