/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALPHA_VANTAGE_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_QUIVER_QUANTITATIVE_API_KEY: string
  readonly VITE_OPENSECRETS_API_KEY: string
  readonly VITE_EARNINGS_WHISPER_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 