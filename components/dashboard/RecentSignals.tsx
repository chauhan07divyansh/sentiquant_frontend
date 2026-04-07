'use client'

// ENHANCEMENT: Recent AI-generated stock signals — mock data, linked to detail pages.
// Replace MOCK_SIGNALS with a real endpoint call when the signal-feed API is ready.

import Link from 'next/link'
import { useInView } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'

interface Signal {
  symbol:     string
  company:    string
  signal:     'BUY' | 'SELL' | 'HOLD'
  confidence: number
  price:      number
  target:     number
  timestamp:  string
}

// ENHANCEMENT: Mock data — replace with live API call when signal feed is available
const MOCK_SIGNALS: Signal[] = [
  {
    symbol:     'TCS',
    company:    'Tata Consultancy Services',
    signal:     'BUY',
    confidence: 92,
    price:      3842,
    target:     4100,
    timestamp:  '2h ago',
  },
  {
    symbol:     'INFY',
    company:    'Infosys',
    signal:     'BUY',
    confidence: 88,
    price:      1456,
    target:     1580,
    timestamp:  '3h ago',
  },
  {
    symbol:     'RELIANCE',
    company:    'Reliance Industries',
    signal:     'HOLD',
    confidence: 76,
    price:      2456,
    target:     2500,
    timestamp:  '5h ago',
  },
]

// ENHANCEMENT: Signal badge styles — keyed by signal value for O(1) lookup
const SIGNAL_BADGE: Record<Signal['signal'], string> = {
  BUY:  'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400',
  SELL: 'bg-rose-400/10 border border-rose-400/20 text-rose-400',
  HOLD: 'bg-amber-400/10 border border-amber-400/20 text-amber-400',
}

export function RecentSignals() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1)

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-1">
        <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white whitespace-nowrap">
          Recent signals
        </h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
        <Link
          href="/stocks"
          className="text-[10px] font-medium text-brand-cyan hover:text-brand-blue transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* ENHANCEMENT: Card container with scroll-reveal on the whole list */}
      <div
        ref={ref}
        className={cn(
          'scroll-reveal card p-0 overflow-hidden',
          inView && 'in-view'
        )}
      >
        {MOCK_SIGNALS.map((s, i) => (
          <Link
            key={s.symbol}
            href={`/stocks/${s.symbol}`}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-surface-800/30 transition-colors duration-150 group"
            // ENHANCEMENT: Stagger row entrance delay — tied to inView so it only runs once
            style={{ transitionDelay: inView ? `${i * 60}ms` : '0ms' }}
          >
            {/* Symbol + company */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-surface-900 dark:text-white tracking-tight">
                  {s.symbol}
                </span>
                {/* ENHANCEMENT: Compact signal badge */}
                <span className={cn('text-[10px] font-bold px-1.5 py-px rounded-md', SIGNAL_BADGE[s.signal])}>
                  {s.signal}
                </span>
              </div>
              <span className="text-[11px] text-surface-500 truncate">{s.company}</span>
            </div>

            {/* Price + target */}
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="font-mono text-xs font-semibold text-surface-900 dark:text-white tabular-nums">
                ₹{s.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-surface-500 font-mono tabular-nums">
                T: ₹{s.target.toLocaleString('en-IN')}
              </span>
            </div>

            {/* ENHANCEMENT: Confidence micro bar */}
            <div className="flex flex-col items-center gap-1 shrink-0 w-10">
              <span className="text-[11px] font-bold text-brand-cyan tabular-nums">{s.confidence}%</span>
              <div className="w-full h-1 bg-gray-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan rounded-full"
                  style={{ width: `${s.confidence}%` }}
                />
              </div>
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
        AI-generated · refreshed every 30 min
      </p>
    </div>
  )
}
