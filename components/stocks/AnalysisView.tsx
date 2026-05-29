'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { ScoreBar, Change } from '@/components/ui/DataDisplay'
import { SignalBadge, GradeBadge, SystemBadge } from '@/components/ui/Badge'
import { classifySignal } from '@/types/stock.types'
import {
  formatNumber, timeAgo,
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
function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  return 'Weak'
}
function fmtPrice(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─────────────────────────────────────────────
//  REASONING ENGINE
//  Converts raw technical data into plain-English bullets
// ─────────────────────────────────────────────
interface ReasoningPoint {
  label: string
  text: string
  status: 'bullish' | 'bearish' | 'neutral'
}

function buildReasoning(analysis: StockAnalysis): ReasoningPoint[] {
  const points: ReasoningPoint[] = []
  const tech = analysis.technical_indicators ?? {}
  const sent = analysis.sentiment ?? {}

  // ── RSI ──
  const rsi = tech['rsi'] ?? tech['RSI'] ?? null
  if (rsi != null && typeof rsi === 'number') {
    if (rsi < 30) {
      points.push({ label: 'RSI', text: `RSI at ${rsi.toFixed(1)} — deeply oversold. Historically strong bounce zone.`, status: 'bullish' })
    } else if (rsi < 45) {
      points.push({ label: 'RSI', text: `RSI at ${rsi.toFixed(1)} — oversold territory. Good entry conditions building.`, status: 'bullish' })
    } else if (rsi > 75) {
      points.push({ label: 'RSI', text: `RSI at ${rsi.toFixed(1)} — overbought. Momentum may be running out soon.`, status: 'bearish' })
    } else if (rsi > 60) {
      points.push({ label: 'RSI', text: `RSI at ${rsi.toFixed(1)} — elevated but not extreme. Trend is strong.`, status: 'neutral' })
    } else {
      points.push({ label: 'RSI', text: `RSI at ${rsi.toFixed(1)} — neutral zone. No strong directional signal from momentum.`, status: 'neutral' })
    }
  }

  // ── MACD ──
  const macdLine = tech['MACD Line'] ?? tech['macd_line'] ?? null
  const macdSignal = tech['MACD Signal'] ?? tech['macd_signal'] ?? null
  const macdHist = tech['MACD Histogram'] ?? tech['macd_histogram'] ?? null
  if (macdLine != null && macdSignal != null) {
    const crossedAbove = Number(macdLine) > Number(macdSignal)
    const histGrowing = macdHist != null && Number(macdHist) > 0
    if (crossedAbove && histGrowing) {
      points.push({ label: 'MACD', text: `MACD line above signal line with growing histogram — momentum is accelerating upward.`, status: 'bullish' })
    } else if (crossedAbove) {
      points.push({ label: 'MACD', text: `MACD line above signal line — bullish crossover, but momentum is slowing.`, status: 'neutral' })
    } else if (!crossedAbove && !histGrowing) {
      points.push({ label: 'MACD', text: `MACD below signal line with negative histogram — downward momentum is in play.`, status: 'bearish' })
    } else {
      points.push({ label: 'MACD', text: `MACD below signal line — bearish crossover but momentum may be stabilizing.`, status: 'neutral' })
    }
  }

  // ── Bollinger Bands ──
  const bbUpper = tech['Bollinger Upper'] ?? tech['bollinger_bands_upper'] ?? null
  const bbLower = tech['Bollinger Lower'] ?? tech['bollinger_bands_lower'] ?? null
  const price = analysis.current_price
  if (bbUpper != null && bbLower != null && price) {
    const range = Number(bbUpper) - Number(bbLower)
    const position = range > 0 ? (price - Number(bbLower)) / range : 0.5
    if (position < 0.2) {
      points.push({ label: 'Bollinger', text: `Price near lower Bollinger Band — oversold relative to recent range. Room to move up.`, status: 'bullish' })
    } else if (position > 0.8) {
      points.push({ label: 'Bollinger', text: `Price near upper Bollinger Band — extended relative to recent range. Limited upside room.`, status: 'bearish' })
    } else {
      points.push({ label: 'Bollinger', text: `Price in middle of Bollinger Bands — neither stretched nor compressed. Wait for clearer move.`, status: 'neutral' })
    }
  }

  // ── Stochastic ──
  const stochK = tech['Stochastic K'] ?? tech['stochastic_k'] ?? null
  if (stochK != null && typeof stochK === 'number') {
    if (stochK < 20) {
      points.push({ label: 'Stochastic', text: `Stochastic at ${stochK.toFixed(1)} — oversold. Short-term reversal signals possible.`, status: 'bullish' })
    } else if (stochK > 80) {
      points.push({ label: 'Stochastic', text: `Stochastic at ${stochK.toFixed(1)} — overbought. Short-term pullback risk is elevated.`, status: 'bearish' })
    }
  }

  // ── Support / Resistance ──
  const support = tech['S/R Support'] ?? tech['support_resistance_support'] ?? null
  const resistance = tech['S/R Resistance'] ?? tech['support_resistance_resistance'] ?? null
  if (support != null && resistance != null && price) {
    const distToSupport = ((price - Number(support)) / price * 100).toFixed(1)
    const distToResistance = ((Number(resistance) - price) / price * 100).toFixed(1)
    points.push({
      label: 'Support / Resistance',
      text: `Support at ₹${Number(support).toFixed(0)} (${distToSupport}% below). Resistance at ₹${Number(resistance).toFixed(0)} (${distToResistance}% above).`,
      status: Number(distToSupport) < Number(distToResistance) ? 'bullish' : 'neutral'
    })
  }

  // ── Sentiment ──
  const sentSummary = sent['summary'] as { positive?: number; negative?: number; neutral?: number } | null
  if (sentSummary && typeof sentSummary === 'object') {
    const pos = sentSummary.positive ?? 0
    const neg = sentSummary.negative ?? 0
    const total = pos + neg + (sentSummary.neutral ?? 0)
    if (total > 0) {
      const posPct = Math.round((pos / total) * 100)
      if (posPct >= 70) {
        points.push({ label: 'News Sentiment', text: `${pos} of ${total} recent news articles are positive (${posPct}%). Market mood is supportive.`, status: 'bullish' })
      } else if (posPct <= 30) {
        points.push({ label: 'News Sentiment', text: `${neg} of ${total} recent articles are negative (${100 - posPct}%). Market mood is cautious.`, status: 'bearish' })
      } else {
        points.push({ label: 'News Sentiment', text: `Mixed sentiment — ${pos} positive, ${neg} negative out of ${total} articles. No clear news catalyst.`, status: 'neutral' })
      }
    }
  }

  // ── Risk / Volatility ──
  const atr = tech['Risk Atr'] ?? tech['risk_metrics_atr'] ?? null
  const riskLevel = tech['Risk Risk Level'] ?? tech['risk_metrics_risk_level'] ?? null
  if (riskLevel) {
    const lvl = String(riskLevel).toUpperCase()
    if (lvl === 'LOW') {
      points.push({ label: 'Volatility', text: `Low volatility stock — steady mover. Easier to hold through minor pullbacks.`, status: 'bullish' })
    } else if (lvl === 'HIGH') {
      points.push({ label: 'Volatility', text: `High volatility stock — moves sharply. Use strict stop loss and smaller position size.`, status: 'bearish' })
    } else {
      points.push({ label: 'Volatility', text: `Moderate volatility. Normal position sizing applies.`, status: 'neutral' })
    }
  } else if (atr != null && price) {
    const atrPct = (Number(atr) / price) * 100
    if (atrPct > 3) {
      points.push({ label: 'Volatility', text: `ATR at ${atrPct.toFixed(1)}% of price — high daily swings. Be prepared for choppy movement.`, status: 'bearish' })
    } else if (atrPct < 1) {
      points.push({ label: 'Volatility', text: `ATR at ${atrPct.toFixed(1)}% of price — low daily swings. Stable, steady mover.`, status: 'bullish' })
    }
  }

  return points
}

// ─────────────────────────────────────────────
//  REASONING SECTION COMPONENT
// ─────────────────────────────────────────────
function ReasoningSection({ analysis }: { analysis: StockAnalysis }) {
  const signal = classifySignal(analysis.trading_plan.signal)
  const points = buildReasoning(analysis)
  if (points.length === 0) return null

  const bullish = points.filter(p => p.status === 'bullish').length
  const bearish = points.filter(p => p.status === 'bearish').length

  const statusIcon = (status: ReasoningPoint['status']) => {
    if (status === 'bullish') return (
      <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5l2 2 4-4" />
        </svg>
      </div>
    )
    if (status === 'bearish') return (
      <div className="w-5 h-5 rounded-full bg-rose-400/15 border border-rose-400/30 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </div>
    )
    return (
      <div className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-surface-800 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
              <circle cx="7" cy="7" r="5.5" /><path d="M7 4v4M7 9.5v.5" />
            </svg>
            <span className="font-semibold text-sm text-surface-900 dark:text-white">Why this signal?</span>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            {points.length} data points analyzed · {bullish} bullish · {bearish} bearish
          </p>
        </div>
        {/* Signal summary pill */}
        <div className={cn(
          'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
          signal === 'buy'
            ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
            : signal === 'sell' || signal === 'avoid'
            ? 'bg-rose-400/10 border-rose-400/20 text-rose-400'
            : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
        )}>
          <span>{bullish}↑</span>
          <span className="opacity-40">·</span>
          <span>{bearish}↓</span>
        </div>
      </div>

      {/* Reasoning points */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {points.map((point, i) => (
          <div key={i} className="flex items-start gap-3">
            {statusIcon(point.status)}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-widest',
                point.status === 'bullish' ? 'text-emerald-400'
                : point.status === 'bearish' ? 'text-rose-400'
                : 'text-amber-400'
              )}>
                {point.label}
              </span>
              <span className="text-xs text-surface-400 leading-relaxed">{point.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary verdict */}
      <div className={cn(
        'mx-5 mb-4 px-4 py-3 rounded-xl border text-xs leading-relaxed',
        signal === 'buy'
          ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-300'
          : signal === 'sell' || signal === 'avoid'
          ? 'bg-rose-400/5 border-rose-400/20 text-rose-300'
          : 'bg-amber-400/5 border-amber-400/20 text-amber-300'
      )}>
        <span className="font-semibold">AI verdict: </span>
        {analysis.trading_plan.strategy || (
          bullish > bearish
            ? `${bullish} of ${points.length} indicators are bullish. Technical setup favors the current signal.`
            : bearish > bullish
            ? `${bearish} of ${points.length} indicators show caution. Risk is elevated at current levels.`
            : `Indicators are mixed. Wait for clearer confirmation before acting.`
        )}
      </div>
    </div>
  )
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-surface-800/40 transition-colors duration-150 text-left"
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
//  KEY-VALUE TABLE
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
//  MAIN ANALYSIS VIEW
// ─────────────────────────────────────────────
export function AnalysisView({ analysis }: { analysis: StockAnalysis }) {
  const signal    = classifySignal(analysis.trading_plan.signal)
  const scoreGrad = scoreGradient(analysis.overall_score)

  const { addToWatchlist, removeFromWatchlist, isWatched } = useWatchlistStore()
  const watched = isWatched(analysis.symbol)
  const [shareToast, setShareToast] = useState(false)

  const entryNum  = parsePrice(analysis.trading_plan.entry_price)
  const stopNum   = parsePrice(analysis.trading_plan.stop_loss)
  const targetNum = analysis.target_price
  const base      = entryNum ?? analysis.current_price

  const entryVsCurrent = entryNum != null
    ? ((entryNum - analysis.current_price) / analysis.current_price) * 100
    : null
  const targetGainPct = ((targetNum - base) / base) * 100
  const stopLossPct   = stopNum != null ? ((stopNum - base) / base) * 100 : null
  const rrRatio       = stopLossPct != null && stopLossPct !== 0
    ? Math.abs(targetGainPct / stopLossPct)
    : null

  const handleShare = async () => {
    const text = `${analysis.symbol} — AI Score: ${analysis.overall_score}/100 | ${analysis.trading_plan.signal} | Target: ${fmtPrice(targetNum)} | SentiQuant`
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

  const techRows = Object.entries(analysis.technical_indicators).filter(([, v]) => v != null) as Array<[string, string | number]>
  const fundRows = Object.entries(analysis.fundamentals).filter(([, v]) => v != null && v !== '') as Array<[string, string | number]>
  const sentRows = Object.entries(analysis.sentiment).filter(([, v]) => v != null) as Array<[string, string | number]>

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── 1. Hero — Price + Signal ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/6 via-transparent to-brand-cyan/6 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Current Price
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white tabular-nums leading-none">
                  {fmtPrice(analysis.current_price)}
                </span>
                <Change value={analysis.potential_return} size="md" />
              </div>
              <p className="text-xs text-surface-500 mt-1">
                {analysis.time_horizon} · {analysis.system_type} system
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-wrap">
              <GradeBadge grade={analysis.investment_grade} showFull />
              <SignalBadge strength={signal} className="text-sm px-3 py-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Score + AI Signal ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-[0.05] pointer-events-none', scoreGrad)} />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-brand-cyan">
                  <path d="M7 1.5l1.5 3 3.3.5-2.4 2.3.57 3.3L7 9l-2.97 1.6.57-3.3L2.2 5l3.3-.5z" />
                </svg>
                <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">AI Score</span>
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                analysis.overall_score >= 80 ? 'bg-emerald-400/10 text-emerald-400' :
                analysis.overall_score >= 65 ? 'bg-brand-cyan/10 text-brand-cyan' :
                analysis.overall_score >= 50 ? 'bg-amber-400/10 text-amber-400' :
                'bg-rose-400/10 text-rose-400'
              )}>
                {scoreLabel(analysis.overall_score)}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className={cn('font-display text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent tabular-nums', scoreGrad)}>
                {analysis.overall_score.toFixed(2)}
              </span>
              <span className="text-lg text-surface-500 font-normal">/100</span>
            </div>
            <ScoreBar score={analysis.overall_score} showValue={false} />
            <GradeBadge grade={analysis.investment_grade} showFull className="self-start" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-brand-cyan">
                <circle cx="7" cy="7" r="5.5" /><path d="M7 5v4M7 4v.5" />
              </svg>
              <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">AI Signal</span>
            </div>
            <div className={cn('flex items-center justify-center px-6 py-5 rounded-xl border', signalBg(signal))}>
              <span className={cn('font-display text-3xl font-bold tracking-wider', signalColor(signal))}>
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

      {/* ── 3. WHY THIS SIGNAL — Reasoning section ── */}
      <ReasoningSection analysis={analysis} />

      {/* ── 4. Technical Reference Levels ── */}
      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
            <path d="M2 10h10M2 7h7M2 4h4" />
          </svg>
          Technical Reference Levels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Entry */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/6 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-blue">
                    <path d="M1.5 8.5L4.5 5 6.5 7 10 3" /><path d="M8 3h2v2" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Watch Zone</p>
                  <p className="text-[10px] text-surface-600">Reference entry zone</p>
                </div>
              </div>
              {entryNum != null ? (
                <>
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white tabular-nums leading-none">{fmtPrice(entryNum)}</p>
                  {entryVsCurrent != null && (
                    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md w-fit',
                      entryVsCurrent >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400')}>
                      {entryVsCurrent >= 0 ? '+' : ''}{entryVsCurrent.toFixed(2)}% vs current
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-surface-400">{analysis.trading_plan.entry_price}</p>
              )}
            </div>
          </div>

          {/* Target */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-white dark:bg-surface-900 p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/6 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-400">
                    <circle cx="6" cy="6" r="4.5" /><circle cx="6" cy="6" r="2" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Upper Reference</p>
                  <p className="text-[10px] text-surface-600">Upper technical level</p>
                </div>
              </div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums leading-none">{fmtPrice(targetNum)}</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md w-fit bg-emerald-400/10 text-emerald-400">
                +{targetGainPct.toFixed(2)}% potential gain
              </span>
            </div>
          </div>

          {/* Stop */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-white dark:bg-surface-900 p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/6 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-rose-400">
                    <path d="M6 2v4M6 8v.5" /><circle cx="6" cy="6" r="4.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Risk Reference</p>
                  <p className="text-[10px] text-surface-600">Lower risk reference</p>
                </div>
              </div>
              {stopNum != null ? (
                <>
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-rose-400 tabular-nums leading-none">{fmtPrice(stopNum)}</p>
                  {stopLossPct != null && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md w-fit bg-rose-400/10 text-rose-400">
                      {stopLossPct.toFixed(2)}% max loss
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-surface-400">
                  {analysis.trading_plan.stop_loss === 'N/A' ? 'Use trailing stop' : analysis.trading_plan.stop_loss}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Extended targets */}
        {([analysis.trading_plan.target_2, analysis.trading_plan.target_3] as string[]).some(t => t && t !== 'N/A') && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Extended targets:</span>
            {(['target_2', 'target_3'] as const).map((k, i) => {
              const t = analysis.trading_plan[k]
              const tNum = t && t !== 'N/A' ? parsePrice(t) : null
              return tNum ? (
                <span key={k} className="text-xs font-mono font-medium text-emerald-400 bg-emerald-400/8 border border-emerald-400/20 px-2 py-0.5 rounded">
                  T{i + 2}: {fmtPrice(tNum)}
                </span>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* ── 5. Risk-Reward ── */}
      {rrRatio != null && stopLossPct != null && (
        <div className="rounded-2xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6">
          <h3 className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
              <path d="M1 6h10M6 1v10" />
            </svg>
            Risk-Reward Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Upside Reference</p>
              <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums leading-none">+{targetGainPct.toFixed(2)}%</p>
              {entryNum != null && <p className="text-[10px] text-surface-500">{fmtPrice(targetNum - entryNum)} per share</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Downside Reference</p>
              <p className="font-mono text-xl sm:text-2xl font-bold text-rose-400 tabular-nums leading-none">{stopLossPct.toFixed(2)}%</p>
              {entryNum != null && stopNum != null && <p className="text-[10px] text-surface-500">{fmtPrice(Math.abs(stopNum - entryNum))} per share</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Risk:Reward</p>
              <p className="font-mono text-xl sm:text-2xl font-bold text-surface-900 dark:text-white tabular-nums leading-none">1:{rrRatio.toFixed(2)}</p>
              <p className={cn('text-[10px] font-semibold', rrRatio >= 3 ? 'text-emerald-400' : rrRatio >= 2 ? 'text-brand-cyan' : 'text-amber-400')}>
                {rrRatio >= 3 ? '✦ Excellent' : rrRatio >= 2 ? '✓ Favorable' : '⚠ Consider carefully'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0 rounded-full overflow-hidden h-2.5">
            <div className="h-full bg-gradient-to-r from-rose-500/80 to-rose-400/60 rounded-l-full"
              style={{ width: `${Math.abs(stopLossPct) / (targetGainPct + Math.abs(stopLossPct)) * 100}%` }} />
            <div className="w-px h-full bg-surface-950 shrink-0" />
            <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/80 rounded-r-full"
              style={{ width: `${targetGainPct / (targetGainPct + Math.abs(stopLossPct)) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-rose-400/70 font-medium">Stop loss</span>
            <span className="text-[10px] text-emerald-400/70 font-medium">Target</span>
          </div>
        </div>
      )}

      {/* ── 6. Action buttons ── */}
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
          <svg width="13" height="13" viewBox="0 0 13 13" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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

      {/* ── 7. Trailing stop advice ── */}
      {analysis.trading_plan.trailing_stop_advice && (
        <p className="text-xs text-surface-400 leading-relaxed border-l-2 border-brand-blue/30 pl-3">
          <span className="font-semibold text-surface-500">Trailing stop:</span>{' '}
          {analysis.trading_plan.trailing_stop_advice}
        </p>
      )}

      {/* ── 8. Detail sections ── */}
      <div className="flex flex-col gap-3">
        <Section title="Technical Indicators" defaultOpen
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 10L5.5 6 8 8.5 12 4" /></svg>}
        >
          {techRows.length > 0 ? <KVTable rows={techRows} /> : (
            <p className="text-xs text-surface-500 italic">Technical indicator data is being loaded. Try refreshing the analysis.</p>
          )}
        </Section>

        <Section title="Fundamentals"
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="10" height="10" rx="1.5" /><path d="M5 7h4M5 5h4M5 9h2" /></svg>}
        >
          {fundRows.length > 0 ? <KVTable rows={fundRows} /> : (
            <p className="text-xs text-surface-500 italic">
              {analysis.system_type === 'Swing'
                ? 'Fundamental data is not included in swing analysis. Switch to Position analysis for full fundamentals.'
                : 'No fundamental data available for this stock.'}
            </p>
          )}
        </Section>

        <Section title="Sentiment"
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5.5" /><path d="M4.5 8.5s.75 1.5 2.5 1.5 2.5-1.5 2.5-1.5M5 5.5v.5M9 5.5v.5" /></svg>}
        >
          <KVTable rows={sentRows} />
        </Section>
      </div>

      {/* ── 9. Disclaimer ── */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs text-surface-400 leading-relaxed">
          <span className="font-semibold text-amber-400">Disclaimer:</span> This tool provides AI-generated technical analysis for educational and informational purposes only. Sentiquant is <span className="font-semibold text-amber-300">NOT a SEBI-registered investment advisor</span>. Nothing on this platform constitutes investment advice, a recommendation to buy or sell securities, or a solicitation of any kind. All data shown are technical reference levels only. Please conduct your own research and consult a SEBI-registered financial advisor before making any investment decisions.
        </p>
      </div>

      {/* ── 10. Timestamp ── */}
      <p className="text-xs text-surface-600 text-right">
        Analysis generated {timeAgo(analysis.analysis_timestamp)}
      </p>
    </div>
  )
}
