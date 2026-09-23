'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { getTrackedPortfolios } from '@/lib/api/portfolio.api'
import { Badge, type BadgeColor } from '@/components/ui/Badge'
import { ErrorState } from '@/components/common/ErrorState'
import { formatINR } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import type { TrackedPortfolio, TrackedPosition } from '@/types/portfolio.types'

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function strategyLabel(strategy: string): string {
  return `${capitalize(strategy)} Trading`
}

function statusBadge(position: TrackedPosition): { color: BadgeColor; label: string } {
  if (position.status === 'open') return { color: 'neutral', label: 'Open' }
  if (position.status === 'partial_closed') return { color: 'success', label: '50% Closed (T1)' }
  // closed
  if (position.exitReason === 'stop_loss_hit') return { color: 'danger', label: 'Closed (Stop Loss)' }
  return { color: 'success', label: 'Closed (Target)' }
}

// ─────────────────────────────────────────────
//  LEVEL — small reference-level chip
// ─────────────────────────────────────────────
function Level({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-semibold text-surface-500 uppercase tracking-wider">{label}</span>
      <span className={cn('font-mono text-xs font-semibold tabular-nums', color ?? 'text-surface-300')}>
        {formatINR(value, 0)}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────
//  POSITION ROW
// ─────────────────────────────────────────────
function PositionRow({ position }: { position: TrackedPosition }) {
  const badge = statusBadge(position)
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-lg font-bold text-surface-900 dark:text-white">{position.symbol}</span>
          <span className="text-[11px] text-surface-500">{position.name}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {position.status === 'open' ? (
            <span className="text-[11px] font-medium text-[#9ca3af]">{badge.label}</span>
          ) : (
            <Badge color={badge.color}>{badge.label}</Badge>
          )}
          <span className="text-[11px] text-surface-500 font-mono tabular-nums">Entry {formatINR(position.entryPrice, 0)}</span>
        </div>
      </div>

      {(position.status === 'partial_closed' || position.status === 'closed') && (
        <div className="flex flex-col gap-0.5 text-[11px] text-surface-500">
          {position.partialExitPrice != null && position.partialExitDate && (
            <span>50% exited at {formatINR(position.partialExitPrice, 0)} on {formatDateTime(position.partialExitDate)}</span>
          )}
          {position.status === 'closed' && position.exitPrice != null && position.exitDate && (
            <span>Closed at {formatINR(position.exitPrice, 0)} on {formatDateTime(position.exitDate)}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1 border-t border-gray-100 dark:border-surface-800/60">
        <div className="pt-3"><Level label="Entry" value={position.entryPrice} /></div>
        <div className="pt-3"><Level label="Stop Loss" value={position.stopLoss} color="text-rose-400" /></div>
        <div className="pt-3"><Level label="T1" value={position.t1} color="text-emerald-400/80" /></div>
        <div className="pt-3"><Level label="T2" value={position.t2} color="text-emerald-400" /></div>
        <div className="pt-3"><Level label="T3" value={position.t3} color="text-emerald-400/60" /></div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PORTFOLIO CARD
// ─────────────────────────────────────────────
function TrackedPortfolioCard({ portfolio }: { portfolio: TrackedPortfolio }) {
  return (
    <div className="rounded-[10px] border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{strategyLabel(portfolio.strategy)}</h3>
          <p className="text-[11px] text-surface-500">
            {formatINR(portfolio.budget, 0)} budget · {capitalize(portfolio.riskAppetite)} risk · Started {formatDateTime(portfolio.createdAt)}
          </p>
        </div>
        <span className="text-[10px] text-surface-500">{portfolio.positions.length} position{portfolio.positions.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-surface-800/60">
        {portfolio.positions.map((p) => (
          <PositionRow key={p.id} position={p} />
        ))}
      </div>
    </div>
  )
}

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
  const [portfolios, setPortfolios] = useState<TrackedPortfolio[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getTrackedPortfolios()
      setPortfolios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your tracked portfolios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  let body: ReactNode
  if (loading) {
    body = (
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-40 rounded-[10px] border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse" />
        ))}
      </div>
    )
  } else if (error) {
    body = <ErrorState message={error} onRetry={load} />
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
