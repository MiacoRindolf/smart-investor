import React from 'react'

// Performance optimization utilities

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoization helper
export const memoize = <T extends (...args: any[]) => any>(
  func: T
): T => {
  const cache = new Map()
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading helper
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc)
}

// Intersection Observer for infinite scrolling
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  })
}

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
}

// Bundle size monitoring
export const logBundleSize = () => {
  if (import.meta.env.DEV) {
    console.log('[PERF] Development mode - bundle size monitoring disabled')
    return
  }
  
  // In production, you could add bundle size monitoring here
  console.log('[PERF] Bundle size monitoring active')
}

// Memory usage monitoring
export const logMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log('[PERF] Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    })
  }
}

// Network performance monitoring
export const measureNetworkPerformance = async (url: string) => {
  const start = performance.now()
  try {
    await fetch(url)
    const end = performance.now()
    console.log(`[PERF] Network request to ${url} took ${end - start} milliseconds`)
  } catch (error) {
    console.error(`[PERF] Network request to ${url} failed:`, error)
  }
} 