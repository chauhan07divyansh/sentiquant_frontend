'use client'

import { AIDisclosureNote } from '@/components/common/AIDisclosureNote'
import { cn } from '@/lib/utils/cn'

/**
 * Track Record — SentiQuant's honest performance ledger (the monitoring surface).
 *
 * Design intent: a credibility ledger, not a hype chart. Every portfolio run vs
 * the Nifty 50, tagged with the market it faced, wins AND losses both.
 *
 * Alpha is ALWAYS computed live (portfolio - nifty), never read from source, so a
 * typo in the data can never render a contradictory number. Paper-traded label is
 * structural. Losses (Jan 14, Jul 22) are shown, not hidden — that's what makes the
 * wins credible to a skeptic.
 *
 * Replace CYCLES with a fetch from your backend once daily snapshots are stored.
 */

type Regime = 'up' | 'flat' | 'down'

interface Cycle {
  id: string
  label: string
  regime: Regime
  portfolioPct: number
  niftyPct: number
}

// Source of truth = portfolioPct & niftyPct. Alpha is derived. Verify these two
// columns against records. Jul 22 is an honest underperformance in a rally — keep it.
const CYCLES: Cycle[] = [
  { id: 'jan14', label: 'Jan 14',             regime: 'down', portfolioPct: -1.52, niftyPct: -1.26 },
  { id: 'p5',    label: 'P5 · Feb 4–23',      regime: 'down', portfolioPct:  0.66, niftyPct: -1.25 },
  { id: 'p1',    label: 'P1 · Apr 7–25',      regime: 'up',   portfolioPct:  9.59, niftyPct:  4.50 },
  { id: 'p2',    label: 'P2 · Apr 27–May 18', regime: 'flat', portfolioPct: -0.93, niftyPct: -1.84 },
  { id: 'p3',    label: 'P3 · May 26–Jun 5',  regime: 'down', portfolioPct: -1.24, niftyPct: -2.30 },
  { id: 'p6',    label: 'P6 · May 25–Jun 5',  regime: 'down', portfolioPct: -2.47, niftyPct: -3.31 },
  { id: 'p8',    label: 'P8 · Jun 15',        regime: 'flat', portfolioPct:  0.90, niftyPct:  0.05 },
  { id: 'jul7',  label: 'Jul 7',              regime: 'flat', portfolioPct:  0.28, niftyPct: -0.90 },
  { id: 'jul8',  label: 'Jul 8',              regime: 'flat', portfolioPct:  1.86, niftyPct: -0.05 },
  { id: 'jul22', label: 'Jul 22',             regime: 'up',   portfolioPct: -1.05, niftyPct:  1.74 },
  { id: 'jul29', label: 'Jul 29',             regime: 'up',   portfolioPct:  3.30, niftyPct:  0.91 },
  { id: 'aug10', label: 'Aug 10',             regime: 'down', portfolioPct: -0.50, niftyPct: -1.35 },
]

const REGIME_LABEL: Record<Regime, string> = {
  up:   'Rising market',
  flat: 'Choppy market',
  down: 'Falling market',
}

