import { getStockHistoricalData } from './api'

// Types
export interface BacktestConfig {
  symbol: string
  startDate: string
  endDate: string
  initialCapital: number
  strategy: TradingStrategy
  parameters: StrategyParameters
  commission: number
  slippage: number
}

export interface TradingStrategy {
  name: string
  description: string
  parameters: StrategyParameter[]
}

export interface StrategyParameter {
  name: string
  type: 'number' | 'boolean' | 'select'
  label: string
  defaultValue: any
  min?: number
  max?: number
  step?: number
  options?: { value: any; label: string }[]
}

export interface StrategyParameters {
  [key: string]: any
}

export interface BacktestResult {
  symbol: string
  startDate: string
  endDate: string
  initialCapital: number
  finalCapital: number
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  trades: Trade[]
  equity: EquityPoint[]
  benchmark: BenchmarkResult
}

export interface Trade {
  date: string
  type: 'buy' | 'sell'
  price: number
  shares: number
  value: number
  commission: number
  pnl?: number
  cumulativePnl?: number
}

export interface EquityPoint {
  date: string
  equity: number
  drawdown: number
  drawdownPercent: number
}

export interface BenchmarkResult {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Available Strategies
export const AVAILABLE_STRATEGIES: TradingStrategy[] = [
  {
    name: 'Moving Average Crossover',
    description: 'Buy when short-term MA crosses above long-term MA, sell when it crosses below',
    parameters: [
      {
        name: 'shortPeriod',
        type: 'number',
        label: 'Short Period',
        defaultValue: 10,
        min: 2,
        max: 50,
        step: 1
      },
      {
        name: 'longPeriod',
        type: 'number',
        label: 'Long Period',
        defaultValue: 50,
        min: 10,
        max: 200,
        step: 1
      }
    ]
  },
  {
    name: 'RSI Strategy',
    description: 'Buy when RSI is oversold, sell when RSI is overbought',
    parameters: [
      {
        name: 'period',
        type: 'number',
        label: 'RSI Period',
        defaultValue: 14,
        min: 5,
        max: 30,
        step: 1
      },
      {
        name: 'oversold',
        type: 'number',
        label: 'Oversold Level',
        defaultValue: 30,
        min: 10,
        max: 40,
        step: 1
      },
      {
        name: 'overbought',
        type: 'number',
        label: 'Overbought Level',
        defaultValue: 70,
        min: 60,
        max: 90,
        step: 1
      }
    ]
  },
  {
    name: 'MACD Strategy',
    description: 'Buy on MACD bullish crossover, sell on bearish crossover',
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        label: 'Fast Period',
        defaultValue: 12,
        min: 5,
        max: 20,
        step: 1
      },
      {
        name: 'slowPeriod',
        type: 'number',
        label: 'Slow Period',
        defaultValue: 26,
        min: 15,
        max: 50,
        step: 1
      },
      {
        name: 'signalPeriod',
        type: 'number',
        label: 'Signal Period',
        defaultValue: 9,
        min: 5,
        max: 15,
        step: 1
      }
    ]
  },
  {
    name: 'Bollinger Bands Strategy',
    description: 'Buy when price touches lower band, sell when it touches upper band',
    parameters: [
      {
        name: 'period',
        type: 'number',
        label: 'Period',
        defaultValue: 20,
        min: 10,
        max: 50,
        step: 1
      },
      {
        name: 'stdDev',
        type: 'number',
        label: 'Standard Deviation',
        defaultValue: 2,
        min: 1,
        max: 3,
        step: 0.1
      }
    ]
  },
  {
    name: 'Mean Reversion',
    description: 'Buy when price is below moving average, sell when above',
    parameters: [
      {
        name: 'period',
        type: 'number',
        label: 'Period',
        defaultValue: 50,
        min: 20,
        max: 100,
        step: 1
      },
      {
        name: 'threshold',
        type: 'number',
        label: 'Threshold (%)',
        defaultValue: 5,
        min: 1,
        max: 20,
        step: 0.5
      }
    ]
  }
]

