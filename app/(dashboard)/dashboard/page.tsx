'use client'

import Link from 'next/link'
import { useAuthStore, useWatchlistStore } from '@/store'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
// ENHANCEMENT: New dashboard content sections
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { RecentSignals }  from '@/components/dashboard/RecentSignals'
import { TopPerformers }  from '@/components/dashboard/TopPerformers'

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────

// Market mood — updated daily by the research team (mock for now)
const MARKET_MOOD = {
  label:       'Bullish',
  description: 'Broad market trending above key moving averages',
  color:       'text-emerald-400',
  bg:          'bg-emerald-400/8 border-emerald-400/20',
  dot:         'bg-emerald-400',
  arrow:       '↑',
}

// Quick stats — build trust and set expectations
const QUICK_STATS = [
  {
    label: 'Stocks tracked', value: '250+',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 10.5l3-3.5 2.5 2.5 3.5-5L13 8" /><path d="M1 13h12" />
      </svg>
    ),
  },
  {
    label: 'Exchanges covered', value: 'NSE · BSE',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="10" height="5.5" rx="1" /><path d="M1 7l6-5.5L13 7" /><rect x="5.5" y="9" width="3" height="3.5" rx="0.5" />
      </svg>
    ),
  },
  {
    label: 'AI models active', value: '3',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="2.5" /><path d="M7 1.5V3M7 11v1.5M1.5 7H3M11 7h1.5M3.3 3.3l1.1 1.1M9.6 9.6l1.1 1.1M10.7 3.3l-1.1 1.1M4.4 9.6l-1.1 1.1" />
      </svg>
    ),
  },
  {
    label: 'Data freshness', value: 'Live',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="5" /><path d="M7 4v3.5l2 1.5" />
        <circle cx="7" cy="7" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

// Curated quick-access symbols
const TOP_PICKS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'BAJFINANCE', 'WIPRO'] as const

// Quick actions
const QUICK_ACTIONS = [
  {
    label:       'Analyze stocks',
    description: 'AI signals for 250+ NSE & BSE stocks',
    href:        '/stocks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 13L6.5 8 9.5 11 14 6"/>
        <circle cx="14" cy="6" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M2 16H16"/>
      </svg>
    ),
  },
  {
    label:       'Build a portfolio',
    description: 'Auto-allocate your budget across top picks',
    href:        '/portfolio',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="14" height="10" rx="2"/>
        <path d="M6 6V5a3 3 0 016 0v1"/>
        <path d="M2 10h14"/>
      </svg>
    ),
  },
] as const

