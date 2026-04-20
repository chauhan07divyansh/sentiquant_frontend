// ─────────────────────────────────────────────
//  STOCKS API SERVICE
//  Wraps: GET /api/stocks           — symbol list + count
//         GET /api/analyze/swing/:symbol
//         GET /api/analyze/position/:symbol
//         GET /api/compare/:symbol
// ─────────────────────────────────────────────

import apiClient, { get, dispatchApiUsage } from './client'
import { ValidationError } from '@/types/api.types'
import type {
  StockListResponse,
  StockAnalysis,
  CompareResponse,
  StocksListApiResponse,
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
//  GET /api/stocks  (rich wrapper for the stocks list page)
//  Calls the same backend endpoint as getAllStocks() but adapts the
//  response to StocksListApiResponse so the list page gets typed objects.
//
//  Backend returns: { stocks: string[], total_count: N }
//  We reshape to:   { stocks: StockListItem[], total: N }
//
//  name falls back to symbol until the backend returns full metadata.
// ─────────────────────────────────────────────
export interface StockListFilters {
  market_cap?: 'Large' | 'Mid' | 'Small'
  index?: 'Nifty50' | 'NiftyNext50' | 'NiftyMidcap100' | 'Smallcap'
  sector?: string
  search?: string
}

export async function getStocksList(filters?: StockListFilters): Promise<StocksListApiResponse> {
  const params: Record<string, string> = {}
  if (filters?.market_cap) params.market_cap = filters.market_cap
  if (filters?.index)      params.index      = filters.index
  if (filters?.sector)     params.sector     = filters.sector
  if (filters?.search)     params.search     = filters.search

  const raw = await get<StockListResponse>('/api/stocks', params)

  return {
    stocks: raw.stocks.map((symbol) => ({ symbol, name: symbol })),
    total:  raw.total_count,
  }
}

// ─────────────────────────────────────────────
//  GET /api/analyze/swing/:symbol
//  Full swing trading analysis for one stock.
//  Uses apiClient directly to capture top-level `source` field
//  (precomputed | cache | live) that the get() helper strips.
// ─────────────────────────────────────────────
export async function analyzeSwing(symbol: string): Promise<StockAnalysis> {
  const clean = sanitizeSymbol(symbol)
  const response = await apiClient.get(`/api/analyze/swing/${clean}`)
  const body = response.data as { success: true; data: StockAnalysis; source?: StockAnalysis['source'] }
  dispatchApiUsage('analysis')
  return { ...body.data, source: body.source }
}

// ─────────────────────────────────────────────
//  GET /api/analyze/position/:symbol
//  Full position trading analysis for one stock.
//  time_horizon = "6-18 months"
//  Includes mda_analysis fields in sentiment.
// ─────────────────────────────────────────────
export async function analyzePosition(symbol: string): Promise<StockAnalysis> {
  const clean = sanitizeSymbol(symbol)
  const response = await apiClient.get(`/api/analyze/position/${clean}`)
  const body = response.data as { success: true; data: StockAnalysis; source?: StockAnalysis['source'] }
  dispatchApiUsage('analysis')
  return { ...body.data, source: body.source }
}

// ─────────────────────────────────────────────
//  GET /api/compare/:symbol
//  Returns both swing and position analysis
//  side-by-side for a single stock.
//  Backend runs both analyses — can be slow (~40s).
// ─────────────────────────────────────────────
export async function compareStrategies(symbol: string): Promise<CompareResponse> {
  const clean = sanitizeSymbol(symbol)
  const result = await get<CompareResponse>(`/api/compare/${clean}`)
  dispatchApiUsage('compare')
  return result
}
