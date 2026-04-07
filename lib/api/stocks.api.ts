// ─────────────────────────────────────────────
//  STOCKS API SERVICE
//  Wraps: GET /api/stocks
//         GET /api/analyze/swing/:symbol
//         GET /api/analyze/position/:symbol
//         GET /api/compare/:symbol
// ─────────────────────────────────────────────

import { get } from './client'
import { ValidationError } from '@/types/api.types'
import type {
  StockListResponse,
  StockAnalysis,
  CompareResponse,
} from '@/types/stock.types'

// ── Validation (mirrors Flask validate_symbol) ─
function sanitizeSymbol(symbol: string): string {
  const clean = symbol?.trim()?.toUpperCase()
  if (!clean) throw new ValidationError('Stock symbol must be a non-empty string.')
  if (!/^[A-Z0-9&\-]+$/.test(clean)) {
    throw new ValidationError(`"${symbol}" is not a valid stock symbol.`)
  }
  return clean
}

// ─────────────────────────────────────────────
//  GET /api/stocks
//  Returns the full list of supported stock symbols.
//  Backend caches this for 5 minutes — we match with
//  TanStack Query staleTime of 5 * 60 * 1000.
// ─────────────────────────────────────────────
export async function getAllStocks(): Promise<StockListResponse> {
  return get<StockListResponse>('/api/stocks')
}

// ─────────────────────────────────────────────
//  GET /api/analyze/swing/:symbol
//  Full swing trading analysis for one stock.
//  time_horizon = "1-4 weeks"
// ─────────────────────────────────────────────
export async function analyzeSwing(symbol: string): Promise<StockAnalysis> {
  const clean = sanitizeSymbol(symbol)
  return get<StockAnalysis>(`/api/analyze/swing/${clean}`)
}

// ─────────────────────────────────────────────
//  GET /api/analyze/position/:symbol
//  Full position trading analysis for one stock.
//  time_horizon = "6-18 months"
//  Includes mda_analysis fields in sentiment.
// ─────────────────────────────────────────────
export async function analyzePosition(symbol: string): Promise<StockAnalysis> {
  const clean = sanitizeSymbol(symbol)
  return get<StockAnalysis>(`/api/analyze/position/${clean}`)
}

// ─────────────────────────────────────────────
//  GET /api/compare/:symbol
//  Returns both swing and position analysis
//  side-by-side for a single stock.
//  Backend runs both analyses — can be slow (~40s).
// ─────────────────────────────────────────────
export async function compareStrategies(symbol: string): Promise<CompareResponse> {
  const clean = sanitizeSymbol(symbol)
  return get<CompareResponse>(`/api/compare/${clean}`)
}
