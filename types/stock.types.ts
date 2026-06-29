// ─────────────────────────────────────────────
//  STOCK & ANALYSIS TYPES
//  Mirrors backend: format_analysis_response()
// ─────────────────────────────────────────────

export type SystemType = 'Swing' | 'Position'
export type RiskAppetite = 'LOW' | 'MEDIUM' | 'HIGH'
export type InvestmentGrade = 'A+ (Excellent)' | 'A (Good)' | 'B (Average)' | 'C (Below Average)' | 'D (Poor)'

// ── Raw stock list (GET /api/stocks) ──────────
export interface StockListResponse {
  stocks: string[]
  total_count: number
}

// ── Stock list item from GET /api/stocks/list ──
export interface StockListItem {
  symbol:     string
  name:       string
  sector?:    string
  market_cap?: string
  index_name?: string
}

export interface StocksListApiResponse {
  stocks: StockListItem[]
  total:  number
  stats?: Record<string, unknown>
}

// ── Trading plan (nested in analysis) ────────
export interface TradingPlan {
  signal: string          // e.g. "STRONG BUY", "HOLD/WATCH", "SELL"
  strategy: string        // Enhanced description from backend
  entry_price: string     // e.g. "Around 1234.56"
  stop_loss: string       // e.g. "1180.00" or "N/A"
  target_1: string        // e.g. "1320.00" or "N/A"
  target_2: string
  target_3: string
  trailing_stop_advice: string
}

// ── Technical indicators (dynamic keys from backend) ─
export interface TechnicalIndicators {
  rsi?: number
  macd?: number
  macd_signal?: number
  sma_20?: number
  sma_50?: number
  sma_200?: number
  ema_20?: number
  bollinger_upper?: number
  bollinger_lower?: number
  atr?: number
  volume_ratio?: number
  adx?: number
  [key: string]: number | string | undefined  // backend may add more
}

// ── Sentiment data ────────────────────────────
export interface SentimentData {
  overall_score?: number
  news_sentiment?: number
  social_sentiment?: number
  label?: string
  // Position-only fields
  mda_tone?: string
  mda_score?: number
  [key: string]: number | string | undefined
}

// ── Fundamentals (dynamic, cleaned by backend) ─
export interface FundamentalsData {
  pe_ratio?: number | string
  pb_ratio?: number | string
  market_cap?: string           // backend formats as "1,234,567"
  enterprise_value?: string     // same
  debt_to_equity?: number
  operating_margin?: string     // backend formats as "12.34%"
  profit_margin?: string
  revenue_growth?: string
  earnings_growth?: string
  dividend_yield?: string
  [key: string]: number | string | undefined
}

// ── Full analysis response ────────────────────
export interface StockAnalysis {
  symbol: string
  company_name: string
  analysis_timestamp: string    // ISO string
  system_type: SystemType
  overall_score: number         // 0–100
  investment_grade: InvestmentGrade
  current_price: number
  target_price: number
  potential_return: number      // percentage, can be negative
  trading_plan: TradingPlan
  technical_indicators: TechnicalIndicators
  fundamentals: FundamentalsData
  sentiment: SentimentData
  time_horizon: string          // "1-4 weeks" or "6-18 months"
  source?: 'precomputed' | 'cache' | 'live'
  precomputed_by?: 'worker'
}

// ── Compare response (GET /api/compare/:symbol) ─
export interface CompareResponse {
  swing_analysis: StockAnalysis
  position_analysis: StockAnalysis
}

// ── Signal classification helpers ─────────────
export type SignalStrength = 'strong-buy' | 'buy' | 'hold' | 'sell' | 'avoid' | 'unknown'

export function classifySignal(signal: string): SignalStrength {
  const s = signal.toLowerCase()
  if (s.includes('strong buy')) return 'strong-buy'
  if (s.includes('buy')) return 'buy'
  if (s.includes('hold')) return 'hold'
  if (s.includes('sell')) return 'sell'
  if (s.includes('avoid')) return 'avoid'
  return 'unknown'
}

// ── Plan limits & usage ───────────────────────
export interface PlanLimits {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  stock_analyses_per_day: number
  portfolio_per_day: number
  systems_available: string[]
  compare_enabled: boolean
}

export interface UsageStats {
  analyses_today: number
  portfolios_today: number
  limit: PlanLimits
}

export function gradeToScore(grade: InvestmentGrade): number {
  const map: Record<InvestmentGrade, number> = {
    'A+ (Excellent)': 95,
    'A (Good)': 82,
    'B (Average)': 68,
    'C (Below Average)': 54,
    'D (Poor)': 35,
  }
  return map[grade] ?? 0
}
