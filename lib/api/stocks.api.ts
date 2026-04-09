import { get } from './client'
import { ValidationError } from '@/types/api.types'
import type {
  StockListResponse,
  StockAnalysis,
  CompareResponse,
} from '@/types/stock.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sentiquant.org"

// ── Validation ─
function sanitizeSymbol(symbol: string): string {
  const clean = symbol?.trim()?.toUpperCase()
  if (!clean) throw new ValidationError('Stock symbol must be a non-empty string.')
  if (!/^[A-Z0-9&\-]+$/.test(clean)) {
    throw new ValidationError(`"${symbol}" is not a valid stock symbol.`)
  }
  return clean
}

// GET /api/stocks
export async function getAllStocks(): Promise<StockListResponse> {
  return get<StockListResponse>(`${BASE_URL}/api/stocks`)
}

// GET /api/analyze/swing/:symbol
export async function analyzeSwing(symbol: string): Promise<StockAnalysis> {
  const clean = sanitizeSymbol(symbol)
  return get<StockAnalysis>(`${BASE_URL}/api/analyze/swing/${clean}`)
}

// GET /api/analyze/position/:symbol
export async function analyzePosition(symbol: string): Promise<StockAnalysis> {
  const clean = sanitizeSymbol(symbol)
  return get<StockAnalysis>(`${BASE_URL}/api/analyze/position/${clean}`)
}

// GET /api/compare/:symbol
export async function compareStrategies(symbol: string): Promise<CompareResponse> {
  const clean = sanitizeSymbol(symbol)
  return get<CompareResponse>(`${BASE_URL}/api/compare/${clean}`)
}