const fmt = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`

export default function TrackRecord() {
  const rows = CYCLES.map((c) => {
    const alpha = +(c.portfolioPct - c.niftyPct).toFixed(2)
    return { ...c, alpha, beat: alpha > 0.005 }
  })

  const n = rows.length
  const beats = rows.filter((r) => r.beat).length
  const avgAlpha = rows.reduce((s, r) => s + r.alpha, 0) / n
  const down = rows.filter((r) => r.regime === 'down')
  const beatsDown = down.filter((r) => r.beat).length
  const maxAbsAlpha = Math.max(...rows.map((r) => Math.abs(r.alpha)), 1)

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-widest">Track record</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05]">
          The record, kept <span className="text-gradient">honestly</span>
        </h1>
        <p className="text-sm text-surface-400 mt-1 max-w-xl leading-relaxed">
          Every portfolio we&apos;ve run, versus the Nifty 50, in the market it actually faced.
          Wins and losses both. Judge it over time — that&apos;s the only fair way.
        </p>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={`${beats}/${n}`} label="beat the Nifty" />
        <StatCard value={fmt(avgAlpha)} label="average alpha" tone={avgAlpha > 0 ? 'pos' : 'neg'} />
        <StatCard value={`${beatsDown}/${down.length}`} label="beat it in falling markets" />
      </div>

      {/* ── Ledger ── */}
      <div className="rounded-2xl bg-white dark:bg-surface-900/80 border border-gray-100 dark:border-surface-800 shadow-sm dark:shadow-none overflow-hidden">
        {/* header row */}
        <div className="hidden sm:flex items-center px-5 py-3 border-b border-gray-100 dark:border-surface-800 text-[11px] uppercase tracking-wide text-surface-500">
          <span className="flex-[0_0_120px]">Cycle</span>
          <span className="flex-[0_0_120px]">Market</span>
          <span className="flex-1 text-right">Portfolio</span>
          <span className="flex-1 text-right">Nifty 50</span>
          <span className="flex-[0_0_150px] text-right">Alpha</span>
        </div>

        {rows.map((r) => {
          const barW = (Math.abs(r.alpha) / maxAbsAlpha) * 100
          return (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center px-5 py-4 border-b border-gray-50 dark:border-surface-800/60 last:border-0"
            >
              {/* label + market (stacked on mobile) */}
              <div className="flex items-center justify-between sm:flex-[0_0_120px] mb-2 sm:mb-0">
                <span className="font-sans font-semibold text-sm text-surface-900 dark:text-white">{r.label}</span>
              </div>
              <div className="flex items-center gap-2 sm:flex-[0_0_120px] mb-2 sm:mb-0">
                <span className={cn('w-2 h-2 rounded-full', regimeDot(r.regime))} />
                <span className="text-[13px] text-surface-500 dark:text-surface-400">{REGIME_LABEL[r.regime]}</span>
              </div>

              <div className="flex items-center justify-between sm:contents">
                <span className={cn(
                  'font-display font-semibold text-sm tabular-nums sm:flex-1 sm:text-right',
                  r.portfolioPct >= 0 ? 'text-emerald-500' : 'text-rose-400'
                )}>
                  <span className="sm:hidden text-[11px] text-surface-500 mr-2">Portfolio</span>{fmt(r.portfolioPct)}
                </span>
                <span className="font-display text-sm tabular-nums text-surface-400 sm:flex-1 sm:text-right">
                  <span className="sm:hidden text-[11px] text-surface-500 mr-2">Nifty</span>{fmt(r.niftyPct)}
                </span>
              </div>

              {/* alpha with bar */}
              <div className="flex items-center justify-end gap-2.5 mt-2 sm:mt-0 sm:flex-[0_0_150px]">
                <span
                  className={cn('h-1.5 rounded-full opacity-50', r.beat ? 'bg-emerald-500' : 'bg-rose-400')}
                  style={{ width: `${barW}%` }}
                />
                <span className={cn(
                  'font-display font-bold text-sm tabular-nums min-w-[62px] text-right',
                  r.beat ? 'text-emerald-500' : 'text-rose-400'
                )}>
                  {fmt(r.alpha)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Character note — honest framing ── */}
      <p className="text-[13px] text-surface-500 dark:text-surface-400 leading-relaxed max-w-xl">
        The pattern so far: strong protection when the market falls, and it can lag a fast rally
        (see Jul 22). That&apos;s the trade-off of a stop-driven strategy — it aims to lose less,
        not to win every cycle.
      </p>

      {/* ── Honesty block ── */}
      <div className="flex items-start gap-3 pt-4 border-t border-gray-100 dark:border-surface-800 flex-wrap">
        <span className="text-[10px] font-semibold text-rose-400 border border-rose-400/40 rounded px-2 py-0.5 tracking-wide">
          PAPER-TRADED
        </span>
        <span className="text-[11px] text-surface-500 leading-relaxed flex-1 min-w-[240px]">
          These are paper-traded results, not live money. Alpha is computed as portfolio return minus
          Nifty 50 return for each cycle. Past performance is not indicative of future results.
        </span>
        <AIDisclosureNote variant="inline" className="text-[10px] text-rose-400/70" />
      </div>

    </div>
  )
}

function StatCard({ value, label, tone }: { value: string; label: string; tone?: 'pos' | 'neg' }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-surface-900/80 border border-gray-100 dark:border-surface-800 shadow-sm dark:shadow-none">
      <p className={cn(
        'font-display font-bold text-2xl leading-none tabular-nums',
        tone === 'pos' ? 'text-emerald-500' : tone === 'neg' ? 'text-rose-400' : 'text-surface-900 dark:text-white'
      )}>
        {value}
      </p>
      <p className="text-[11px] text-surface-500 uppercase tracking-wide leading-tight">{label}</p>
    </div>
  )
}

function regimeDot(regime: Regime): string {
  if (regime === 'up') return 'bg-emerald-500'
  if (regime === 'down') return 'bg-rose-400'
  return 'bg-amber-400'
}