// Technical Indicators
class TechnicalIndicators {
  static calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN)
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
        sma.push(sum / period)
      }
    }
    return sma
  }

  static calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(data[0])
      } else {
        ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)))
      }
    }
    return ema
  }

  static calculateRSI(data: number[], period: number): number[] {
    const rsi: number[] = []
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        gains.push(0)
        losses.push(0)
        rsi.push(NaN)
      } else {
        const change = data[i] - data[i - 1]
        gains.push(change > 0 ? change : 0)
        losses.push(change < 0 ? Math.abs(change) : 0)

        if (i < period) {
          rsi.push(NaN)
        } else {
          const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
          const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
          const rs = avgGain / avgLoss
          rsi.push(100 - (100 / (1 + rs)))
        }
      }
    }
    return rsi
  }

  static calculateMACD(data: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): {
    macd: number[]
    signal: number[]
    histogram: number[]
  } {
    const fastEMA = this.calculateEMA(data, fastPeriod)
    const slowEMA = this.calculateEMA(data, slowPeriod)
    const macd = fastEMA.map((fast, i) => fast - slowEMA[i])
    const signal = this.calculateEMA(macd, signalPeriod)
    const histogram = macd.map((macd, i) => macd - signal[i])

    return { macd, signal, histogram }
  }

  static calculateBollingerBands(data: number[], period: number, stdDev: number): {
    upper: number[]
    middle: number[]
    lower: number[]
  } {
    const sma = this.calculateSMA(data, period)
    const upper: number[] = []
    const middle = sma
    const lower: number[] = []

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(NaN)
        lower.push(NaN)
      } else {
        const slice = data.slice(i - period + 1, i + 1)
        const mean = sma[i]
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
        const standardDeviation = Math.sqrt(variance)
        
        upper.push(mean + (standardDeviation * stdDev))
        lower.push(mean - (standardDeviation * stdDev))
      }
    }

    return { upper, middle, lower }
  }
}

// Strategy Implementations
class StrategyImplementations {
  static movingAverageCrossover(data: HistoricalData[], params: StrategyParameters): number[] {
    const closes = data.map(d => d.close)
    const shortSMA = TechnicalIndicators.calculateSMA(closes, params.shortPeriod)
    const longSMA = TechnicalIndicators.calculateSMA(closes, params.longPeriod)
    
    const signals: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < params.longPeriod - 1) {
        signals.push(0)
      } else {
        if (shortSMA[i] > longSMA[i] && shortSMA[i - 1] <= longSMA[i - 1]) {
          signals.push(1) // Buy signal
        } else if (shortSMA[i] < longSMA[i] && shortSMA[i - 1] >= longSMA[i - 1]) {
          signals.push(-1) // Sell signal
        } else {
          signals.push(0) // Hold
        }
      }
    }
    return signals
  }

  static rsiStrategy(data: HistoricalData[], params: StrategyParameters): number[] {
    const closes = data.map(d => d.close)
    const rsi = TechnicalIndicators.calculateRSI(closes, params.period)
    
    const signals: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < params.period) {
        signals.push(0)
      } else {
        if (rsi[i] < params.oversold) {
          signals.push(1) // Buy signal
        } else if (rsi[i] > params.overbought) {
          signals.push(-1) // Sell signal
        } else {
          signals.push(0) // Hold
        }
      }
    }
    return signals
  }

  static macdStrategy(data: HistoricalData[], params: StrategyParameters): number[] {
    const closes = data.map(d => d.close)
    const { macd, signal } = TechnicalIndicators.calculateMACD(
      closes, 
      params.fastPeriod, 
      params.slowPeriod, 
      params.signalPeriod
    )
    
    const signals: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < params.slowPeriod + params.signalPeriod - 1) {
        signals.push(0)
      } else {
        if (macd[i] > signal[i] && macd[i - 1] <= signal[i - 1]) {
          signals.push(1) // Buy signal
        } else if (macd[i] < signal[i] && macd[i - 1] >= signal[i - 1]) {
          signals.push(-1) // Sell signal
        } else {
          signals.push(0) // Hold
        }
      }
    }
    return signals
  }

  static bollingerBandsStrategy(data: HistoricalData[], params: StrategyParameters): number[] {
    const closes = data.map(d => d.close)
    const { upper, lower } = TechnicalIndicators.calculateBollingerBands(
      closes, 
      params.period, 
      params.stdDev
    )
    
    const signals: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < params.period - 1) {
        signals.push(0)
      } else {
        if (closes[i] <= lower[i]) {
          signals.push(1) // Buy signal
        } else if (closes[i] >= upper[i]) {
          signals.push(-1) // Sell signal
        } else {
          signals.push(0) // Hold
        }
      }
    }
    return signals
  }

  static meanReversionStrategy(data: HistoricalData[], params: StrategyParameters): number[] {
    const closes = data.map(d => d.close)
    const sma = TechnicalIndicators.calculateSMA(closes, params.period)
    
    const signals: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (i < params.period - 1) {
        signals.push(0)
      } else {
        const deviation = ((closes[i] - sma[i]) / sma[i]) * 100
        if (deviation < -params.threshold) {
          signals.push(1) // Buy signal
        } else if (deviation > params.threshold) {
          signals.push(-1) // Sell signal
        } else {
          signals.push(0) // Hold
        }
      }
    }
    return signals
  }
}

