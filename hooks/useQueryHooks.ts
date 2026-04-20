// ─────────────────────────────────────────────
//  QUERY HOOKS
//  TanStack Query wrappers for all API calls.
//  staleTime = 5 min matches Flask's CACHE_TIMEOUT.
// ─────────────────────────────────────────────

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { getAllStocks, analyzeSwing, analyzePosition, compareStrategies } from '@/lib/api/stocks.api'
import { createSwingPortfolio, createPositionPortfolio } from '@/lib/api/portfolio.api'
import type { StockListResponse, StockAnalysis, CompareResponse } from '@/types/stock.types'
import type { PortfolioResponse, SwingPortfolioRequest, PositionPortfolioRequest } from '@/types/portfolio.types'
import { DegradedModeError } from '@/types/api.types'

// ── Shared constants ──────────────────────────
const FIVE_MINUTES = 5 * 60 * 1_000

// ── Query keys — centralized to avoid typos ──
export const queryKeys = {
  stocks:          ['stocks'] as const,
  swingAnalysis:   (symbol: string) => ['analysis', 'swing',    symbol.toUpperCase()] as const,
  positionAnalysis:(symbol: string) => ['analysis', 'position', symbol.toUpperCase()] as const,
  compare:         (symbol: string) => ['compare',              symbol.toUpperCase()] as const,
}

// ─────────────────────────────────────────────
//  useAllStocks
//  Fetches full stock list. Cached for 5 minutes.
// ─────────────────────────────────────────────
export function useAllStocks(
  options?: Partial<UseQueryOptions<StockListResponse>>
) {
  return useQuery<StockListResponse>({
    queryKey: queryKeys.stocks,
    queryFn:  getAllStocks,
    staleTime: FIVE_MINUTES,
    retry: 2,
    ...options,
  })
}

// ─────────────────────────────────────────────
//  useSwingAnalysis
//  Fetches swing analysis for one symbol.
//  Only runs when symbol is non-empty.
// ─────────────────────────────────────────────
export function useSwingAnalysis(
  symbol: string,
  options?: Partial<UseQueryOptions<StockAnalysis>>
) {
  return useQuery<StockAnalysis>({
    queryKey: queryKeys.swingAnalysis(symbol),
    queryFn:  () => analyzeSwing(symbol),
    enabled:  Boolean(symbol?.trim()),
    staleTime: FIVE_MINUTES,
    retry: (failCount, error) => {
      // Never retry degraded mode errors — they need backend fix
      if (error instanceof DegradedModeError) return false
      return failCount < 2
    },
    ...options,
  })
}

// ─────────────────────────────────────────────
//  usePositionAnalysis
//  Fetches position/long-term analysis.
// ─────────────────────────────────────────────
export function usePositionAnalysis(
  symbol: string,
  options?: Partial<UseQueryOptions<StockAnalysis>>
) {
  return useQuery<StockAnalysis>({
    queryKey: queryKeys.positionAnalysis(symbol),
    queryFn:  () => analyzePosition(symbol),
    enabled:  Boolean(symbol?.trim()),
    staleTime: FIVE_MINUTES,
    retry: (failCount, error) => {
      if (error instanceof DegradedModeError) return false
      return failCount < 2
    },
    ...options,
  })
}

// ─────────────────────────────────────────────
//  useCompareStrategies
//  Fetches swing + position side-by-side.
//  Slow endpoint (~40s) — show progress indicator.
// ─────────────────────────────────────────────
export function useCompareStrategies(
  symbol: string,
  options?: Partial<UseQueryOptions<CompareResponse>>
) {
  return useQuery<CompareResponse>({
    queryKey: queryKeys.compare(symbol),
    queryFn:  () => compareStrategies(symbol),
    enabled:  Boolean(symbol?.trim()),
    staleTime: FIVE_MINUTES,
    retry: (failCount, error) => {
      if (error instanceof DegradedModeError) return false
      return failCount < 1      // Only 1 retry — compare is expensive
    },
    ...options,
  })
}

// ─────────────────────────────────────────────
//  useCreateSwingPortfolio (mutation)
//  POST /api/portfolio/swing
//  Validates before sending — errors thrown as
//  ValidationError before request fires.
// ─────────────────────────────────────────────
export function useCreateSwingPortfolio(
  options?: UseMutationOptions<PortfolioResponse, Error, SwingPortfolioRequest>
) {
  return useMutation<PortfolioResponse, Error, SwingPortfolioRequest>({
    mutationFn: createSwingPortfolio,
    retry: 0,   // Portfolio generation is expensive — never auto-retry
    ...options,
  })
}

// ─────────────────────────────────────────────
//  useCreatePositionPortfolio (mutation)
//  POST /api/portfolio/position
// ─────────────────────────────────────────────
export function useCreatePositionPortfolio(
  options?: UseMutationOptions<PortfolioResponse, Error, PositionPortfolioRequest>
) {
  return useMutation<PortfolioResponse, Error, PositionPortfolioRequest>({
    mutationFn: createPositionPortfolio,
    retry: 0,
    ...options,
  })
}

// ─────────────────────────────────────────────
//  isDegradedError — type guard for UI
// ─────────────────────────────────────────────
export function isDegradedError(error: unknown): error is DegradedModeError {
  return error instanceof DegradedModeError
}
