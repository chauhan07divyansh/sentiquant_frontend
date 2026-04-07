'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { SignalBadge, GradeBadge, SystemBadge } from '@/components/ui/Badge'
import { ScoreBar, Change } from '@/components/ui/DataDisplay'
import { classifySignal } from '@/types/stock.types'
import { formatINR, timeAgo } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { useWatchlistStore } from '@/store'
import type { StockAnalysis } from '@/types/stock.types'

// ─────────────────────────────────────────────
//  SCORE HELPERS
//  Drive visual treatment from the score value:
//  70+ = high (cyan glow), 50–69 = mid (blue),
//  <50  = low (neutral)
// ─────────────────────────────────────────────
function scoreGlow(score: number) {
  if (score >= 70) return 'hover:shadow-[0_0_32px_rgba(6,182,212,0.18)] hover:border-brand-cyan/30'
  if (score >= 50) return 'hover:shadow-[0_0_24px_rgba(59,130,246,0.12)] hover:border-brand-blue/20'
  return 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-surface-600'
}

function scoreRing(score: number) {
  if (score >= 70) return { text: 'text-brand-cyan', bg: 'bg-brand-cyan/8 border-brand-cyan/20' }
  if (score >= 50) return { text: 'text-brand-blue', bg: 'bg-brand-blue/8 border-brand-blue/20' }
  return { text: 'text-surface-400', bg: 'bg-surface-800/60 border-surface-700' }
}

function scoreTopBar(score: number) {
  if (score >= 70) return 'bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-cyan'
  if (score >= 50) return 'bg-gradient-to-r from-brand-blue to-brand-blue/25'
  return 'bg-gray-200 dark:bg-surface-800/50'
}

// ─────────────────────────────────────────────
//  STOCK CARD
//  Shows score, price, signal, targets in a
//  compact card. Links to detail page.
// ─────────────────────────────────────────────
interface StockCardProps {
  analysis: StockAnalysis
  className?: string
}

