'use client'

import { useState, useDeferredValue, memo } from 'react'
import { useAllStocks, useSwingAnalysis, usePositionAnalysis } from '@/hooks/useQueryHooks'
import { StockCard, StockRow } from '@/components/stocks/StockCard'
import { StockGridSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/DegradedBanner'
import { SearchInput } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
type ViewMode = 'grid' | 'list'
type SystemMode = 'swing' | 'position'

// ─────────────────────────────────────────────
//  SINGLE STOCK ANALYSIS LOADER
//  Fetches one stock's analysis and renders
//  its card — called inside the grid map.
// ─────────────────────────────────────────────
// PERF: memo prevents re-render on every search keystroke. The parent StocksPage
//       re-renders as the user types (via useDeferredValue), but a card whose
//       symbol/mode/view props haven't changed doesn't need to re-render.
const StockAnalysisCard = memo(function StockAnalysisCard({
  symbol,
  mode,
  view,
}: {
  symbol: string
  mode: SystemMode
  view: ViewMode
}) {
  const swingQuery = useSwingAnalysis(symbol, { enabled: mode === 'swing' })
  const positionQuery = usePositionAnalysis(symbol, { enabled: mode === 'position' })
  const { data, isLoading, error } = mode === 'swing' ? swingQuery : positionQuery

  if (isLoading) {
    return view === 'grid' ? (
      <div className="relative rounded-xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden p-5 pt-6 flex flex-col gap-4">
        {/* Top accent shimmer */}
        <div className="absolute top-0 inset-x-0 h-px bg-surface-800 animate-pulse" />
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-16 bg-surface-800 rounded skeleton" />
            <div className="h-3 w-28 bg-surface-800/70 rounded skeleton" />
          </div>
          {/* Score badge placeholder */}
          <div className="w-12 h-12 rounded-xl bg-surface-800 skeleton shrink-0" />
        </div>
        {/* Price row */}
        <div className="flex items-end justify-between gap-2">
          <div className="h-8 w-24 bg-surface-800 rounded skeleton" />
          <div className="h-5 w-16 bg-surface-800/70 rounded-full skeleton" />
        </div>
        {/* Score bar */}
        <div className="h-1.5 w-full bg-surface-800 rounded-full skeleton" />
        {/* Targets */}
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-surface-800/70 rounded-lg skeleton" />)}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-800">
          <div className="h-4 w-20 bg-surface-800 rounded-full skeleton" />
          <div className="h-3 w-12 bg-surface-800/60 rounded skeleton" />
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-4 px-4 py-3.5 border-b border-surface-800/50">
        <div className="h-4 w-16 bg-surface-800 rounded skeleton" />
        <div className="flex-1 h-3 bg-surface-800/70 rounded skeleton" />
        <div className="h-3 w-10 bg-surface-800/60 rounded skeleton hidden sm:block" />
      </div>
    )
  }

  if (error || !data) return null   // Skip failed stocks silently in grid view

  return view === 'grid'
    ? <StockCard analysis={data} />
    : <StockRow analysis={data} />
})

// ─────────────────────────────────────────────
//  STOCKS PAGE
// ─────────────────────────────────────────────
export default function StocksPage() {
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<SystemMode>('swing')
  const [view, setView] = useState<ViewMode>('grid')
  const deferredSearch = useDeferredValue(search)

  const { data: stockList, isLoading, error } = useAllStocks()

  const filtered = (stockList?.stocks ?? []).filter((s) =>
    !deferredSearch || s.toLowerCase().includes(deferredSearch.toLowerCase())
  )

  // Only render first 18 on initial load to avoid 250 simultaneous API calls
  const visibleSymbols = filtered.slice(0, 18)

  return (
    <div className="flex flex-col gap-8 dashboard-container-wide">

      {/* ── Page header ── */}
      {/* ANIMATION: hero-entry-N — staggered page-load entries for header elements */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-3xl">

          {/* subtle glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[120px] bg-brand-blue/10 blur-[100px] pointer-events-none" />

          <div className="relative">
            <span className="hero-entry-1 block text-xs font-semibold text-brand-cyan uppercase tracking-widest">
              AI stock signals
            </span>
            <h1 className="hero-entry-2 font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05] mt-2">
              NSE · BSE Stocks
            </h1>

            <p className="hero-entry-3 text-sm sm:text-base text-surface-400 mt-3 leading-relaxed">
              AI signals across{' '}
              <span className="text-surface-900 dark:text-white font-medium tabular-nums">
                {stockList?.total_count ?? '…'}
              </span>{' '}
              stocks — entry, stop-loss & 3 targets for each
            </p>
          </div>
        </div>

        {/* System mode toggle — sliding pill */}
        {/* ANIMATION: hero-entry-4 — mode toggle enters after header copy */}
        <div className="hero-entry-4 relative grid grid-cols-2 p-1 bg-surface-900 border border-surface-800 rounded-xl self-start sm:self-auto">
          {/* Hardware-accelerated pill — translate-x by 100% of its own width to reach slot 1 */}
          <div
            className={cn(
              'absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg',
              'bg-gradient-to-r from-brand-blue to-brand-cyan shadow-sm',
              'transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none',
              mode === 'position' && 'translate-x-[100%]'
            )}
            aria-hidden="true"
          />
          {(['swing', 'position'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'relative z-10 px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 capitalize active:scale-95 whitespace-nowrap',
                mode === m ? 'text-white' : 'text-surface-400 hover:text-white'
              )}
            >
              {/* UX: aria-hidden on decorative emoji so screen readers skip it */}
              {m === 'swing'
                ? <><span aria-hidden="true">⚡</span>{' '}Swing</>
                : <><span aria-hidden="true">📈</span>{' '}Position</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Controls row ── */}
      {/* ANIMATION: hero-entry-5 — search/filter row enters last in header sequence */}
      <div className="hero-entry-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3 rounded-xl bg-surface-900/60 border border-surface-700/60 backdrop-blur-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol e.g. TCS, INFY…"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto pl-2 border-l border-surface-800">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-1 bg-surface-800/60 border border-surface-700 rounded-lg">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={`${v} view`}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-md transition-all active:scale-90',
                  view === v
                    ? 'bg-surface-700 text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
                )}
              >
                {v === 'grid' ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <rect x="1" y="1" width="4" height="4" rx="1" /><rect x="8" y="1" width="4" height="4" rx="1" />
                    <rect x="1" y="8" width="4" height="4" rx="1" /><rect x="8" y="8" width="4" height="4" rx="1" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M1 3h11M1 6.5h11M1 10h11" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Result count */}
          <Badge color="neutral" className="hidden sm:inline-flex bg-surface-800/60 border border-surface-700">
            {filtered.length} stocks
          </Badge>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <StockGridSkeleton count={9} />
      ) : error ? (
        <ErrorState error={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          // ENHANCEMENT: search illustration shown above icon for richer empty state
          illustration="search"
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="9.5" cy="9.5" r="7" />
              <path d="M14.5 14.5l4.5 4.5" />
            </svg>
          }
          title={`No stocks match "${search}"`}
          description="Try the full ticker symbol — RELIANCE, TCS, INFY — or clear the search to browse all."
          action={
            <button
              onClick={() => setSearch('')}
              className="text-xs font-medium text-brand-cyan hover:text-brand-blue transition-colors px-4 py-2 rounded-lg bg-brand-cyan/8 border border-brand-cyan/20 hover:bg-brand-blue/8 hover:border-brand-blue/20"
            >
              Clear search
            </button>
          }
        />
      ) : view === 'grid' ? (
        <div className="relative">
          {/* subtle background depth */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-surface-900/20 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
            {visibleSymbols.map((symbol, i) => (
              // Stagger each card's entrance by 50ms — gives a cascading reveal effect
              <div key={symbol} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                <StockAnalysisCard symbol={symbol} mode={mode} view="grid" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-surface-800 bg-gray-50/80 dark:bg-surface-900/60 flex items-center gap-4 text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
            <span className="flex-1">Symbol</span>
            <span className="hidden sm:block w-24">Price</span>
            <span className="hidden md:block w-20">Score</span>
            <span className="hidden md:block w-8" />
            <span className="hidden lg:block w-24">Signal</span>
            <span className="w-16 text-right">Return</span>
            <span className="w-4" />
          </div>
          {visibleSymbols.map((symbol) => (
            <StockAnalysisCard key={symbol} symbol={symbol} mode={mode} view="list" />
          ))}
        </div>
      )}

      {/* Load more hint */}
      {filtered.length > 18 && (
        <div className="flex items-center justify-center gap-3 py-2 pb-4">
          <div className="h-px flex-1 max-w-24 bg-gray-200 dark:bg-surface-800" />
          <p className="text-xs text-surface-500 tabular-nums">
            Showing <span className="text-surface-900 dark:text-surface-300 font-medium">18</span> of <span className="text-surface-900 dark:text-surface-300 font-medium">{filtered.length}</span> — search to narrow results
          </p>
          <div className="h-px flex-1 max-w-24 bg-gray-200 dark:bg-surface-800" />
        </div>
      )}
    </div>
  )
}
