// ─────────────────────────────────────────────
//  PORTFOLIO TYPES
//  Mirrors backend: _standardize_portfolio_keys()
//  and generate_swing/position_portfolio()
// ─────────────────────────────────────────────

import type { RiskAppetite } from './stock.types'

// ── Portfolio holding (one stock in the portfolio) ─
export interface PortfolioHolding {
  symbol: string | null
  company: string | null
  score: number | null
  price: number                   // current/entry price
  stop_loss: number
  risk: number                    // risk amount in ₹
  investment_amount: number | null // ₹ allocated to this stock
  number_of_shares: number
  percentage_allocation: number   // 0–100
}

// ── Portfolio summary ─────────────────────────
export interface PortfolioSummary {
  total_budget: number
  total_allocated: number
  remaining_cash: number
  diversification: number          // number of stocks
  average_score: number
}

// ── Full portfolio response ───────────────────
export interface PortfolioResponse {
  portfolio: PortfolioHolding[]
  summary: PortfolioSummary
}

// ── Request payloads ──────────────────────────
export interface SwingPortfolioRequest {
  budget: number                   // ₹10,000 – ₹10,000,000
  riskAppetite: RiskAppetite
}

export interface PositionPortfolioRequest {
  budget: number                   // ₹10,000 – ₹10,000,000
  riskAppetite: RiskAppetite
  timePeriod: 9 | 18 | 36 | 60   // months
}

// ── UI-level portfolio state (stored in Zustand) ─
export interface SavedPortfolio {
  type: 'swing' | 'position'
  generatedAt: string              // ISO timestamp
  request: SwingPortfolioRequest | PositionPortfolioRequest
  result: PortfolioResponse
}

// ── Risk labels for UI display ────────────────
export const RISK_LABELS: Record<RiskAppetite, string> = {
  LOW: 'Conservative',
  MEDIUM: 'Balanced',
  HIGH: 'Aggressive',
}

export const RISK_COLORS: Record<RiskAppetite, string> = {
  LOW: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HIGH: 'text-red-400',
}

export const TIME_PERIOD_OPTIONS = [
  { value: 9,  label: '9 months',  description: 'Short-term' },
  { value: 18, label: '18 months', description: 'Medium-term' },
  { value: 36, label: '3 years',   description: 'Long-term' },
  { value: 60, label: '5 years',   description: 'Extended' },
] as const

export type TimePeriod = (typeof TIME_PERIOD_OPTIONS)[number]['value']
