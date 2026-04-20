'use client'

// FIXED: extracted from app/(marketing)/contact/page.tsx so that page can be
// a server component and its export const metadata is no longer silently ignored

import { useState } from 'react'
import { cn }       from '@/lib/utils/cn'

const FAQS = [
  {
    q: 'Is this real financial advice?',
    a: 'No. Sentiquant provides AI-generated analysis for informational purposes only. Always consult a SEBI-registered financial advisor before investing.',
  },
  {
    q: 'Which stocks does Sentiquant cover?',
    a: 'We currently cover 250+ stocks across NSE and BSE, spanning large-cap, mid-cap, and select small-cap equities.',
  },
  {
    q: 'How long does analysis take?',
    a: 'Individual stock analysis takes under 60 seconds. Portfolio generation analyses all stocks and may take up to 60 seconds.',
  },
  {
    q: 'How often are signals updated?',
    a: 'Signals are generated fresh on each analysis request. The backend caches results for 5 minutes to prevent redundant API calls.',
  },
  {
    q: 'Can I connect my broker account?',
    a: 'Not yet. Sentiquant is a pure analysis platform. Broker integration is on our product roadmap.',
  },
] as const

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col divide-y divide-gray-200 dark:divide-white/8">
      {FAQS.map((faq, i) => (
        <div key={i} className="rounded-xl -mx-3 px-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 ease-out">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            aria-expanded={open === i}
          >
            <span className={cn(
              'text-sm font-semibold transition-colors',
              open === i
                ? 'text-brand-cyan'
                : 'text-surface-900 dark:text-white group-hover:text-brand-cyan'
            )}>
              {faq.q}
            </span>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round"
              className={cn(
                'shrink-0 text-surface-400 dark:text-surface-500 transition-transform duration-200',
                open === i && 'rotate-180 text-brand-cyan'
              )}
            >
              <path d="M2 5l5 5 5-5"/>
            </svg>
          </button>
          {open === i && (
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed pb-5 animate-fade-in">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