// PERF: memo prevents re-render when parent (StocksPage) re-renders on search
//       keystroke. Each card's props only change when its analysis data changes.
export const StockCard = memo(function StockCard({ analysis, className }: StockCardProps) {
  const signal = classifySignal(analysis.trading_plan.signal)
  const score = analysis.overall_score
  const ring = scoreRing(score)
  const watched = useWatchlistStore((s) => s.watchlist.includes(analysis.symbol))
  const { addToWatchlist, removeFromWatchlist } = useWatchlistStore()

  // POLISH: 3D tilt — DOM-direct mutation, no state, desktop-only.
  // Includes translateY(-4px) to preserve the existing CSS hover-lift while tilting.
  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(max-width: 1023px)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width   // 0–1
    const y = (e.clientY - rect.top)  / rect.height  // 0–1
    const tiltX = (y - 0.5) *  6  // -3deg to +3deg
    const tiltY = (0.5 - x) *  6  // -3deg to +3deg
    el.style.transition = 'none'
    el.style.transform  = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`
  }, [])

  const handleTiltLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    // POLISH: spring back via the existing CSS transition-all duration-300
    el.style.transition = ''
    el.style.transform  = ''
  }, [])

  return (
    // PERF: prefetch={false} — with 18 cards visible, eager prefetch fires
    //       18 simultaneous route prefetches. Opt out to save bandwidth.
    <Link
      href={`/stocks/${analysis.symbol}`}
      prefetch={false}
      className="block group"
      aria-label={`View ${analysis.symbol} analysis`}
    >
      <div
        onMouseMove={handleTiltMove}
        onMouseLeave={handleTiltLeave}
        className={cn(
        'relative rounded-xl',
        'bg-white dark:bg-surface-900',
        'border border-gray-200 dark:border-surface-800',
        'shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)]',
        'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        // POLISH: GPU hint so tilt transform is composited — stays 60fps during mouse tracking
        'will-change-transform',
        // Lift + shadow on hover for premium depth feel
        'group-hover:-translate-y-[4px] group-hover:shadow-lg dark:group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]',
        scoreGlow(score),
        className
      )}>
        {/* Score-based top accent line — high scores glow brighter */}
        <div className={cn('absolute top-0 inset-x-0 h-[2px]', scoreTopBar(score))} />
        {/* Hover gradient overlay — adds depth without changing card color at rest */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex flex-col gap-5 p-5 pt-6">

          {/* ── Header: symbol + badge + score ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl text-surface-900 dark:text-white leading-none tracking-tight">
                  {analysis.symbol}
                </span>
                <SystemBadge type={analysis.system_type} />
              </div>
              <span className="text-xs text-surface-600 truncate leading-tight">{analysis.company_name}</span>
            </div>

            {/* Score badge — hero number, replaces buried score label */}
            <div className={cn(
              'shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border',
              'transition-all duration-300 group-hover:scale-110',
              ring.bg,
              // Subtle badge glow on hover matches score tier
              score >= 70 && 'group-hover:shadow-[0_0_16px_rgba(6,182,212,0.35)]',
              score >= 50 && score < 70 && 'group-hover:shadow-[0_0_14px_rgba(59,130,246,0.25)]'
            )}>
              <span className={cn('font-display font-bold text-xl leading-none tabular-nums', ring.text)}>
                {score}
              </span>
              <span className="text-[9px] text-surface-500 tracking-wide mt-0.5">/100</span>
            </div>
          </div>

          {/* ── Price + signal — signal moved here for better scanability ── */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-end gap-2.5">
              <span className="font-mono font-bold text-[22px] text-surface-900 dark:text-white tabular-nums leading-none">
                {formatINR(analysis.current_price, 0)}
              </span>
              <Change value={analysis.potential_return} size="sm" />
            </div>
            <SignalBadge strength={signal} />
          </div>

          {/* ── Score bar (label/value removed — score badge above does that job) ── */}
          <ScoreBar score={score} showValue={false} />

          {/* ── Targets ── */}
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { label: 'T1', value: analysis.trading_plan.target_1, color: 'text-brand-cyan' },
              { label: 'T2', value: analysis.trading_plan.target_2, color: 'text-brand-blue' },
              { label: 'Stop', value: analysis.trading_plan.stop_loss, color: 'text-rose-400' },
            ] as const).map(({ label, value, color }) => (
              <div
                key={label}
                className="
  flex flex-col gap-1.5 p-3 rounded-lg
  bg-gray-50 border border-gray-200
  dark:bg-surface-800/50 dark:border-surface-800
  transition-all duration-200
  group-hover:border-gray-300 dark:group-hover:border-surface-700
"
              >
                <span className="text-[11px] text-surface-500 uppercase tracking-wider font-medium">{label}</span>
                <span className={cn('text-xs font-mono font-bold tabular-nums leading-none', color)}>
                  {value === 'N/A' || !value ? '—' : `₹${value}`}
                </span>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-surface-800">
            <GradeBadge grade={analysis.investment_grade} showFull />
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 dark:text-surface-600 font-mono tabular-nums">
                {timeAgo(analysis.analysis_timestamp)}
              </span>
              {/* Watchlist toggle — stopPropagation prevents Link navigation */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (watched) removeFromWatchlist(analysis.symbol) // FIXED: ternary-as-statement flagged by no-unused-expressions; converted to if/else
                  else addToWatchlist(analysis.symbol)
                }}
                aria-label={watched ? 'Remove from watchlist' : 'Save to watchlist'}
                className={cn(
                  'flex items-center justify-center w-7 h-7 hover:scale-105 active:scale-95 rounded-md border transition-all duration-150',
                  watched
                    ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan'
                    : 'bg-transparent border-gray-200 dark:border-surface-700 text-gray-400 dark:text-surface-600 hover:border-gray-400 dark:hover:border-surface-500 hover:text-gray-600 dark:hover:text-surface-300'
                )}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 1.5h6a.5.5 0 01.5.5v6.8l-3.5-1.8-3.5 1.8V2a.5.5 0 01.5-.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

// ─────────────────────────────────────────────
//  STOCK TABLE ROW — compact list view
// ─────────────────────────────────────────────
interface StockRowProps {
  analysis: StockAnalysis
  rank?: number
}

// PERF: memo + prefetch={false} — same rationale as StockCard above
export const StockRow = memo(function StockRow({ analysis, rank }: StockRowProps) {
  const signal = classifySignal(analysis.trading_plan.signal)
  const score = analysis.overall_score
  const scoreColor = score >= 70 ? 'text-brand-cyan' : score >= 50 ? 'text-brand-blue' : 'text-surface-400'

  return (
    <Link
      href={`/stocks/${analysis.symbol}`}
      prefetch={false}
      className="relative flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800/50 last:border-b-0 group hover:bg-gray-50 dark:hover:bg-surface-800/30 transition-all duration-150"
    >
      {/* Left accent line on hover — signals interactivity */}
      <div className="absolute left-0 inset-y-0 w-0.5 bg-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-r" />

      {rank && (
        <span className="text-xs font-mono text-surface-600 w-5 text-right shrink-0">{rank}</span>
      )}

      {/* Symbol + name */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="font-display font-bold text-sm text-surface-900 dark:text-white tracking-tight">{analysis.symbol}</span>
        <span className="text-xs text-surface-500 truncate">{analysis.company_name}</span>
      </div>

      {/* Price */}
      <span className="font-mono text-sm text-surface-900 dark:text-white tabular-nums shrink-0 hidden sm:block">
        {formatINR(analysis.current_price, 0)}
      </span>

      {/* Score bar + color-coded number */}
      <div className="w-28 shrink-0 hidden md:flex items-center gap-2">
        <ScoreBar score={score} size="sm" showValue={false} className="flex-1" />
        <span className={cn('cursor-pointer font-mono text-xs tabular-nums font-semibold w-6 text-right shrink-0', scoreColor)}>
          {score}
        </span>
      </div>

      {/* Signal */}
      <SignalBadge strength={signal} showDot={false} className="shrink-0 hidden lg:inline-flex" />

      {/* Return */}
      <Change value={analysis.potential_return} size="xs" className="shrink-0 w-16 justify-end" />

      {/* Chevron — animates on hover */}
      <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round"
        className="text-surface-700 shrink-0 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all duration-150"
      >
        <path d="M4.5 2l4 4-4 4" />
      </svg>
    </Link>
  )
})
