'use client'

import { useState, useDeferredValue, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StockListCard, StockListRow } from '@/components/stocks/StockCard'
import { SearchInput } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { StockGridSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'
import { getStocksList } from '@/lib/api/stocks.api'
import { SEO_STOCKS } from '@/lib/stocks-seo'

type ViewMode = 'grid' | 'list'
type SortOption = 'symbol-asc' | 'symbol-desc' | 'name-asc' | 'name-desc'

// ─────────────────────────────────────────────
//  SEO ENRICHMENT MAP
//  Maps symbol → { name, sector } for the ~75 featured stocks.
//  Stocks not in this map show symbol as name and no sector tag.
// ─────────────────────────────────────────────
function normalizeSector(raw: string): string {
  const s = raw.toLowerCase()
  if (s.includes('information technology')) return 'IT Services'
  if (s.includes('bank') || s.includes('banking')) return 'Banking'
  if (s.includes('nbfc') || s.includes('insurance') || s.includes('financial service')) return 'Financial Services'
  if (s.includes('pharma') || s.includes('hospital') || s.includes('healthcare')) return 'Pharma & Healthcare'
  if (s.includes('fmcg') || s.includes('cigarette')) return 'FMCG'
  if (s.includes('auto') || s.includes('motor') || s.includes('vehicle')) return 'Automobile'
  if (s.includes('metal') || s.includes('steel') || s.includes('mining') || s.includes('zinc') || s.includes('alumin')) return 'Metals & Mining'
  if (s.includes('oil') || s.includes('gas') || s.includes('petroleum')) return 'Oil & Gas'
  if (s.includes('real estate')) return 'Real Estate'
  if (s.includes('cement') || s.includes('infrastructure') || s.includes('engineering')) return 'Infrastructure'
  if (s.includes('power') || s.includes('coal') || s.includes('energy')) return 'Power & Energy'
  if (s.includes('telecom')) return 'Telecom'
  if (s.includes('consumer discretionary') || s.includes('retail')) return 'Retail & Consumer'
  if (s.includes('conglomerate')) return 'Conglomerates'
  return 'Other'
}

const SEO_MAP = new Map(SEO_STOCKS.map(s => [s.symbol, { name: s.name, sector: normalizeSector(s.sector) }]))

const AVAILABLE_SECTORS = Array.from(new Set(SEO_STOCKS.map(s => normalizeSector(s.sector)))).sort()

// ─────────────────────────────────────────────
//  STOCKS LIST PAGE
// ─────────────────────────────────────────────
export default function StocksPage() {
  const [search, setSearch]           = useState('')
  const [view, setView]               = useState<ViewMode>('grid')
  const [sortBy, setSortBy]           = useState<SortOption>('symbol-asc')
  const [sector, setSector]           = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const deferredSearch = useDeferredValue(search)

  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ['stocks-list'],
    queryFn:  () => getStocksList(),
    staleTime: 5 * 60 * 1_000,
  })

  const allStocks  = data?.stocks ?? []
  const totalStocks = data?.total  ?? 0

  // Enrich stocks with SEO metadata (name + sector) when available
  const enrichedStocks = useMemo(() =>
    allStocks.map(s => {
      const seo = SEO_MAP.get(s.symbol)
      return { ...s, name: seo?.name ?? s.name, sector: seo?.sector }
    }),
    [allStocks]
  )

  const filtered = useMemo(() => {
    let list = enrichedStocks

    // Text search
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase()
      list = list.filter(s =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
      )
    }

    // Sector filter
    if (sector) {
      list = list.filter(s => s.sector === sector)
    }

    // Sort
    const copy = [...list]
    switch (sortBy) {
      case 'symbol-asc':  copy.sort((a, b) => a.symbol.localeCompare(b.symbol)); break
      case 'symbol-desc': copy.sort((a, b) => b.symbol.localeCompare(a.symbol)); break
      case 'name-asc':    copy.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'name-desc':   copy.sort((a, b) => b.name.localeCompare(a.name)); break
    }
    return copy
  }, [enrichedStocks, deferredSearch, sector, sortBy])

  const hasActiveFilters = Boolean(deferredSearch || sector || sortBy !== 'symbol-asc')

  function clearFilters() {
    setSearch('')
    setSector('')
    setSortBy('symbol-asc')
  }

  // ── Full-page loading skeleton ──────────────
  if (isPending) {
    return (
      <div className="flex flex-col gap-8 dashboard-container-wide">
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="h-3 w-28 rounded-full bg-surface-800/60 animate-pulse" />
          <div className="h-9 w-56 rounded-lg bg-surface-800/60 animate-pulse" />
          <div className="h-4 w-72 rounded-full bg-surface-800/60 animate-pulse" />
        </div>
        <div className="h-14 rounded-xl bg-surface-800/40 animate-pulse" />
        <StockGridSkeleton count={9} />
      </div>
    )
  }

  // ── Error state ──────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-8 dashboard-container-wide">
        <div className="relative max-w-3xl">
          <span className="hero-entry-1 block text-xs font-semibold text-brand-cyan uppercase tracking-widest">
            AI stock signals
          </span>
          <h1 className="hero-entry-2 font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05] mt-2">
            NSE · BSE Stocks
          </h1>
        </div>
        <div className="card flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4M10 14h.01" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-surface-900 dark:text-white">Failed to load stocks</p>
            <p className="text-sm text-surface-500">Could not reach the server. Check your connection and try again.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-medium text-brand-cyan hover:text-brand-blue transition-colors px-4 py-2 rounded-lg bg-brand-cyan/8 border border-brand-cyan/20 hover:bg-brand-blue/8 hover:border-brand-blue/20"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Main UI ────────────────────────────────
  return (
    <div className="flex flex-col gap-8 dashboard-container-wide">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-3xl">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[200px] sm:w-[400px] h-[120px] bg-brand-blue/10 blur-[100px] pointer-events-none" />
          <div className="relative">
            <span className="hero-entry-1 block text-xs font-semibold text-brand-cyan uppercase tracking-widest">
              AI stock signals
            </span>
            <h1 className="hero-entry-2 font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05] mt-2">
              NSE · BSE Stocks
            </h1>
            <p className="hero-entry-3 text-sm sm:text-base text-surface-400 mt-3 leading-relaxed">
              Browse{' '}
              {isFetching ? (
                <span className="inline-block w-8 h-4 rounded bg-surface-700/50 animate-pulse align-middle" />
              ) : (
                <span className="text-surface-900 dark:text-white font-medium tabular-nums">{totalStocks}</span>
              )}{' '}
              major stocks — click any to get AI signals, targets &amp; stop-loss
            </p>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="hero-entry-4 flex flex-col gap-2">

        {/* Row 1: search + view toggle + count */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3 rounded-xl bg-surface-900/60 border border-surface-700/60 backdrop-blur-sm">
          <div className="flex-1 max-w-sm">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol or name — TCS, Infosys…"
            />
          </div>

          <div className="flex items-center gap-2 sm:ml-auto sm:pl-2 sm:border-l sm:border-surface-800">
            {/* Filter toggle — mobile */}
            <button
              onClick={() => setShowFilters(v => !v)}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
              className={cn(
                'flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-all duration-150 border',
                showFilters || sector || sortBy !== 'symbol-asc'
                  ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-cyan'
                  : 'border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-600 hover:bg-surface-800/40'
              )}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M1 2.5h11M3 6.5h7M5 10.5h3" />
              </svg>
              <span>Filters</span>
              {(sector || sortBy !== 'symbol-asc') && (
                <span className="w-4 h-4 rounded-full bg-brand-cyan text-surface-950 text-[9px] font-bold flex items-center justify-center">
                  {(sector ? 1 : 0) + (sortBy !== 'symbol-asc' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex items-center gap-0.5 p-1 bg-surface-800/60 border border-surface-700 rounded-lg">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={`${v} view`}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-md transition-all active:scale-90',
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

            <Badge color="neutral" className="hidden sm:inline-flex bg-surface-800/60 border border-surface-700">
              {isFetching ? '…' : deferredSearch || sector ? filtered.length : totalStocks} stocks
            </Badge>
          </div>
        </div>

        {/* Row 2: sector + sort + clear — collapsible */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-surface-900/40 border border-surface-700/40 animate-fade-in">

            {/* Sector select */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest px-1">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={cn(
                  'h-9 pl-3 pr-8 rounded-lg text-xs font-medium transition-all duration-150 appearance-none cursor-pointer',
                  'bg-surface-800/60 border text-surface-200 outline-none',
                  'focus:ring-1 focus:ring-brand-blue/40 focus:border-brand-blue/50',
                  sector ? 'border-brand-blue/40 text-white' : 'border-surface-700'
                )}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%236b7280' stroke-width='1.4' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                <option value="">All sectors</option>
                {AVAILABLE_SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sort select */}
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest px-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={cn(
                  'h-9 pl-3 pr-8 rounded-lg text-xs font-medium transition-all duration-150 appearance-none cursor-pointer',
                  'bg-surface-800/60 border text-surface-200 outline-none',
                  'focus:ring-1 focus:ring-brand-blue/40 focus:border-brand-blue/50',
                  sortBy !== 'symbol-asc' ? 'border-brand-blue/40 text-white' : 'border-surface-700'
                )}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%236b7280' stroke-width='1.4' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                <option value="symbol-asc">Symbol A → Z</option>
                <option value="symbol-desc">Symbol Z → A</option>
                <option value="name-asc">Name A → Z</option>
                <option value="name-desc">Name Z → A</option>
              </select>
            </div>

            {/* Clear — only when any filter is active */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="self-end h-9 px-3 rounded-lg text-xs font-medium text-surface-400 hover:text-rose-400 border border-surface-700 hover:border-rose-400/30 transition-all duration-150"
              >
                Clear all
              </button>
            )}

            {/* Sector note */}
            {sector && (
              <p className="self-end text-[10px] text-surface-600 ml-auto">
                Sector data for ~75 featured stocks
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration="search"
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="9.5" cy="9.5" r="7" />
              <path d="M14.5 14.5l4.5 4.5" />
            </svg>
          }
          title={sector ? `No stocks in "${sector}"` : `No stocks match "${search}"`}
          description={
            sector
              ? 'Sector metadata is available for ~75 featured stocks. Try a different sector or clear the filter.'
              : 'Try the full ticker symbol — RELIANCE, TCS, INFY — or the company name.'
          }
          action={
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-brand-cyan hover:text-brand-blue transition-colors px-4 py-2 rounded-lg bg-brand-cyan/8 border border-brand-cyan/20 hover:bg-brand-blue/8 hover:border-brand-blue/20"
            >
              Clear filters
            </button>
          }
        />
      ) : view === 'grid' ? (
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-surface-900/20 to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
            {filtered.map((stock, i) => (
              <div key={stock.symbol} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                <StockListCard symbol={stock.symbol} name={stock.name} sector={stock.sector} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-surface-800 bg-gray-50/80 dark:bg-surface-900/60 flex items-center gap-4 text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
            <span className="flex-1">Symbol · Company</span>
            <span className="hidden md:block w-32">Sector</span>
            <span className="hidden sm:block w-12">Exch</span>
            <span className="w-4" />
          </div>
          {filtered.map((stock) => (
            <StockListRow key={stock.symbol} symbol={stock.symbol} name={stock.name} sector={stock.sector} />
          ))}
        </div>
      )}

    </div>
  )
}
