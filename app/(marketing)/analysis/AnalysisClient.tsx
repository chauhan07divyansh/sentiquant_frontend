'use client'

// UI: Interactive search, filter, and sort for the analysis stock grid

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { SeoStock } from '@/lib/stocks-seo'

// UI: Deterministic gradient per symbol — consistent across renders
function getSymbolGradient(symbol: string): string {
  const gradients = [
    'from-blue-500 to-cyan-400',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-400',
    'from-amber-400 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-400',
  ]
  return gradients[symbol.charCodeAt(0) % gradients.length]
}

// UI: 2-char initials from symbol — strip non-alpha, take first 2
function getInitials(symbol: string): string {
  return symbol.replace(/[^A-Z]/g, '').slice(0, 2)
}

// UI: Popular symbols shown as quick-access chips above the search bar
const POPULAR_SYMBOLS = ['TCS', 'INFY', 'HDFCBANK', 'RELIANCE', 'ITC', 'TATAMOTORS', 'SUNPHARMA', 'BAJFINANCE']

interface Props {
  stocks: SeoStock[]
}

export function AnalysisClient({ stocks }: Props) {
  // UI: Filter/sort state
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('all')
  const [cap,    setCap]    = useState('all')
  const [sort,   setSort]   = useState<'name' | 'symbol'>('name')

  // UI: Unique sorted sector list derived from prop data
  const sectors = useMemo(
    () => Array.from(new Set(stocks.map(s => s.sector))).sort(),
    [stocks]
  )

  // UI: Popular stocks for quick-access chip row
  const popularStocks = useMemo(
    () => stocks.filter(s => POPULAR_SYMBOLS.includes(s.symbol)),
    [stocks]
  )

  // UI: Apply search → sector → cap filters then sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    let result = stocks

    if (q) {
      result = result.filter(s =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)   ||
        s.sector.toLowerCase().includes(q)
      )
    }
    if (sector !== 'all') result = result.filter(s => s.sector === sector)
    if (cap    !== 'all') result = result.filter(s => s.cap    === cap)

    return [...result].sort((a, b) =>
      sort === 'symbol'
        ? a.symbol.localeCompare(b.symbol)
        : a.name.localeCompare(b.name)
    )
  }, [stocks, search, sector, cap, sort])

  const hasFilters = Boolean(search || sector !== 'all' || cap !== 'all')

  function clearFilters() {
    setSearch('')
    setSector('all')
    setCap('all')
  }

  // UI: Market cap badge colours — consistent across light + dark modes
  function capBadgeClass(c: string) {
    if (c === 'Large Cap') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    if (c === 'Mid Cap')   return 'bg-amber-500/10  border-amber-500/20  text-amber-400'
    return                        'bg-blue-500/10   border-blue-500/20   text-blue-400'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 flex flex-col gap-8">

      {/* ── POPULAR STOCKS CHIPS ── */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-widest">
          Popular stocks
        </p>
        <div className="flex flex-wrap gap-2">
          {popularStocks.map(s => (
            <button
              key={s.symbol}
              onClick={() => setSearch(s.symbol)}
              className="px-3 py-1.5 rounded-lg border border-surface-800 bg-surface-900 text-surface-300 text-xs font-mono font-bold hover:border-brand-blue/40 hover:text-brand-cyan hover:bg-surface-800 transition-all"
            >
              {s.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* ── SEARCH + FILTERS CARD ── */}
      <div className="card p-5 flex flex-col gap-4">

        {/* UI: Controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Symbol or company…"
              className="input-base pl-9 pr-8 font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
              </button>
            )}
          </div>

          {/* Sector */}
          <div className="relative">
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="input-base appearance-none cursor-pointer pr-8 font-sans"
            >
              <option value="all">All sectors</option>
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Chevron />
          </div>

          {/* Market cap */}
          <div className="relative">
            <select
              value={cap}
              onChange={e => setCap(e.target.value)}
              className="input-base appearance-none cursor-pointer pr-8 font-sans"
            >
              <option value="all">All caps</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
            </select>
            <Chevron />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'name' | 'symbol')}
              className="input-base appearance-none cursor-pointer pr-8 font-sans"
            >
              <option value="name">Sort: Name A–Z</option>
              <option value="symbol">Sort: Symbol A–Z</option>
            </select>
            <Chevron />
          </div>
        </div>

        {/* UI: Results counter + active badges */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-surface-800">
          <p className="text-xs text-surface-400">
            Showing{' '}
            <span className="font-semibold text-white">{filtered.length}</span>
            {' '}of {stocks.length} stocks
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-brand-blue hover:text-brand-cyan text-xs font-medium underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </p>

          {/* UI: Active filter pills */}
          {hasFilters && (
            <div className="flex flex-wrap gap-1.5">
              {search && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-cyan text-[11px] font-medium">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch('')} className="hover:text-white leading-none">×</button>
                </span>
              )}
              {sector !== 'all' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 border border-surface-700 text-surface-300 text-[11px] font-medium">
                  {sector.split(' ').slice(0, 2).join(' ')}
                  <button onClick={() => setSector('all')} className="hover:text-white leading-none">×</button>
                </span>
              )}
              {cap !== 'all' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-800 border border-surface-700 text-surface-300 text-[11px] font-medium">
                  {cap}
                  <button onClick={() => setCap('all')} className="hover:text-white leading-none">×</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── STOCK CARDS GRID ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(stock => (
            <Link
              key={stock.slug}
              href={`/analysis/${stock.slug}`}
              className="group rounded-2xl border border-surface-800 bg-gradient-to-b from-surface-900 to-surface-950 p-5 flex flex-col gap-3 hover:border-brand-blue/30 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-200"
            >
              {/* UI: Logo circle + symbol + name + cap badge */}
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${getSymbolGradient(stock.symbol)} flex items-center justify-center font-display font-bold text-white text-xs select-none`}
                  aria-hidden="true"
                >
                  {getInitials(stock.symbol)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-brand-cyan">{stock.symbol}</span>
                    {/* UI: Compact cap badge — L / M / S Cap */}
                    <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${capBadgeClass(stock.cap)}`}>
                      {stock.cap}
                    </span>
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-brand-cyan transition-colors leading-snug line-clamp-1">
                    {stock.name}
                  </span>
                </div>
              </div>

              {/* UI: Sector tag */}
              <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-surface-800 border border-surface-700 text-surface-500 font-medium line-clamp-1 max-w-full">
                {stock.sector}
              </span>

              {/* Description */}
              <p className="text-[11px] text-surface-500 leading-relaxed line-clamp-2 flex-1">
                {stock.description}
              </p>

              {/* CTA */}
              <span className="text-[11px] text-brand-blue group-hover:text-brand-cyan transition-colors font-medium">
                View AI analysis →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        /* UI: Empty state */
        <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">No stocks found</p>
            <p className="text-sm text-surface-400 max-w-xs">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 hover:-translate-y-px transition-all shadow-[0_0_12px_rgba(59,130,246,0.18)]"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

// UI: Reusable chevron icon for select dropdowns
function Chevron() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l4 4 4-4"/>
      </svg>
    </div>
  )
}
