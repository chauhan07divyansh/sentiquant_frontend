'use client'
import { useState, useEffect } from 'react'
import dynamic        from 'next/dynamic'
import Link           from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { track } from '@/lib/analytics'
import { useSwingAnalysis, usePositionAnalysis, useCompareStrategies } from '@/hooks/useQueryHooks'
import { useQuery } from '@tanstack/react-query'
import { AnalysisSkeleton } from '@/components/ui/Skeleton'
import { ErrorState }       from '@/components/common/DegradedBanner'
import { Badge, LiveBadge, SignalBadge, GradeBadge } from '@/components/ui/Badge'
import { AnalysisView }     from '@/components/stocks/AnalysisView'
import { Change }           from '@/components/ui/DataDisplay'
import { cn }               from '@/lib/utils/cn'
import { classifySignal }   from '@/types/stock.types'
import { formatINR }        from '@/lib/utils/formatters'
import { useWatchlistStore } from '@/store'
import type { StockAnalysis, CompareResponse } from '@/types/stock.types'

const CompareView = dynamic(
  () => import('@/components/stocks/CompareView'),
  {
    ssr:     false,
    loading: () => (
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
//  GUEST SIGNUP PROMPT OVERLAY
// ─────────────────────────────────────────────
function GuestSignupPrompt({ symbol }: { symbol: string }) {
  const [googleLoading, setGoogleLoading] = useState(false)
  return (
    <div className="relative">
      {/* Blur overlay on bottom half */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-surface-950 via-surface-950/90 to-transparent z-10 rounded-b-2xl" />
      {/* Prompt card */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-1">
          <p className="font-display font-bold text-lg text-white">
            You&apos;re viewing a guest preview
          </p>
          <p className="text-sm text-surface-400">
            Sign up free to unlock full technical analysis, portfolio builder, and 10 analyses per day
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {/* Google sign in */}
          <button
            onClick={async () => {
              setGoogleLoading(true)
              track.guestSignupClicked('analysis_overlay', 'google')
              await signIn('google', { callbackUrl: `/stocks/${symbol}` })
            }}
            disabled={googleLoading}
            className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-all shadow-md disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>
          {/* Email sign up */}
          <Link
            href={`/signup?from=/stocks/${symbol}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-surface-700 text-white font-medium text-sm hover:bg-surface-800 transition-all"
          >
            Sign up with email
          </Link>
        </div>
        <p className="text-xs text-surface-600">
          Already have an account?{' '}
          <Link href={`/login?from=/stocks/${symbol}`} className="text-brand-cyan hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  GUEST ANALYSIS FETCHER
// ─────────────────────────────────────────────
async function fetchGuestAnalysis(symbol: string): Promise<StockAnalysis> {
  track.guestAnalysisStarted(symbol)
  const res  = await fetch(`/api/proxy/api/v1/analyze/guest/${symbol}`)
  const data = await res.json()
  if (!data.success) {
    if (data.error?.includes('Guest limit') || data.code === 'GUEST_LIMIT_EXCEEDED') {
      track.guestLimitReached(symbol)
    }
    throw new Error(data.error ?? 'Analysis failed')
  }
  track.guestAnalysisCompleted(symbol)
  return data.data
}

// Wrapper that fires tracking when prompt is shown
function GuestSignupPromptTracked({ symbol }: { symbol: string }) {
  useEffect(() => {
    track.guestSignupPromptShown(symbol, 'analysis_overlay')
  }, [symbol])
  return <GuestSignupPrompt symbol={symbol} />
}

// ─────────────────────────────────────────────
//  STOCK DETAIL PAGE
// ─────────────────────────────────────────────
type Tab = 'swing' | 'position' | 'compare'

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  const [tab, setTab] = useState<Tab>('swing')
  const { addRecentlyViewed } = useWatchlistStore()
  const { status: authStatus } = useSession()
  const isLoggedIn = authStatus === 'authenticated'
  const isGuest    = authStatus === 'unauthenticated'

  useEffect(() => { addRecentlyViewed(symbol) }, [symbol]) // eslint-disable-line react-hooks/exhaustive-deps

  // Guest query — only runs when not logged in and on swing tab
  const guestQuery = useQuery({
    queryKey:  ['guest-analysis', symbol],
    queryFn:   () => fetchGuestAnalysis(symbol),
    enabled:   isGuest && tab === 'swing',
    retry:     false,
    staleTime: 5 * 60 * 1000,
  })

  // Authenticated queries
  const swingQuery    = useSwingAnalysis(symbol,     { enabled: isLoggedIn && tab === 'swing'    })
  const positionQuery = usePositionAnalysis(symbol,  { enabled: isLoggedIn && tab === 'position' })
  const compareQuery  = useCompareStrategies(symbol, { enabled: isLoggedIn && tab === 'compare'  })

  const activeQuery = isGuest
    ? guestQuery
    : tab === 'swing'    ? swingQuery
    : tab === 'position' ? positionQuery
    : compareQuery

  const { data, isPending, isFetching, error, refetch } = activeQuery

  const tabs = [
    { id: 'swing',    emoji: '⚡', label: 'Swing',    sub: '1–4 weeks'    },
    { id: 'position', emoji: '📈', label: 'Position', sub: '6–18 months'  },
    { id: 'compare',  emoji: '⚖️', label: 'Compare',  sub: 'side by side' },
  ] as const

  // Guest sees only swing tab, others are locked
  const handleTabClick = (tabId: Tab) => {
    if (isGuest && tabId !== 'swing') {
      track.guestLockedTabClicked(symbol, tabId as 'position' | 'compare')
      track.guestSignupPromptShown(symbol, 'locked_tab')
      track.guestSignupClicked('locked_tab', 'google')
      signIn(undefined, { callbackUrl: `/stocks/${symbol}` })
      return
    }
    setTab(tabId)
  }

  return (
    <div className="flex flex-col gap-6 dashboard-container-narrow">

      {/* ── Back link ── */}
      <Link
        href="/stocks"
        className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-200 transition-colors self-start"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.5 2.5L4 6l3.5 3.5"/>
        </svg>
        Stocks
      </Link>

      {/* Guest banner */}
      {isGuest && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-sm">
          <span className="text-surface-300">
            👋 You&apos;re in guest mode — 1 free technical analysis without signing up
          </span>
          <Link href="/signup" className="shrink-0 text-xs font-semibold text-brand-cyan hover:underline">
            Sign up free →
          </Link>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="hero-entry-1 flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">{symbol}</h1>
              {(() => {
                const src = (data as StockAnalysis)?.source
                if (!src || src === 'live') return <LiveBadge />
                if (src === 'precomputed') return <Badge color="success" dot className="font-semibold">Pre-computed</Badge>
                return <Badge color="indigo" dot className="font-semibold">Cached</Badge>
              })()}
            </div>
            {(data as StockAnalysis)?.company_name && (
              <p className="hero-entry-2 text-sm text-surface-400 mt-0.5">{(data as StockAnalysis).company_name}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching || isGuest}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
            'border border-gray-200 dark:border-surface-700 text-gray-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-surface-500',
            'transition-all duration-150 self-start sm:self-auto hero-entry-3',
            (isFetching || isGuest) && 'opacity-50 cursor-not-allowed',
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={isFetching ? 'animate-spin' : ''}>
            <path d="M10.5 6A4.5 4.5 0 111.5 6"/><path d="M10.5 2v4h-4"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="hero-entry-4 relative grid grid-cols-3 p-1 bg-surface-900 border border-surface-800 rounded-xl self-start">
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
            onClick={() => handleTabClick(t.id)}
            className={cn(
              'relative z-10 flex flex-col items-start px-4 py-2 rounded-lg',
              'transition-colors duration-200 active:scale-95 whitespace-nowrap',
              tab === t.id ? 'text-white' : 'text-surface-400 hover:text-white',
            )}
          >
            <span className="text-xs font-semibold">
              <span aria-hidden="true">{t.emoji}</span>{' '}{t.label}
              {isGuest && t.id !== 'swing' && (
                <span className="ml-1 text-[9px] text-surface-600">🔒</span>
              )}
            </span>
            <span className={cn('text-[10px]', tab === t.id ? 'text-white/70' : 'text-surface-500')}>{t.sub}</span>
          </button>
        ))}
      </div>

      {/* ── Sticky summary strip ── */}
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
            <div className="flex items-baseline gap-1">
              <span className={cn('font-mono font-bold text-lg tabular-nums leading-none', scoreColor)}>{typeof score === 'number' ? score.toFixed(2) : score}</span>
              <span className="text-[10px] text-surface-600 font-mono">/100</span>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-surface-800 shrink-0" />
            <span className="font-mono text-sm text-surface-900 dark:text-white tabular-nums leading-none">{formatINR(a.current_price, 0)}</span>
            <Change value={a.potential_return} size="sm" />
            <div className="h-4 w-px bg-gray-200 dark:bg-surface-800 shrink-0" />
            <SignalBadge strength={signal} short />
            <div className="ml-auto">
              <GradeBadge grade={a.investment_grade} showFull />
            </div>
          </div>
        )
      })()}

      {/* ── Content ── */}
      <div key={tab} className="animate-slide-in-right">
        {isPending ? (
          <AnalysisSkeleton />
        ) : error ? (
          // For guests — show signup prompt on any error
          isGuest ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
                  <path d="M14 4a10 10 0 100 20A10 10 0 0014 4z"/><path d="M14 12v6M14 10v.5"/>
                </svg>
              </div>
              <p className="text-lg font-semibold text-white">
                You&apos;ve used your free guest analysis
              </p>
              <p className="text-sm text-surface-400 max-w-xs leading-relaxed">
                Sign up free to unlock 10 technical analyses every day, portfolio builder, and more
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={() => { track.guestSignupClicked('limit_reached', 'google'); signIn('google', { callbackUrl: `/stocks/${symbol}` }) }}
                  className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-all shadow-md"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google — it&apos;s free
                </button>
                <Link href={`/signup?from=/stocks/${symbol}`} className="flex items-center justify-center px-6 py-3 rounded-xl border border-surface-700 text-white font-medium text-sm hover:bg-surface-800 transition-all">
                  Sign up with email
                </Link>
              </div>
              <p className="text-xs text-surface-600 mt-1">
                Already have an account?{' '}
                <Link href={`/login?from=/stocks/${symbol}`} className="text-brand-cyan hover:underline">Log in</Link>
              </p>
            </div>
          ) : (
            <ErrorState error={error} onRetry={() => refetch()} />
          )
        ) : tab === 'compare' ? (
          <CompareView data={data as CompareResponse} />
        ) : (
          isGuest ? (
            <div className="relative overflow-hidden rounded-2xl">
              <AnalysisView analysis={data as StockAnalysis} />
              <GuestSignupPromptTracked symbol={symbol} />
            </div>
          ) : (
            <AnalysisView analysis={data as StockAnalysis} />
          )
        )}
      </div>

      {/* ── Legal disclaimer ── */}
      <p className="text-[10px] text-surface-700 text-center leading-relaxed pb-2">
        All outputs are AI-generated technical observations. Not a research report under SEBI RA Regulations 2014. Not investment advice. Always do your own research.
      </p>

    </div>
  )
}
