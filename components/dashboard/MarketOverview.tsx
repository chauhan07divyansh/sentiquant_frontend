'use client'

// ENHANCEMENT: Market indices overview with animated count-up on scroll entry.
// Uses mock data — replace with live NSE/BSE feed when API is available.

import { useEffect } from 'react'
import { useInView, useCountUp } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'

interface IndexData {
  name:          string
  value:         number
  change:        number
  changePercent: number
}

// ENHANCEMENT: Mock data — will be replaced by live NSE/BSE market data
const INDICES: IndexData[] = [
  { name: 'NIFTY 50',   value: 24150, change:  245, changePercent:  1.02 },
  { name: 'SENSEX',     value: 79800, change:  580, changePercent:  0.73 },
  { name: 'NIFTY BANK', value: 52340, change: -120, changePercent: -0.23 },
]

// ENHANCEMENT: Individual index card — count-up triggers when card enters viewport
function IndexCard({ index, delay }: { index: IndexData; delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2)
  const { count, run }  = useCountUp(index.value, 1400)
  const isPositive      = index.change >= 0

  useEffect(() => { if (inView) run() }, [inView, run])

  return (
    <div
      ref={ref}
      className={cn(
        'scroll-reveal flex flex-col gap-3 p-5 rounded-xl',
        'bg-white dark:bg-surface-900/60',
        'border border-gray-200 dark:border-surface-700/60',
        'shadow-sm dark:shadow-none',
        inView && 'in-view'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">{index.name}</p>

      {/* ENHANCEMENT: Animated value — en-IN locale adds Indian-style comma grouping */}
      <p className="font-display text-2xl font-bold text-surface-900 dark:text-white tabular-nums leading-none">
        {Math.floor(count).toLocaleString('en-IN')}
      </p>

      <div className="flex items-center gap-2">
        <span className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold',
          isPositive
            ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400'
            : 'bg-rose-400/10 border border-rose-400/20 text-rose-400'
        )}>
          {/* ENHANCEMENT: Triangle arrow — rotated 180° for negative values */}
          <svg
            width="8" height="6" viewBox="0 0 8 6" fill="currentColor"
            className={cn('shrink-0', !isPositive && 'rotate-180')}
          >
            <path d="M4 0L8 6H0L4 0Z" />
          </svg>
          {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
        </span>
        <span className="text-[10px] text-surface-500 font-mono tabular-nums">
          {isPositive ? '+' : ''}{index.change.toLocaleString('en-IN')} pts
        </span>
      </div>
    </div>
  )
}

export function MarketOverview() {
  return (
    <div className="flex flex-col gap-3">
      {/* Section header — matches the existing SectionHeader pattern in the dashboard */}
      <div className="flex items-center gap-3">
        <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white whitespace-nowrap">
          Market overview
        </h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
        {/* ENHANCEMENT: Live pulse dot signals this is real-time data */}
        <span className="text-[10px] font-medium text-surface-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          Today
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {INDICES.map((idx, i) => (
          <IndexCard key={idx.name} index={idx} delay={i * 80} />
        ))}
      </div>
    </div>
  )
}