// Main Backtest Engine
export class BacktestEngine {
  private config: BacktestConfig
  private data: HistoricalData[]
  private signals: number[]

  constructor(config: BacktestConfig) {
    this.config = config
    this.data = []
    this.signals = []
  }

  async run(): Promise<BacktestResult> {
    // Fetch historical data
    await this.fetchData()
    
    // Generate signals based on strategy
    this.generateSignals()
    
    // Execute backtest
    return this.executeBacktest()
  }

  private async fetchData(): Promise<void> {
    try {
      const historicalData = await getStockHistoricalData(
        this.config.symbol,
        365 * 5 // 5 years of data
      )
      
      // Filter data to date range
      this.data = historicalData
        .filter(d => d.date >= this.config.startDate && d.date <= this.config.endDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (error) {
      console.error('Failed to fetch historical data:', error)
      throw new Error('Failed to fetch historical data for backtest')
    }
  }

  private generateSignals(): void {
    const strategyName = this.config.strategy.name.toLowerCase().replace(/\s+/g, '')
    
    switch (strategyName) {
      case 'movingaveragecrossover':
        this.signals = StrategyImplementations.movingAverageCrossover(this.data, this.config.parameters)
        break
      case 'rsistrategy':
        this.signals = StrategyImplementations.rsiStrategy(this.data, this.config.parameters)
        break
      case 'macdstrategy':
        this.signals = StrategyImplementations.macdStrategy(this.data, this.config.parameters)
        break
      case 'bollingerbandsstrategy':
        this.signals = StrategyImplementations.bollingerBandsStrategy(this.data, this.config.parameters)
        break
      case 'meanreversion':
        this.signals = StrategyImplementations.meanReversionStrategy(this.data, this.config.parameters)
        break
      default:
        throw new Error(`Unknown strategy: ${this.config.strategy.name}`)
    }
  }

  private executeBacktest(): BacktestResult {
    let capital = this.config.initialCapital
    let shares = 0
    const trades: Trade[] = []
    const equity: EquityPoint[] = []
    let maxEquity = capital
    let maxDrawdown = 0
    let maxDrawdownPercent = 0

    for (let i = 0; i < this.data.length; i++) {
      const currentPrice = this.data[i].close
      const signal = this.signals[i]
      const date = this.data[i].date

      // Execute trades based on signals
      if (signal === 1 && shares === 0) {
        // Buy signal
        const availableCapital = capital * 0.95 // Use 95% of capital to account for slippage
        const sharesToBuy = Math.floor(availableCapital / currentPrice)
        const tradeValue = sharesToBuy * currentPrice
        const commission = tradeValue * this.config.commission

        if (tradeValue + commission <= capital) {
          shares = sharesToBuy
          capital -= (tradeValue + commission)

          trades.push({
            date,
            type: 'buy',
            price: currentPrice,
            shares: sharesToBuy,
            value: tradeValue,
            commission
          })
        }
      } else if (signal === -1 && shares > 0) {
        // Sell signal
        const tradeValue = shares * currentPrice
        const commission = tradeValue * this.config.commission
        const pnl = tradeValue - commission - (trades[trades.length - 1]?.value || 0)

        capital += (tradeValue - commission)

        trades.push({
          date,
          type: 'sell',
          price: currentPrice,
          shares,
          value: tradeValue,
          commission,
          pnl
        })

        shares = 0
      }

      // Calculate current equity
      const currentEquity = capital + (shares * currentPrice)
      const drawdown = maxEquity - currentEquity
      const drawdownPercent = (drawdown / maxEquity) * 100

      if (currentEquity > maxEquity) {
        maxEquity = currentEquity
      }

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = drawdownPercent
      }

      equity.push({
        date,
        equity: currentEquity,
        drawdown,
        drawdownPercent
      })
    }

    // Close any remaining position
    if (shares > 0) {
      const finalPrice = this.data[this.data.length - 1].close
      const tradeValue = shares * finalPrice
      const commission = tradeValue * this.config.commission
      capital += (tradeValue - commission)

      trades.push({
        date: this.data[this.data.length - 1].date,
        type: 'sell',
        price: finalPrice,
        shares,
        value: tradeValue,
        commission
      })
    }

    // Calculate performance metrics
    const finalCapital = capital
    const totalReturn = finalCapital - this.config.initialCapital
    const totalReturnPercent = (totalReturn / this.config.initialCapital) * 100
    
    const days = (new Date(this.config.endDate).getTime() - new Date(this.config.startDate).getTime()) / (1000 * 60 * 60 * 24)
    const annualizedReturn = Math.pow(finalCapital / this.config.initialCapital, 365 / days) - 1

    // Calculate trade statistics
    const winningTrades = trades.filter(t => t.pnl && t.pnl > 0).length
    const losingTrades = trades.filter(t => t.pnl && t.pnl < 0).length
    const totalTrades = winningTrades + losingTrades
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const wins = trades.filter(t => t.pnl && t.pnl > 0).map(t => t.pnl!)
    const losses = trades.filter(t => t.pnl && t.pnl < 0).map(t => Math.abs(t.pnl!))
    
    const averageWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const averageLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0
    const profitFactor = averageLoss > 0 ? (averageWin * winningTrades) / (averageLoss * losingTrades) : 0

    // Calculate Sharpe Ratio (simplified)
    const returns = equity.slice(1).map((e, i) => (e.equity - equity[i].equity) / equity[i].equity)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0

    // Calculate benchmark (buy and hold)
    const benchmark = this.calculateBenchmark()

    return {
      symbol: this.config.symbol,
      startDate: this.config.startDate,
      endDate: this.config.endDate,
      initialCapital: this.config.initialCapital,
      finalCapital,
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      maxDrawdown,
      maxDrawdownPercent,
      sharpeRatio,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      trades,
      equity,
      benchmark
    }
  }

  private calculateBenchmark(): BenchmarkResult {
    const initialPrice = this.data[0].close
    const finalPrice = this.data[this.data.length - 1].close
    const totalReturn = finalPrice - initialPrice
    const totalReturnPercent = (totalReturn / initialPrice) * 100
    
    const days = (new Date(this.config.endDate).getTime() - new Date(this.config.startDate).getTime()) / (1000 * 60 * 60 * 24)
    const annualizedReturn = Math.pow(finalPrice / initialPrice, 365 / days) - 1

    // Calculate max drawdown for benchmark
    let maxPrice = initialPrice
    let maxDrawdown = 0
    let maxDrawdownPercent = 0

    for (const dataPoint of this.data) {
      if (dataPoint.close > maxPrice) {
        maxPrice = dataPoint.close
      }
      
      const drawdown = maxPrice - dataPoint.close
      const drawdownPercent = (drawdown / maxPrice) * 100

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = drawdownPercent
      }
    }

    // Simplified Sharpe ratio for benchmark
    const returns = this.data.slice(1).map((d, i) => (d.close - this.data[i].close) / this.data[i].close)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      maxDrawdown,
      maxDrawdownPercent,
      sharpeRatio
    }
  }
}

// Public API
export const backtestService = {
  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    const engine = new BacktestEngine(config)
    return await engine.run()
  },

  getAvailableStrategies(): TradingStrategy[] {
    return AVAILABLE_STRATEGIES
  },

  getStrategyByName(name: string): TradingStrategy | undefined {
    return AVAILABLE_STRATEGIES.find(s => s.name === name)
  }
} 