// ─────────────────────────────────────────────
//  SYMBOL CHIP — used for recently viewed + watchlist
// ─────────────────────────────────────────────
function SymbolChip({ symbol }: { symbol: string }) {
  return (
    <Link
      href={`/stocks/${symbol}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold',
        'bg-surface-800/60 border border-surface-700 text-surface-200',
        'hover:bg-surface-700/80 hover:border-surface-600 hover:text-white',
        'transition-all duration-150 active:scale-95'
      )}
    >
      {symbol}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 2h5v5M3 7l5-5"/>
      </svg>
    </Link>
  )
}

// ─────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
      {action}
    </div>
  )
}

// ─────────────────────────────────────────────
//  DASHBOARD HOME PAGE
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user }                      = useAuthStore()
  const { watchlist, recentlyViewed } = useWatchlistStore()

  const firstName = user?.name?.split(' ')[0] ?? 'Trader'
  const hour      = new Date().getHours()
  const greeting  =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening'

  return (
    <div className="flex flex-col gap-8 animate-fade-in dashboard-container">

      {/* ── Welcome header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-surface-500 uppercase tracking-widest">{greeting}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05]">
            Welcome back, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Here&apos;s your trading overview for today.
          </p>
        </div>

        {/* Market mood pill */}
        <div className={cn(
          'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border self-start sm:self-auto',
          MARKET_MOOD.bg
        )}>
          <span className={cn('w-2 h-2 rounded-full shrink-0', MARKET_MOOD.dot)} />
          <div className="flex flex-col leading-none gap-0.5">
            <span className={cn('text-xs font-semibold', MARKET_MOOD.color)}>
              {MARKET_MOOD.arrow} Market: {MARKET_MOOD.label}
            </span>
            <span className="text-[10px] text-surface-500">{MARKET_MOOD.description}</span>
          </div>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-surface-900/80 border border-gray-100 dark:border-surface-800 shadow-sm dark:shadow-none"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan" aria-hidden="true">
              {stat.icon}
            </div>
            <div>
              <p className="font-display font-bold text-xl text-surface-900 dark:text-white leading-none tabular-nums">{stat.value}</p>
              <p className="text-[10px] text-surface-500 mt-1 uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ENHANCEMENT: Market overview — index cards with animated count-up ── */}
      <MarketOverview />

      {/* ── Quick actions ── */}
      <div>
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'group flex items-center gap-4 p-5 rounded-xl',
                'bg-gradient-to-br from-surface-900 to-surface-950',
                'border border-surface-800 hover:border-brand-blue/30',
                'hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]',
                'transition-all duration-200 active:scale-[0.99]'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0 group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="font-sans font-semibold text-sm text-surface-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-surface-500 mt-0.5 truncate">{action.description}</p>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                className="text-surface-700 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all duration-150 shrink-0 ml-auto"
              >
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ── ENHANCEMENT: Recent signals + Top performers — 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSignals />
        <TopPerformers />
      </div>

      {/* ── Watchlist ── */}
      <div>
        <SectionHeader
          title={`Watchlist${watchlist.length > 0 ? ` · ${watchlist.length}` : ''}`}
          action={
            watchlist.length > 0 ? (
              <Link href="/stocks" className="text-[10px] font-medium text-brand-cyan hover:text-brand-blue transition-colors">
                Browse all →
              </Link>
            ) : undefined
          }
        />
        {watchlist.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {watchlist.map((symbol) => (
              <SymbolChip key={symbol} symbol={symbol} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2.5h12a1 1 0 011 1v13.5l-7-3.5-7 3.5V3.5a1 1 0 011-1z"/>
              </svg>
            }
            title="No stocks saved yet"
            description="Bookmark stocks on the analysis page — they'll appear here for quick access."
            action={
              <Link
                href="/stocks"
                className="text-xs font-medium text-brand-cyan hover:text-brand-blue transition-colors px-4 py-2 rounded-lg bg-brand-cyan/8 border border-brand-cyan/20"
              >
                Browse stocks
              </Link>
            }
            className="py-10"
          />
        )}
      </div>

      {/* ── Recently viewed ── */}
      <div>
        <SectionHeader title="Recently viewed" />
        {recentlyViewed.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recentlyViewed.map((symbol) => (
              <SymbolChip key={symbol} symbol={symbol} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>
              </svg>
            }
            title="No recent activity"
            description="Open any stock analysis and it will appear here."
            action={
              <Link
                href="/stocks"
                className="text-xs font-medium text-brand-cyan hover:text-brand-blue transition-colors px-4 py-2 rounded-lg bg-brand-cyan/8 border border-brand-cyan/20"
              >
                Explore stocks
              </Link>
            }
            className="py-10"
          />
        )}
      </div>

      {/* ── Top picks (curated quick access) ── */}
      <div>
        <SectionHeader
          title="Top picks — quick access"
          action={
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-cyan bg-brand-cyan/8 border border-brand-cyan/20 px-2 py-0.5 rounded-full">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-emerald-400"><circle cx="4" cy="4" r="4"/></svg>
              AI-curated
            </span>
          }
        />
        <div className="flex flex-wrap gap-2">
          {TOP_PICKS.map((symbol) => (
            <SymbolChip key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>

      {/* ── Bottom trust strip ── */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-surface-800 flex-wrap">
        <span className="text-[10px] text-surface-600">
          Sentiquant analyzes 250+ NSE & BSE stocks in real time using AI signals.
        </span>
        <span className="text-[10px] text-rose-400/70 ml-auto">
          Not financial advice. Always consult a SEBI-registered advisor.
        </span>
      </div>

    </div>
  )
}
