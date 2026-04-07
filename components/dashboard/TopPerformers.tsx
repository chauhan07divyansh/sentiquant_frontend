'use client'

// ENHANCEMENT: Top gaining stocks today — mock data, linked to stock detail pages.
// Replace MOCK_PERFORMERS with a live API call (sort by changePercent desc) when ready.

import Link from 'next/link'
import { useInView } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'

interface Performer {
  symbol:        string
  company:       string
  price:         number
  changePercent: number
}

// ENHANCEMENT: Mock data — replace with live endpoint when backend gain-sorted feed is ready
const MOCK_PERFORMERS: Performer[] = [
  { symbol: 'HDFCBANK',   company: 'HDFC Bank',     price: 1642, changePercent:  5.52 },
  { symbol: 'ICICIBANK',  company: 'ICICI Bank',    price: 1089, changePercent:  5.01 },
  { symbol: 'BHARTIARTL', company: 'Bharti Airtel', price: 1456, changePercent:  4.60 },
]

// ENHANCEMENT: Gold / silver / bronze rank badge styles
const RANK_STYLES = [
  'bg-amber-400/15 border border-amber-400/30 text-amber-400',       // 1st — gold
  'bg-surface-700/50 border border-surface-600/80 text-surface-300', // 2nd — silver
  'bg-orange-900/20 border border-orange-400/25 text-orange-400',    // 3rd — bronze
]

export function TopPerformers() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1)

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-1">
        <div>
          <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white">Top performers</h2>
        </div>
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
        {/* ENHANCEMENT: NSE badge */}
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          NSE · today
        </span>
      </div>

      {/* ENHANCEMENT: Card container with scroll-reveal */}
      <div
        ref={ref}
        className={cn(
          'scroll-reveal card p-0 overflow-hidden',
          inView && 'in-view'
        )}
      >
        {MOCK_PERFORMERS.map((s, i) => (
          <Link
            key={s.symbol}
            href={`/stocks/${s.symbol}`}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-surface-800/30 transition-colors duration-150 group"
            style={{ transitionDelay: inView ? `${i * 60}ms` : '0ms' }}
          >
            {/* ENHANCEMENT: Rank badge (gold/silver/bronze) */}
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
              RANK_STYLES[i]
            )}>
              {i + 1}
            </div>

            {/* Symbol + company */}
            <div className="flex-1 min-w-0">
              <span className="font-display font-bold text-sm text-surface-900 dark:text-white tracking-tight block">
                {s.symbol}
              </span>
              <span className="text-[11px] text-surface-500 truncate">{s.company}</span>
            </div>

            {/* Price + change % */}
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="font-mono text-xs font-semibold text-surface-900 dark:text-white tabular-nums">
                ₹{s.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 tabular-nums">
                +{s.changePercent.toFixed(2)}%
              </span>
            </div>

            {/* Chevron */}
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round"
              className="text-surface-600 shrink-0 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all duration-150"
            >
              <path d="M3.5 2l3 3-3 3" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="text-[10px] text-surface-600 text-right">
        Sorted by daily gain · live market data
      </p>
    </div>
  )
}
