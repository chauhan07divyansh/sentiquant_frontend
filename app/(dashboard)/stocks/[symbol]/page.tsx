'use client'

import { useState, useEffect } from 'react'
import dynamic        from 'next/dynamic'
import { useSwingAnalysis, usePositionAnalysis, useCompareStrategies } from '@/hooks/useQueryHooks'
import { AnalysisSkeleton } from '@/components/ui/Skeleton'
import { ErrorState }       from '@/components/common/DegradedBanner'
import { LiveBadge, SignalBadge, GradeBadge } from '@/components/ui/Badge'
import { AnalysisView }     from '@/components/stocks/AnalysisView'
import { Change }           from '@/components/ui/DataDisplay'
import { cn }               from '@/lib/utils/cn'
import { classifySignal }   from '@/types/stock.types'
import { formatINR }        from '@/lib/utils/formatters'
import { useWatchlistStore } from '@/store'
import type { StockAnalysis, CompareResponse } from '@/types/stock.types'

// PERF: CompareView is lazy-loaded so its JS chunk is only fetched when the
//       user clicks the Compare tab. Swing/Position tab users pay zero cost.
const CompareView = dynamic(
  () => import('@/components/stocks/CompareView'),
  {
    ssr:     false,
    loading: () => (
      // Skeleton shown while the Compare chunk downloads
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="h-5 w-32 rounded-full skeleton" />
            <div className="card p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0,1,2,3].map((j) => <div key={j} className="h-20 rounded-xl skeleton" />)}
              </div>
              <div className="h-8 rounded-lg skeleton" />
            </div>
          </div>
        ))}
      </div>
    ),
  }
)

// ─────────────────────────────────────────────
//  STOCK DETAIL PAGE
// ─────────────────────────────────────────────
type Tab = 'swing' | 'position' | 'compare'

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  const [tab, setTab] = useState<Tab>('swing')
  const { addRecentlyViewed } = useWatchlistStore()

  // Track every symbol the user visits for the dashboard "Recently viewed" section
  useEffect(() => { addRecentlyViewed(symbol) }, [symbol]) // eslint-disable-line react-hooks/exhaustive-deps

  const swingQuery    = useSwingAnalysis(symbol,    { enabled: tab === 'swing'    })
  const positionQuery = usePositionAnalysis(symbol, { enabled: tab === 'position' })
  const compareQuery  = useCompareStrategies(symbol,{ enabled: tab === 'compare'  })

  const activeQuery =
    tab === 'swing'    ? swingQuery :
    tab === 'position' ? positionQuery : compareQuery

  const { data, isLoading, error, refetch } = activeQuery

  // UX: emoji split into separate field so it can be wrapped in aria-hidden
  const tabs = [
    { id: 'swing',    emoji: '⚡', label: 'Swing',    sub: '1–4 weeks'   },
    { id: 'position', emoji: '📈', label: 'Position', sub: '6–18 months' },
    { id: 'compare',  emoji: '⚖️', label: 'Compare',  sub: 'side by side' },
  ] as const

  return (
    <div className="flex flex-col gap-6 dashboard-container-narrow">

      {/* ── Page header ── */}
      {/* ANIMATION: hero-entry-N — staggered page-load entries */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="hero-entry-1 flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">{symbol}</h1>
              <LiveBadge />
            </div>
            {(data as StockAnalysis)?.company_name && (
              <p className="hero-entry-2 text-sm text-surface-400 mt-0.5">{(data as StockAnalysis).company_name}</p>
            )}
          </div>
        </div>

        {/* ANIMATION: hero-entry-3 — refresh button enters after symbol */}
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
            'border border-gray-200 dark:border-surface-700 text-gray-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-surface-500',
            'transition-all duration-150 self-start sm:self-auto',
            isLoading && 'opacity-50 cursor-not-allowed',
          'hero-entry-3'
          )}
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M10.5 6A4.5 4.5 0 111.5 6"/>
            <path d="M10.5 2v4h-4"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Tabs — 3-slot sliding pill ── */}
      {/* ANIMATION: hero-entry-4 — tab bar enters after header */}
      <div className="hero-entry-4 relative grid grid-cols-3 p-1 bg-surface-900 border border-surface-800 rounded-xl self-start">
        {/* Sliding pill — translate by 100%/200% of own width to reach slot 1/2 */}
        <div
          className={cn(
            'absolute inset-y-1 left-1 w-[calc(33.333%-2.667px)] rounded-lg',
            'bg-gradient-to-r from-brand-blue to-brand-cyan shadow-sm',
            'transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none',
            tab === 'swing'    && 'translate-x-0',
            tab === 'position' && 'translate-x-[100%]',
            tab === 'compare'  && 'translate-x-[200%]',
          )}
          aria-hidden="true"
        />
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative z-10 flex flex-col items-start px-4 py-2 rounded-lg',
              'transition-colors duration-200 active:scale-95 whitespace-nowrap',
              tab === t.id ? 'text-white' : 'text-surface-400 hover:text-white'
            )}
          >
            <span className="text-xs font-semibold">
              {/* UX: aria-hidden on decorative emoji */}
              <span aria-hidden="true">{t.emoji}</span>{' '}{t.label}
            </span>
            <span className={cn('text-[10px]', tab === t.id ? 'text-white/70' : 'text-surface-500')}>{t.sub}</span>
          </button>
        ))}
      </div>

      {/* ── Sticky summary strip — visible once analysis data is loaded ── */}
      {data && tab !== 'compare' && (() => {
        const a      = data as StockAnalysis
        const signal = classifySignal(a.trading_plan.signal)
        const score  = a.overall_score
        const scoreColor = score >= 70 ? 'text-brand-cyan' : score >= 50 ? 'text-brand-blue' : 'text-surface-400'
        return (
          <div className={cn(
            'sticky top-[var(--header-height,4rem)] z-10',
            'flex items-center gap-3 px-4 py-2.5 rounded-xl',
            'border border-gray-200 dark:border-surface-800',
            'bg-white/90 dark:bg-surface-950/90 backdrop-blur-md',
            'shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] animate-fade-in'
          )}>
            {/* Score */}
            <div className="flex items-baseline gap-1">
              <span className={cn('font-mono font-bold text-lg tabular-nums leading-none', scoreColor)}>{score}</span>
              <span className="text-[10px] text-surface-600 font-mono">/100</span>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-surface-800 shrink-0" />
            {/* Price + return */}
            <span className="font-mono text-sm text-surface-900 dark:text-white tabular-nums leading-none">{formatINR(a.current_price, 0)}</span>
            <Change value={a.potential_return} size="sm" />
            <div className="h-4 w-px bg-gray-200 dark:bg-surface-800 shrink-0" />
            {/* Signal */}
            <SignalBadge strength={signal} />
            {/* Grade — pushed to the right */}
            <div className="ml-auto">
              <GradeBadge grade={a.investment_grade} showFull />
            </div>
          </div>
        )
      })()}

      {/* ── Content ── */}
      {/* ANIMATION: key={tab} remounts wrapper on tab change, re-triggering slide-in */}
      <div key={tab} className="animate-slide-in-right">
        {isLoading ? (
          <AnalysisSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data ? null
        : tab === 'compare' ? (
          // PERF: CompareView is dynamically imported — chunk only loads on first Compare click
          <CompareView data={data as CompareResponse} />
        ) : (
          <AnalysisView analysis={data as StockAnalysis} />
        )}
      </div>
    </div>
  )
}
