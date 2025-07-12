import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Leaf,
  Activity,
  Database,
  Zap
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
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  icon, 
  label, 
  status, 
  description 
}) => {
  const statusClasses = {
    active: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    offline: 'bg-gray-50 text-gray-700 border-gray-200'
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

    return () => clearInterval(interval)
  }, [])

  const positionClasses = position === 'fixed' 
    ? 'fixed top-4 right-4 z-50'
    : 'relative'

  return (
    <div className={`${positionClasses} space-y-2 ${className}`}>
      {/* Market Data Status */}
      <StatusBadge
        icon={hasRealData ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        label={hasRealData ? "Live Market Data" : "Demo Mode"}
        status={hasRealData ? "active" : "warning"}
        description={hasRealData ? "Real-time feeds active" : "Simulated data only"}
      />

      {/* AI Assistant Status */}
      <StatusBadge
        icon={hasAI ? <Zap className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        label={hasAI ? "AI Assistant" : "Limited AI"}
        status={hasAI ? "active" : "warning"}
        description={hasAI ? "OpenAI GPT-4 enabled" : "Demo responses only"}
      />

      {/* Conservation Mode */}
      {conservationMode && (
        <StatusBadge
          icon={<Leaf className="h-4 w-4" />}
          label="Conservation Mode"
          status="warning"
          description="Reduced API usage active"
        />
      )}

      {/* API Usage (Enterprise Feature) */}
      {hasRealData && (
        <StatusBadge
          icon={<Activity className="h-4 w-4" />}
          label="API Usage"
          status="active"
          description={`${apiCallCount} calls today`}
        />
      )}

      {/* System Status */}
      <StatusBadge
        icon={<Database className="h-4 w-4" />}
        label="System Status"
        status="active"
        description="All systems operational"
      />
    </div>
  )
}

export default StatusIndicator 