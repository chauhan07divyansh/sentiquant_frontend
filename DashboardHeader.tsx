'use client'

// APP-INFO: Replaces the "Top performers" mock data section.
// Shows feature highlights — zero API calls, static content.
// Same export name (TopPerformers) → dashboard page unchanged.

import type { ReactNode } from 'react'
import { useInView } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  APP-INFO: Feature data
// ─────────────────────────────────────────────
interface Feature {
  title:       string
  description: string
  color:       'blue' | 'cyan' | 'emerald' | 'amber'
  icon:        ReactNode
}

// APP-INFO: Four feature highlights shown in a 2×2 grid.
const FEATURES: Feature[] = [
  {
    title:       'AI Analysis',
    description: 'ML models analyse price action, technicals & sentiment simultaneously.',
    color:       'blue',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="12" height="8" rx="2" />
        <path d="M5 5V3.5a3 3 0 016 0V5" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="M8 10.5v1.5" />
      </svg>
    ),
  },
  {
    title:       'Buy/Sell Signals',
    description: 'Clear STRONG BUY → SELL ratings with an overall score out of 100.',
    color:       'cyan',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14" />
      </svg>
    ),
  },
  {
    title:       '3 Target Prices',
    description: 'Each analysis delivers 3 graduated targets plus a precise stop-loss.',
    color:       'emerald',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12.5l3.5-4.5 3 3 4-6 2 2" />
        <path d="M2 14.5h12" />
        <circle cx="13.5" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title:       'Live Market Data',
    description: 'NSE/BSE prices fetched fresh on every request — no stale cached values.',
    color:       'amber',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 8A5.5 5.5 0 112.5 8" />
        <path d="M13.5 4v4h-4" />
      </svg>
    ),
  },
]

// APP-INFO: Color token map.
const COLOR_MAP: Record<Feature['color'], { icon: string; bg: string }> = {
  blue:    { icon: 'text-brand-blue',  bg: 'bg-brand-blue/10  border-brand-blue/20'  },
  cyan:    { icon: 'text-brand-cyan',  bg: 'bg-brand-cyan/10  border-brand-cyan/20'  },
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  amber:   { icon: 'text-amber-400',   bg: 'bg-amber-400/10   border-amber-400/20'   },
}

// ─────────────────────────────────────────────
//  APP-INFO: Exported component
//  Drop-in replacement for the old TopPerformers.
// ─────────────────────────────────────────────
export function TopPerformers() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1)

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-1">
        <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white whitespace-nowrap">
          What you get
        </h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
        {/* APP-INFO: Static badge — not a live data indicator */}
        <span className="text-[10px] font-semibold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full">
          Included
        </span>
      </div>

      {/* APP-INFO: 2×2 feature grid — same scroll-reveal wrapper as old performers card */}
      <div
        ref={ref}
        className={cn(
          'scroll-reveal card p-4 overflow-hidden',
          inView && 'in-view'
        )}
      >
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => {
            const colors = COLOR_MAP[f.color]
            return (
              <div
                key={f.title}
                className="flex flex-col gap-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-surface-800/40 border border-gray-100 dark:border-surface-700/50"
                style={{ transitionDelay: inView ? `${i * 60}ms` : '0ms' }}
              >
                {/* APP-INFO: Icon badge */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center border shrink-0',
                  colors.bg, colors.icon
                )}>
                  {f.icon}
                </div>

                {/* Title + description */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-surface-900 dark:text-white leading-none">
                    {f.title}
                  </span>
                  <span className="text-[11px] text-surface-500 leading-relaxed">
                    {f.description}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* APP-INFO: Footer note */}
      <p className="text-[10px] text-surface-600 text-right">
        Available on all 250+ NSE stocks
      </p>
    </div>
  )
}
