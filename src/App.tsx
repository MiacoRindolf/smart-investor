import React, { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Trading from './pages/Trading'
import Education from './pages/Education'
import Layout from './components/layout/Layout'
import StatusIndicator from './components/ui/StatusIndicator'
import { RateLimitAlert } from './components/ui/Alert'
import { STORAGE_KEYS } from './config/constants'

// Simple router component for this demo
const useRouter = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  return { currentPath, navigate }
}

// Hook to manage countdown timer
const useCountdownTimer = () => {
  const [timeUntilReset, setTimeUntilReset] = useState('')

  useEffect(() => {
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

  return timeUntilReset
}

const App: React.FC = () => {
  const { currentPath } = useRouter()
  const countdown = useCountdownTimer()
  const [showRateLimit, setShowRateLimit] = useState(false)

  // Check if rate limit error should be shown
  useEffect(() => {
    const rateLimitFlag = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT_FLAG)
    setShowRateLimit(!!rateLimitFlag)
  }, [])

  // Handle navigation clicks
  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.href.startsWith(window.location.origin)) {
        e.preventDefault()
        const path = new URL(target.href).pathname
        window.history.pushState({}, '', path)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const renderPage = () => {
    // Show rate limit error if present
    if (showRateLimit) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <RateLimitAlert
              countdown={countdown}
              onRetry={() => {
                localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT_FLAG)
                setShowRateLimit(false)
                window.location.reload()
              }}
            />
          </div>
        </div>
      )
    }

    // Normal page rendering
    switch (currentPath) {
      case '/':
        return <Dashboard />
      case '/market':
        return <Market />
      case '/trading':
        return <Trading />
      case '/education':
        return <Education />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showRateLimit ? (
        // Rate limit error state
        renderPage()
      ) : (
        // Normal app layout
        <>
          <Layout currentPath={currentPath}>
            {renderPage()}
          </Layout>
          <StatusIndicator />
        </>
      )}
    </div>
  )
}

export default App 