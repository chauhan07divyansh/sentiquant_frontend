'use client'

// APP-INFO: Replaces the market index cards (NIFTY 50, SENSEX, NIFTY BANK).
// Shows static informational cards — zero API calls, instant render.

import type { ReactNode } from 'react'
import { useInView } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  APP-INFO: Card data
// ─────────────────────────────────────────────
type CardColor = 'blue' | 'cyan' | 'emerald'

interface AppInfoCardData {
  title: string
  color: CardColor
  steps: string[]
  icon: ReactNode
}

// APP-INFO: Three informational cards — How It Works, Key Features, Get Started.
const APP_INFO_CARDS: AppInfoCardData[] = [
  {
    title: 'How It Works',
    color: 'blue',
    steps: [
      'Browse 250+ major NSE stocks from the list',
      'Click any stock to trigger instant AI analysis',
      'View entry price, stop-loss & 3 price targets',
    ],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="3.5" />
        <path d="M9 10.5V13" />
        <path d="M7 15.5h4" />
        <path d="M7.5 13.5h3" />
      </svg>
    ),
  },
  {
    title: 'Key Features',
    color: 'cyan',
    steps: [
      'Swing (1–4 weeks) & position (6–18 months) signals',
      'Investment grade A+ to D with score /100',
      'Side-by-side strategy comparison on any stock',
    ],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5l1.9 3.85 4.25.62-3.07 3 .72 4.23L9 11l-3.8 2.2.72-4.23-3.07-3 4.25-.62L9 1.5z" />
      </svg>
    ),
  },
  {
    title: 'Get Started',
    color: 'emerald',
    steps: [
      'Click "Analyze stocks" in Quick actions below',
      'Search by ticker symbol — TCS, INFY, RELIANCE',
      'Follow the AI signal and set your trade plan',
    ],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2C5.5 2 3 5 3 8c0 2 1 3.5 2 4.5V14h8v-1.5c1-1 2-2.5 2-4.5 0-3-2.5-6-6-6z" />
        <path d="M6.5 14v1.5a.5.5 0 00.5.5h4a.5.5 0 00.5-.5V14" />
        <path d="M9 5.5v4M7 7.5l2-2 2 2" />
      </svg>
    ),
  },
]

// APP-INFO: Color token map — keeps Tailwind classes in one place.
const COLOR_MAP: Record<CardColor, { icon: string; badge: string; dot: string }> = {
  blue:    { icon: 'text-brand-blue',  badge: 'bg-brand-blue/10  border-brand-blue/20',  dot: 'bg-brand-blue'  },
  cyan:    { icon: 'text-brand-cyan',  badge: 'bg-brand-cyan/10  border-brand-cyan/20',  dot: 'bg-brand-cyan'  },
  emerald: { icon: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
}

// ─────────────────────────────────────────────
//  APP-INFO: Single informational card
//  Scroll-reveal animation matches the original IndexCard pattern.
// ─────────────────────────────────────────────
function AppInfoCard({ card, delay }: { card: AppInfoCardData; delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2)
  const colors = COLOR_MAP[card.color]

  return (
    <div
      ref={ref}
      className={cn(
        'scroll-reveal flex flex-col gap-4 p-5 rounded-xl',
        'bg-white dark:bg-surface-900/60',
        'border border-gray-200 dark:border-surface-700/60',
        'shadow-sm dark:shadow-none',
        inView && 'in-view'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* APP-INFO: Icon + title row */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center border shrink-0',
          colors.badge, colors.icon
        )}>
          {card.icon}
        </div>
        <p className="text-sm font-semibold text-surface-900 dark:text-white leading-tight">
          {card.title}
        </p>
      </div>

      {/* APP-INFO: Numbered steps */}
      <ol className="flex flex-col gap-2.5">
        {card.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={cn(
              'shrink-0 w-4 h-4 rounded-full flex items-center justify-center',
              'text-[10px] font-bold mt-0.5 border',
              colors.badge, colors.icon
            )}>
              {i + 1}
            </span>
            <span className="text-xs text-surface-500 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─────────────────────────────────────────────
//  APP-INFO: Exported component
//  Drop-in replacement for the old MarketOverview.
//  Same export name → dashboard page unchanged.
// ─────────────────────────────────────────────
export function MarketOverview() {
  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white whitespace-nowrap">
          App guide
        </h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
      </div>

      {/* APP-INFO: 3-column responsive grid — matches original IndexCard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {APP_INFO_CARDS.map((card, i) => (
          <AppInfoCard key={card.title} card={card} delay={i * 80} />
        ))}
      </div>
    </div>
  )
}
