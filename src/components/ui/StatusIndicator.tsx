import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Leaf,
  Activity,
  Database,
  Zap,
  X as CloseIcon
} from 'lucide-react'
import { STORAGE_KEYS } from '../../config/constants'

interface StatusIndicatorProps {
  position?: 'fixed' | 'relative'
  className?: string
}

interface StatusBadgeProps {
  icon: React.ReactNode
  label: string
  status: 'active' | 'warning' | 'error' | 'offline'
  description?: string
  onClose?: () => void
  showClose?: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  icon, 
  label, 
  status, 
  description,
  onClose,
  showClose
}) => {
  const statusClasses = {
    active: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    offline: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  }

  return (
    <div className={`
      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium 
      border shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md
      ${statusClasses[status]}
    `}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-xs opacity-75 truncate">{description}</div>
        )}
      </div>
      {showClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-gray-200 focus:outline-none"
          aria-label="Close notification"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  position = 'fixed',
  className = ''
}) => {
  const [hasRealData, setHasRealData] = useState(false)
  const [hasAI, setHasAI] = useState(false)
  const [conservationMode, setConservationMode] = useState(false)
  const [apiCallCount, setApiCallCount] = useState(0)
  const [showLiveData, setShowLiveData] = useState(true)
  const [showAI, setShowAI] = useState(true)
  const [showConservation, setShowConservation] = useState(true)
  const [showApiUsage, setShowApiUsage] = useState(true)
  const [showSystemStatus, setShowSystemStatus] = useState(true)

  useEffect(() => {
    // Check API keys
    const alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
    const openAIKey = import.meta.env.VITE_OPENAI_API_KEY
    
    setHasRealData(!!(alphaVantageKey && alphaVantageKey !== 'demo'))
    setHasAI(!!(openAIKey && openAIKey.length > 0))
    
    // Check conservation mode
    const rateLimitTimestamp = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT_FLAG)
    if (rateLimitTimestamp) {
      const rateLimitDate = new Date(parseInt(rateLimitTimestamp))
      const now = new Date()
      const currentET = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
      
      const nextMidnight = new Date(rateLimitDate)
      nextMidnight.setHours(24, 0, 0, 0)
      
      if (currentET >= nextMidnight) {
        localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT_FLAG)
        setConservationMode(false)
      } else {
        setConservationMode(true)
      }
    }

    // Simulate API call counter (in real app, this would come from API service)
    const interval = setInterval(() => {
      setApiCallCount(prev => prev + Math.floor(Math.random() * 2))
    }, 5000)

    // Auto-dismiss logic
    setShowLiveData(true)
    setShowAI(true)
    setShowConservation(true)
    setShowApiUsage(true)
    setShowSystemStatus(true)
    const timers: NodeJS.Timeout[] = []
    timers.push(setTimeout(() => setShowLiveData(false), 4000))
    timers.push(setTimeout(() => setShowAI(false), 4000))
    timers.push(setTimeout(() => setShowConservation(false), 4000))
    timers.push(setTimeout(() => setShowApiUsage(false), 4000))
    timers.push(setTimeout(() => setShowSystemStatus(false), 4000))

    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [])

  const positionClasses = position === 'fixed' 
    ? 'fixed top-4 right-4 z-50'
    : 'relative'

  return (
    <div className={`${positionClasses} space-y-2 ${className}`}>
      {/* Market Data Status */}
      {showLiveData && (
        <StatusBadge
          icon={hasRealData ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          label={hasRealData ? "Live Market Data" : "Demo Mode"}
          status={hasRealData ? "active" : "warning"}
          description={hasRealData ? "Real-time feeds active" : "Simulated data only"}
          onClose={() => setShowLiveData(false)}
          showClose
        />
      )}

      {/* AI Assistant Status */}
      {showAI && (
        <StatusBadge
          icon={hasAI ? <Zap className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          label={hasAI ? "AI Assistant" : "Limited AI"}
          status={hasAI ? "active" : "warning"}
          description={hasAI ? "OpenAI GPT-4 enabled" : "Demo responses only"}
          onClose={() => setShowAI(false)}
          showClose
        />
      )}

      {/* Conservation Mode */}
      {conservationMode && showConservation && (
        <StatusBadge
          icon={<Leaf className="h-4 w-4" />}
          label="Conservation Mode"
          status="warning"
          description="Reduced API usage active"
          onClose={() => setShowConservation(false)}
          showClose
        />
      )}

      {/* API Usage (Enterprise Feature) */}
      {hasRealData && showApiUsage && (
        <StatusBadge
          icon={<Activity className="h-4 w-4" />}
          label="API Usage"
          status="active"
          description={`${apiCallCount} calls today`}
          onClose={() => setShowApiUsage(false)}
          showClose
        />
      )}

      {/* System Status (auto-dismiss and closable) */}
      {showSystemStatus && (
        <StatusBadge
          icon={<Database className="h-4 w-4" />}
          label="System Status"
          status="active"
          description="All systems operational"
          onClose={() => setShowSystemStatus(false)}
          showClose
        />
      )}
    </div>
  )
}

export default StatusIndicator 