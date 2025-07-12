// Test setup for SmartInvestor

// Basic test utilities and mocks
export const mockLocalStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}

export const mockFetch = () => Promise.resolve({ json: () => Promise.resolve({}) })

// Test data - empty to avoid mock values
export const mockStockData = null

export const mockPortfolioData = null

// Test helpers
export const waitForElement = (callback: () => HTMLElement | null) => {
  return new Promise<HTMLElement>((resolve) => {
    const check = () => {
      const element = callback()
      if (element) {
        resolve(element)
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
} 