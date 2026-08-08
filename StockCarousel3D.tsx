'use client'

// APP-INFO: Replaces the "Recent signals" mock data section.
// Shows a step-by-step usage guide — zero API calls, static content.
// Same export name (RecentSignals) → dashboard page unchanged.

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useInView } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  APP-INFO: Step data
// ─────────────────────────────────────────────
interface Step {
  step:        number
  title:       string
  description: string
  icon:        ReactNode
  href?:       string
  cta?:        string
}

// APP-INFO: Four steps explaining how to use the app.
const STEPS: Step[] = [
  {
    step:        1,
    title:       'Browse Stocks',
    description: 'Visit the Stocks page to see 250+ major NSE equities — searchable by name or ticker.',
    href:        '/stocks',
    cta:         'Open stocks',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="11" height="11" rx="2" />
        <path d="M4.5 7h5M4.5 4.5h5M4.5 9.5h3" />
      </svg>
    ),
  },
  {
    step:        2,
    title:       'Pick a Stock',
    description: 'Click any stock card to trigger the AI analysis engine — results appear in seconds.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="4.5" />
        <path d="M9.5 9.5l3 3" />
      </svg>
    ),
  },
  {
    step:        3,
    title:       'Read the Signal',
    description: 'Review the AI signal — entry price, stop-loss, and 3 graduated price targets.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 10.5l3-4 2.5 2.5 3-4.5 3 2.5" />
        <path d="M1.5 12.5h11" />
      </svg>
    ),
  },
  {
    step:        4,
    title:       'Plan Your Trade',
    description: 'Choose swing (1–4 weeks) or position (6–18 months) and follow the AI\'s trade plan.',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 1.5v11M3.5 4l3.5-2.5L10.5 4" />
        <path d="M3.5 10l3.5 2.5 3.5-2.5" />
      </svg>
    ),
  },
]

// ─────────────────────────────────────────────
//  APP-INFO: Exported component
//  Drop-in replacement for the old RecentSignals.
// ─────────────────────────────────────────────
export function RecentSignals() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1)

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-1">
        <h2 className="font-sans font-semibold text-sm text-surface-900 dark:text-white whitespace-nowrap">
          How to use Sentiquant
        </h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
        <Link
          href="/stocks"
          className="text-[10px] font-medium text-brand-cyan hover:text-brand-blue transition-colors"
        >
          Get started →
        </Link>
      </div>

      {/* APP-INFO: Step list — same card + scroll-reveal pattern as old signal rows */}
      <div
        ref={ref}
        className={cn(
          'scroll-reveal card p-0 overflow-hidden',
          inView && 'in-view'
        )}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.step}
            className="relative flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800/50 last:border-b-0"
            style={{ transitionDelay: inView ? `${i * 60}ms` : '0ms' }}
          >
            {/* APP-INFO: Numbered step badge */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold shrink-0 mt-0.5">
              {s.step}
            </div>

            {/* Title + description */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-sans font-semibold text-sm text-surface-900 dark:text-white">
                  {s.title}
                </span>
                <span className="text-surface-600" aria-hidden="true">{s.icon}</span>
              </div>
              <span className="text-xs text-surface-500 leading-relaxed">{s.description}</span>
            </div>

            {/* Optional CTA link */}
            {s.href && s.cta && (
              <Link
                href={s.href}
                className="shrink-0 text-[10px] font-medium text-brand-cyan hover:text-brand-blue transition-colors whitespace-nowrap self-center"
              >
                {s.cta} →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* APP-INFO: Footer hint */}
      <p className="text-[10px] text-surface-600 text-right">
        AI analysis runs live · no stale data
      </p>
    </div>
  )
}
