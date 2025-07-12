import { useState, useEffect } from 'react'

export const useCountdownTimer = () => {
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