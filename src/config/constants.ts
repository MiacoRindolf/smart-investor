// API Configuration
export const API_CONFIG = {
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    RATE_LIMIT: 25, // requests per day for free tier
    TIMEOUT: 15000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MIN_DELAY_BETWEEN_CALLS: 2000, // 2 seconds
    MAX_CONCURRENT_CALLS: 2,
  },
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    TIMEOUT: 30000,
    MODEL: 'gpt-4',
    MAX_TOKENS: 2000,
  }
} as const

// Market Data
export const MARKET_INDICES = {
  NORMAL: ['SPY', 'QQQ', 'DIA', 'IWM'],
  CONSERVATION: ['SPY', 'QQQ'],
} as const

export const SECTOR_ETFS = {
  NORMAL: [
    { symbol: 'XLK', sector: 'Technology' },
    { symbol: 'XLV', sector: 'Healthcare' },
    { symbol: 'XLF', sector: 'Finance' },
    { symbol: 'XLE', sector: 'Energy' },
    { symbol: 'XLY', sector: 'Consumer Discretionary' }
  ],
  CONSERVATION: [
    { symbol: 'XLK', sector: 'Technology' },
    { symbol: 'XLF', sector: 'Finance' }
  ]
} as const

// UI Constants
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
} as const

// Color Palette (Enterprise Grade)
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  }
} as const

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
} as const

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key not found. Please configure your environment variables.',
  RATE_LIMIT_EXCEEDED: 'Daily API limit reached. Please wait for reset or upgrade your plan.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
  INVALID_SYMBOL: 'Invalid stock symbol. Please enter a valid ticker symbol.',
  GENERAL_ERROR: 'An unexpected error occurred. Please try again later.',
} as const

// Storage Keys
export const STORAGE_KEYS = {
  RATE_LIMIT_FLAG: 'alphaVantageRateLimit',
  WATCHLIST: 'investorWatchlist',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'appTheme',
} as const

// Routes
export const ROUTES = {
  DASHBOARD: '/',
  MARKET: '/market',
  TRADING: '/trading',
  EDUCATION: '/education',
} as const 