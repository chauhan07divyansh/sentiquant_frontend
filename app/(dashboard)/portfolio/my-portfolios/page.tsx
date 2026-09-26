'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useTrackedPortfolios } from '@/hooks/useQueryHooks'
import { TrackedPortfolioCard } from '@/components/portfolio/TrackedPortfolioCard'
import { ErrorState } from '@/components/common/ErrorState'

// ─────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan" aria-hidden="true">
          <path d="M4 21V9l9-6 9 6v12" /><path d="M9 21v-8h8v8" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-medium text-surface-900 dark:text-white">You haven&apos;t tracked any portfolios yet</p>
        <p className="text-sm text-surface-400 max-w-xs leading-relaxed">Generate a portfolio and track it to get notified when positions hit their targets or stop-loss.</p>
      </div>
      <Link href="/portfolio" className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-medium hover:bg-brand-blue/80 transition-colors">
        Generate a portfolio
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────
export default function MyPortfoliosPage() {
  const { data: portfolios, error, isPending, refetch } = useTrackedPortfolios()

  let body: ReactNode
  if (isPending) {
    body = (
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-40 rounded-[10px] border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse" />
        ))}
      </div>
    )
  } else if (error) {
    body = <ErrorState message={error.message || 'Could not load your tracked portfolios.'} onRetry={() => refetch()} />
  } else if (!portfolios || portfolios.length === 0) {
    body = <EmptyState />
  } else {
    body = (
      <div className="flex flex-col gap-5">
        {portfolios.map((p) => (
          <TrackedPortfolioCard key={p.id} portfolio={p} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '880px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
      <div className="flex flex-col gap-2">
        <span className="block text-xs font-semibold text-brand-cyan uppercase tracking-widest">My portfolios</span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05]">Tracked portfolios</h1>
        <p className="text-sm sm:text-base text-surface-400 leading-relaxed mt-1">
          Live status for every portfolio you&apos;ve chosen to track — updated as positions hit targets or stop-loss.
        </p>
      </div>
      {body}
    </div>
  )
}
