import { useState, useEffect } from 'react'

export const useRouter = () => {
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

export const useNavigationHandler = () => {
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
} 