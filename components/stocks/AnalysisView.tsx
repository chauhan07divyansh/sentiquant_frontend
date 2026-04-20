'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { ScoreBar, Change } from '@/components/ui/DataDisplay'
import { SignalBadge, GradeBadge, SystemBadge } from '@/components/ui/Badge'
import { classifySignal } from '@/types/stock.types'
import {
  formatINR, formatNumber, timeAgo,
  signalLabel, signalBg, signalColor,
} from '@/lib/utils/formatters'
import { useWatchlistStore } from '@/store'
import type { StockAnalysis } from '@/types/stock.types'

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function parsePrice(str: string): number | null {
  if (!str || str.trim() === 'N/A' || str.trim() === '') return null
  const m = str.replace(/,/g, '').match(/\d+\.?\d*/)
  return m ? parseFloat(m[0]) : null
}

function scoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-green-400'
  if (score >= 65) return 'from-brand-cyan to-brand-blue'
  if (score >= 50) return 'from-amber-400 to-orange-400'
  return 'from-rose-500 to-pink-400'
}

// ─────────────────────────────────────────────
//  COLLAPSIBLE SECTION
// ─────────────────────────────────────────────
function Section({
  title, icon, children, defaultOpen = false,
}: {
  title: string; icon: ReactNode; children: ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-surface-800/40 transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-brand-cyan shrink-0">{icon}</span>
          <span className="font-semibold text-sm text-surface-900 dark:text-white">{title}</span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round"
          className={cn('text-surface-500 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 dark:border-surface-800 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  KEY-VALUE TABLE  (technicals / fundamentals / sentiment)
// ─────────────────────────────────────────────
function KVTable({ rows }: { rows: Array<[string, string | number]> }) {
  if (rows.length === 0) return <p className="text-xs text-surface-500">No data available.</p>
  const fmt = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-surface-800">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between py-2.5">
          <span className="text-xs text-surface-500">{fmt(k)}</span>
          <span className="font-mono text-xs font-medium text-surface-900 dark:text-white tabular-nums">
            {typeof v === 'number' ? formatNumber(v, 2) : String(v)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  LEVEL CARD  — Entry / Target / Stop Loss
// ─────────────────────────────────────────────
interface LevelCardProps {
  type:     'entry' | 'target' | 'stop'
  price:    number | null
  rawLabel: string
  badge:    { label: string; value: number | null } | null
}

const LEVEL_META = {
  entry: {
    border: 'border-gray-200 dark:border-surface-800',
    glow:   'from-brand-blue/8 to-transparent',
    icon:   (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-blue">
        <path d="M2 10L5.5 6 8 8.5 12 4" /><path d="M9.5 4h2.5v2.5" />
      </svg>
    ),
    iconBg:  'bg-brand-blue/10 border-brand-blue/20',
    title:   'Entry Price',
    sub:     'Buy at or below',
    priceColor: 'text-surface-900 dark:text-white',
  },
  target: {
    border: 'border-emerald-500/25',
    glow:   'from-emerald-500/8 to-transparent',
    icon:   (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-400">
        <circle cx="7" cy="7" r="5.5" /><circle cx="7" cy="7" r="2.5" />
        <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2" />
      </svg>
    ),
    iconBg:  'bg-emerald-500/10 border-emerald-500/20',
    title:   'Target Price',
    sub:     'Profit objective',
    priceColor: 'text-emerald-400',
  },
  stop: {
    border: 'border-rose-500/25',
    glow:   'from-rose-500/8 to-transparent',
    icon:   (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-rose-400">
        <path d="M7 2v5M7 9v.5" /><circle cx="7" cy="7" r="5.5" />
      </svg>
    ),
    iconBg:  'bg-rose-500/10 border-rose-500/20',
    title:   'Stop Loss',
    sub:     'Exit if below',
    priceColor: 'text-rose-400',
  },
} as const

function LevelCard({ type, price, rawLabel, badge }: LevelCardProps) {
  const m = LEVEL_META[type]
  return (
    <div className={cn('relative overflow-hidden rounded-xl border bg-white dark:bg-surface-900 p-4 sm:p-5', m.border)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br pointer-events-none', m.glow)} />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', m.iconBg)}>
            {m.icon}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">{m.title}</p>
            <p className="text-[11px] text-surface-600">{m.sub}</p>
          </div>
        </div>
        <div>
          {price != null ? (
            <>
              <p className={cn('font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none', m.priceColor)}>
                {formatINR(price, 0)}
              </p>
              {badge && badge.value != null && (
                <div className={cn(
                  'inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-xs font-medium',
                  badge.value >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
                )}>
                  {badge.value >= 0 ? '+' : ''}{badge.value.toFixed(2)}% {badge.label}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-surface-400 leading-snug">{rawLabel}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MAIN ANALYSIS VIEW
// ─────────────────────────────────────────────
export function AnalysisView({ analysis }: { analysis: StockAnalysis }) {
  const signal   = classifySignal(analysis.trading_plan.signal)
  const scoreGrad = scoreGradient(analysis.overall_score)

  const { addToWatchlist, removeFromWatchlist, isWatched } = useWatchlistStore()
  const watched = isWatched(analysis.symbol)
  const [shareToast, setShareToast] = useState(false)

  // Parse prices from trading plan strings
  const entryNum = parsePrice(analysis.trading_plan.entry_price)
  const stopNum  = parsePrice(analysis.trading_plan.stop_loss)
  const targetNum = analysis.target_price

  // Percentage calculations relative to entry (or current_price fallback)
  const base          = entryNum ?? analysis.current_price
  const entryVsCurrent = entryNum != null
    ? ((entryNum - analysis.current_price) / analysis.current_price) * 100
    : null
  const targetGainPct = ((targetNum - base) / base) * 100
  const stopLossPct   = stopNum != null ? ((stopNum - base) / base) * 100 : null
  const rrRatio       = stopLossPct != null && stopLossPct !== 0
    ? Math.abs(targetGainPct / stopLossPct)
    : null

  const handleShare = async () => {
    const text = `${analysis.symbol} — AI Score: ${analysis.overall_score}/100 | ${analysis.trading_plan.signal} | Target: ${formatINR(targetNum, 0)} | SentiQuant`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${analysis.symbol} Analysis`, text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      }
    } catch { /* user cancelled */ }
  }

  const techRows = Object.entries(analysis.technical_indicators)
    .filter(([, v]) => v != null) as Array<[string, string | number]>
  const fundRows = Object.entries(analysis.fundamentals)
    .filter(([, v]) => v != null && v !== '') as Array<[string, string | number]>
  const sentRows = Object.entries(analysis.sentiment)
    .filter(([, v]) => v != null) as Array<[string, string | number]>

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── 1. Current price hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-cyan/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Current Price</span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white tabular-nums leading-none">
                {formatINR(analysis.current_price, 0)}
              </span>
              <Change value={analysis.potential_return} size="md" />
            </div>
            <p className="text-xs text-surface-500">
              {analysis.time_horizon} · {analysis.system_type} system
            </p>
          </div>
          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-wrap">
            <GradeBadge grade={analysis.investment_grade} showFull />
            <SignalBadge strength={signal} className="text-sm px-3 py-1.5" />
          </div>
        </div>
      </div>

      {/* ── 2. AI Score + Recommendation ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Score */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-[0.04] pointer-events-none', scoreGrad)} />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-brand-cyan shrink-0">
                <path d="M7.5 1.5l1.6 3.3 3.6.52-2.6 2.54.61 3.54L7.5 9.6l-3.21 1.8.61-3.54L2.3 5.32l3.6-.52z" />
              </svg>
              <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">AI Score</span>
            </div>
            <div className="flex items-baseline gap-2 leading-none">
              <span className={cn('font-display text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent tabular-nums', scoreGrad)}>
                {analysis.overall_score}
              </span>
              <span className="text-xl text-surface-500 font-normal">/100</span>
            </div>
            <ScoreBar score={analysis.overall_score} showValue={false} />
            <GradeBadge grade={analysis.investment_grade} showFull className="self-start" />
          </div>
        </div>

        {/* Recommendation */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-brand-cyan shrink-0">
                <circle cx="7.5" cy="7.5" r="6" /><path d="M7.5 5v4.5M7.5 11v.5" />
              </svg>
              <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Recommendation</span>
            </div>

            {/* Big signal pill */}
            <div className={cn(
              'flex items-center justify-center px-6 py-4 rounded-xl border text-center',
              signalBg(signal)
            )}>
              <span className={cn('font-display text-2xl font-bold tracking-wide', signalColor(signal))}>
                {signalLabel(signal).toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-surface-400 leading-relaxed line-clamp-3 flex-1">
              {analysis.trading_plan.strategy}
            </p>

            <SystemBadge type={analysis.system_type} className="self-start" />
          </div>
        </div>
      </div>

      {/* ── 3. Trading levels ── */}
      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
            <path d="M2 10h10M2 7h7M2 4h4" />
          </svg>
          Trading Levels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <LevelCard
            type="entry"
            price={entryNum}
            rawLabel={analysis.trading_plan.entry_price}
            badge={entryVsCurrent != null ? { label: 'vs current', value: entryVsCurrent } : null}
          />
          <LevelCard
            type="target"
            price={targetNum}
            rawLabel="—"
            badge={{ label: 'potential gain', value: targetGainPct }}
          />
          <LevelCard
            type="stop"
            price={stopNum}
            rawLabel={analysis.trading_plan.stop_loss === 'N/A' ? 'Use trailing stop' : analysis.trading_plan.stop_loss}
            badge={stopLossPct != null ? { label: 'max loss', value: stopLossPct } : null}
          />
        </div>

        {/* Extended targets row */}
        {([analysis.trading_plan.target_2, analysis.trading_plan.target_3] as string[])
          .some(t => t && t !== 'N/A') && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Extended targets:</span>
            {(['target_2', 'target_3'] as const).map((k, i) => {
              const t = analysis.trading_plan[k]
              return t && t !== 'N/A' ? (
                <span key={k} className="text-xs font-mono font-medium text-emerald-400 bg-emerald-400/8 border border-emerald-400/20 px-2 py-0.5 rounded">
                  T{i + 2}: ₹{t}
                </span>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* ── 4. Risk-Reward ── */}
      {rrRatio != null && stopLossPct != null && (
        <div className="rounded-xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
          <h3 className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-4">
            Risk-Reward Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-surface-500">Potential Gain</p>
              <p className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                +{targetGainPct.toFixed(2)}%
              </p>
              {entryNum != null && (
                <p className="text-xs text-surface-500 mt-0.5">
                  {formatINR(targetNum - entryNum, 0)} per share
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-surface-500">Max Loss</p>
              <p className="font-mono text-2xl font-bold text-rose-400 tabular-nums">
                {stopLossPct.toFixed(2)}%
              </p>
              {entryNum != null && stopNum != null && (
                <p className="text-xs text-surface-500 mt-0.5">
                  {formatINR(Math.abs(stopNum - entryNum), 0)} per share
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-surface-500">Risk:Reward Ratio</p>
              <p className="font-mono text-2xl font-bold text-surface-900 dark:text-white tabular-nums">
                1:{rrRatio.toFixed(2)}
              </p>
              <p className={cn('text-xs mt-0.5', rrRatio >= 3 ? 'text-emerald-400' : rrRatio >= 2 ? 'text-brand-cyan' : 'text-amber-400')}>
                {rrRatio >= 3 ? 'Excellent ratio' : rrRatio >= 2 ? 'Favorable' : 'Consider carefully'}
              </p>
            </div>
          </div>

          {/* Visual risk-reward bar */}
          <div className="flex items-center gap-0 rounded-full overflow-hidden h-2">
            <div
              className="h-full bg-rose-400/60 rounded-l-full"
              style={{ width: `${Math.abs(stopLossPct) / (targetGainPct + Math.abs(stopLossPct)) * 100}%` }}
            />
            <div className="w-0.5 h-full bg-surface-950 dark:bg-surface-950 shrink-0" />
            <div
              className="h-full bg-emerald-400/60 rounded-r-full"
              style={{ width: `${targetGainPct / (targetGainPct + Math.abs(stopLossPct)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-rose-400/70">Stop loss</span>
            <span className="text-[10px] text-emerald-400/70">Target</span>
          </div>
        </div>
      )}

      {/* ── 5. Action buttons ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => watched ? removeFromWatchlist(analysis.symbol) : addToWatchlist(analysis.symbol)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150',
            watched
              ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan hover:bg-rose-400/10 hover:border-rose-400/30 hover:text-rose-400'
              : 'border-gray-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-brand-cyan/10 hover:border-brand-cyan/30 hover:text-brand-cyan'
          )}
        >
          <svg
            width="13" height="13" viewBox="0 0 13 13"
            fill={watched ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          >
            <path d="M6.5 1.2l1.5 3.1 3.4.5-2.45 2.4.58 3.38L6.5 9.1 3.97 10.58l.58-3.38L2.1 4.8l3.4-.5z" />
          </svg>
          {watched ? 'In Watchlist' : 'Add to Watchlist'}
        </button>

        <button
          onClick={handleShare}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-800/20 text-sm font-medium transition-all duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="10.5" cy="2.5" r="1.5" /><circle cx="2.5" cy="6.5" r="1.5" /><circle cx="10.5" cy="10.5" r="1.5" />
            <path d="M4 5.8l5-2.5M4 7.2l5 2.5" />
          </svg>
          {shareToast ? 'Link copied!' : 'Share'}
        </button>
      </div>

      {/* ── 6. Trailing stop advice ── */}
      {analysis.trading_plan.trailing_stop_advice && (
        <p className="text-xs text-surface-400 leading-relaxed border-l-2 border-brand-blue/30 pl-3">
          <span className="font-semibold text-surface-500">Trailing stop:</span>{' '}
          {analysis.trading_plan.trailing_stop_advice}
        </p>
      )}

      {/* ── 7. Detail sections ── */}
      <div className="flex flex-col gap-3">
        <Section
          title="Technical Indicators"
          defaultOpen
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 10L5.5 6 8 8.5 12 4" />
            </svg>
          }
        >
          <KVTable rows={techRows} />
        </Section>

        <Section
          title="Fundamentals"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="2" width="10" height="10" rx="1.5" />
              <path d="M5 7h4M5 5h4M5 9h2" />
            </svg>
          }
        >
          <KVTable rows={fundRows} />
        </Section>

        <Section
          title="Sentiment"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5.5" />
              <path d="M4.5 8.5s.75 1.5 2.5 1.5 2.5-1.5 2.5-1.5M5 5.5v.5M9 5.5v.5" />
            </svg>
          }
        >
          <KVTable rows={sentRows} />
        </Section>
      </div>

      {/* ── 8. Disclaimer ── */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-surface-400 leading-relaxed">
          <span className="font-semibold text-amber-400">Disclaimer:</span> This analysis is AI-generated for informational purposes only and does not constitute financial advice. Conduct your own research and consult a qualified financial advisor before making investment decisions.
        </p>
      </div>

      {/* ── 9. Timestamp ── */}
      <p className="text-xs text-surface-600 text-right">
        Analysis generated {timeAgo(analysis.analysis_timestamp)}
      </p>
    </div>
  )
}
