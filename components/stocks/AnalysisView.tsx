'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { AIDisclosureNote } from '@/components/common/AIDisclosureNote'
import { ScoreBar, Change } from '@/components/ui/DataDisplay'
import { SignalBadge, GradeBadge, SystemBadge } from '@/components/ui/Badge'
import { classifySignal } from '@/types/stock.types'
import {
  formatNumber, timeAgo,
  signalLabel,
  PRICE_LEVEL_LABELS,
} from '@/lib/utils/formatters'
import { useWatchlistStore } from '@/store'
import type { StockAnalysis } from '@/types/stock.types'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parsePrice(str: string): number | null {
  if (!str || str.trim() === 'N/A' || str.trim() === '') return null
  const m = str.replace(/,/g, '').match(/\d+\.?\d*/)
  return m ? parseFloat(m[0]) : null
}
function fmtPrice(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtKey(k: string): string {
  return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Reasoning Engine ─────────────────────────────────────────────────────────
interface ReasoningPoint {
  label:  string
  text:   string
  status: 'bullish' | 'bearish' | 'neutral'
}

function buildReasoning(analysis: StockAnalysis): ReasoningPoint[] {
  const points: ReasoningPoint[] = []
  const tech = analysis.technical_indicators ?? {}
  const sent = analysis.sentiment ?? {}

  const rsi = tech['rsi'] ?? tech['RSI'] ?? null
  if (rsi != null && typeof rsi === 'number') {
    if (rsi < 30) {
      points.push({ label: 'Momentum', text: `RSI at ${rsi.toFixed(1)} — price has fallen sharply and is historically in a recovery zone. Momentum indicators suggest oversold conditions.`, status: 'bullish' })
    } else if (rsi < 45) {
      points.push({ label: 'Momentum', text: `RSI at ${rsi.toFixed(1)} — momentum is weak but conditions are approaching a historically significant support zone.`, status: 'bullish' })
    } else if (rsi > 75) {
      points.push({ label: 'Momentum', text: `RSI at ${rsi.toFixed(1)} — price has risen sharply. Momentum indicators show extended conditions relative to recent history.`, status: 'bearish' })
    } else if (rsi > 60) {
      points.push({ label: 'Momentum', text: `RSI at ${rsi.toFixed(1)} — trend momentum is positive. No extreme readings in either direction.`, status: 'neutral' })
    } else {
      points.push({ label: 'Momentum', text: `RSI at ${rsi.toFixed(1)} — momentum is neutral. No strong directional bias from this indicator.`, status: 'neutral' })
    }
  }

  const macdLine = tech['MACD Line'] ?? tech['macd_line'] ?? null
  const macdSig  = tech['MACD Signal'] ?? tech['macd_signal'] ?? null
  const macdHist = tech['MACD Histogram'] ?? tech['macd_histogram'] ?? null
  if (macdLine != null && macdSig != null) {
    const above   = Number(macdLine) > Number(macdSig)
    const histPos = macdHist != null && Number(macdHist) > 0
    if (above && histPos) {
      points.push({ label: 'Trend Direction', text: `MACD shows trend momentum accelerating upward. The signal line crossover is confirmed by a growing histogram.`, status: 'bullish' })
    } else if (above) {
      points.push({ label: 'Trend Direction', text: `MACD line is above the signal line — trend is positive but momentum appears to be slowing.`, status: 'neutral' })
    } else if (!above && !histPos) {
      points.push({ label: 'Trend Direction', text: `MACD shows downward momentum. Both the crossover and histogram confirm a bearish trend direction.`, status: 'bearish' })
    } else {
      points.push({ label: 'Trend Direction', text: `MACD is below the signal line but histogram is narrowing — downward momentum may be stabilizing.`, status: 'neutral' })
    }
  }

  const bbUpper = tech['Bollinger Upper'] ?? tech['bollinger_bands_upper'] ?? null
  const bbLower = tech['Bollinger Lower'] ?? tech['bollinger_bands_lower'] ?? null
  const price   = analysis.current_price
  if (bbUpper != null && bbLower != null && price) {
    const range    = Number(bbUpper) - Number(bbLower)
    const position = range > 0 ? (price - Number(bbLower)) / range : 0.5
    if (position < 0.2) {
      points.push({ label: 'Price Range', text: `Price is near the lower boundary of its recent trading range — historically this zone has acted as a support area.`, status: 'bullish' })
    } else if (position > 0.8) {
      points.push({ label: 'Price Range', text: `Price is near the upper boundary of its recent trading range — historically this zone has acted as a resistance area.`, status: 'bearish' })
    } else {
      points.push({ label: 'Price Range', text: `Price is within the middle of its recent trading range. No extreme readings from this indicator.`, status: 'neutral' })
    }
  }

  const stochK = tech['Stochastic K'] ?? tech['stochastic_k'] ?? null
  if (stochK != null && typeof stochK === 'number') {
    if (stochK < 20) {
      points.push({ label: 'Short-term Momentum', text: `Stochastic oscillator at ${stochK.toFixed(1)} — short-term momentum is in an oversold zone. Historically associated with potential reversals.`, status: 'bullish' })
    } else if (stochK > 80) {
      points.push({ label: 'Short-term Momentum', text: `Stochastic oscillator at ${stochK.toFixed(1)} — short-term momentum is in an overbought zone. Historically associated with potential pullbacks.`, status: 'bearish' })
    }
  }

  const support    = tech['S/R Support']    ?? tech['support_resistance_support']    ?? null
  const resistance = tech['S/R Resistance'] ?? tech['support_resistance_resistance'] ?? null
  if (support != null && resistance != null && price) {
    const distDown = ((price - Number(support))    / price * 100).toFixed(1)
    const distUp   = ((Number(resistance) - price) / price * 100).toFixed(1)
    points.push({
      label:  'Key Price Levels',
      text:   `Historical support at ₹${Number(support).toFixed(0)} (${distDown}% below current price). Historical resistance at ₹${Number(resistance).toFixed(0)} (${distUp}% above current price).`,
      status: Number(distDown) < Number(distUp) ? 'bullish' : 'neutral',
    })
  }

  const sentSummary = sent['summary'] as { positive?: number; negative?: number; neutral?: number } | null
  if (sentSummary && typeof sentSummary === 'object') {
    const pos   = sentSummary.positive ?? 0
    const neg   = sentSummary.negative ?? 0
    const total = pos + neg + (sentSummary.neutral ?? 0)
    if (total > 0) {
      const posPct = Math.round((pos / total) * 100)
      if (posPct >= 70) {
        points.push({ label: 'News Sentiment', text: `${pos} of ${total} recent news articles scored positive. News flow is broadly supportive of the stock.`, status: 'bullish' })
      } else if (posPct <= 30) {
        points.push({ label: 'News Sentiment', text: `${neg} of ${total} recent articles scored negative. News flow is broadly cautious around the stock.`, status: 'bearish' })
      } else {
        points.push({ label: 'News Sentiment', text: `News sentiment is mixed — ${pos} positive, ${neg} negative out of ${total} articles. No clear directional bias from recent news.`, status: 'neutral' })
      }
    }
  }

  const atr       = tech['Risk Atr']        ?? tech['risk_metrics_atr']        ?? null
  const riskLevel = tech['Risk Risk Level'] ?? tech['risk_metrics_risk_level'] ?? null
  if (riskLevel) {
    const lvl = String(riskLevel).toUpperCase()
    if (lvl === 'LOW') {
      points.push({ label: 'Volatility', text: `Low daily volatility — this stock moves steadily relative to its history. Lower risk of sharp unexpected swings.`, status: 'bullish' })
    } else if (lvl === 'HIGH') {
      points.push({ label: 'Volatility', text: `High daily volatility — this stock has a history of sharp moves. Position sizing and risk management are especially important.`, status: 'bearish' })
    } else {
      points.push({ label: 'Volatility', text: `Moderate daily volatility. Historical price swings are within normal range for this stock.`, status: 'neutral' })
    }
  } else if (atr != null && price) {
    const atrPct = (Number(atr) / price) * 100
    if (atrPct > 3) {
      points.push({ label: 'Volatility', text: `Average daily range is ${atrPct.toFixed(1)}% of price — historically high. Expect larger intraday swings.`, status: 'bearish' })
    } else if (atrPct < 1) {
      points.push({ label: 'Volatility', text: `Average daily range is ${atrPct.toFixed(1)}% of price — historically low. This stock tends to move in a controlled manner.`, status: 'bullish' })
    }
  }

  return points
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: ReactNode; children: ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-iron bg-graphite">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-ash shrink-0">{icon}</span>
          <span className="font-semibold text-sm text-white">{title}</span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round"
          className={cn('text-ash shrink-0 transition-transform duration-200', open && 'rotate-180')}
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-iron animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Price Levels Card ────────────────────────────────────────────────────────
function PriceLevelsCard({ analysis }: { analysis: StockAnalysis }) {
  const entryNum       = parsePrice(analysis.trading_plan.entry_price)
  const stopNum        = parsePrice(analysis.trading_plan.stop_loss)
  const targetNum      = analysis.target_price
  const base           = entryNum ?? analysis.current_price
  const entryVsCurrent = entryNum != null
    ? ((entryNum - analysis.current_price) / analysis.current_price) * 100
    : null
  const targetGainPct  = ((targetNum - base) / base) * 100
  const stopLossPct    = stopNum != null ? ((stopNum - base) / base) * 100 : null

  return (
    <div className="rounded-xl border border-iron bg-graphite overflow-hidden">
      <div className="px-4 py-3 border-b border-iron flex items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ash shrink-0">
          <path d="M2 10h10M2 7h7M2 4h4" />
        </svg>
        <span className="font-semibold text-xs text-white">Technical Reference Levels</span>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {/* Entry */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(6,100,232,0.05)', border: '1px solid rgba(6,100,232,0.15)' }}>
          <div>
            <p className="text-[10px] font-semibold text-brand-blue uppercase tracking-[0.04em] mb-0.5">{PRICE_LEVEL_LABELS.entry}</p>
            <p className="font-mono text-[15px] font-semibold text-white tabular-nums leading-none">
              {entryNum != null ? fmtPrice(entryNum) : analysis.trading_plan.entry_price}
            </p>
          </div>
          {entryVsCurrent != null && (
            <span className={cn('font-mono text-xs font-semibold tabular-nums',
              entryVsCurrent >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
              {entryVsCurrent >= 0 ? '+' : ''}{entryVsCurrent.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Target / Resistance */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.18)' }}>
          <div>
            <p className="text-[10px] font-semibold text-[#10b981] uppercase tracking-[0.04em] mb-0.5">{PRICE_LEVEL_LABELS.t1}</p>
            <p className="font-mono text-[15px] font-semibold text-[#10b981] tabular-nums leading-none">{fmtPrice(targetNum)}</p>
          </div>
          <span className="font-mono text-xs font-semibold tabular-nums text-[#10b981]">
            +{targetGainPct.toFixed(2)}%
          </span>
        </div>

        {/* Stop / Support */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.18)' }}>
          <div>
            <p className="text-[10px] font-semibold text-[#f43f5e] uppercase tracking-[0.04em] mb-0.5">{PRICE_LEVEL_LABELS.stop}</p>
            <p className="font-mono text-[15px] font-semibold text-[#f43f5e] tabular-nums leading-none">
              {stopNum != null
                ? fmtPrice(stopNum)
                : analysis.trading_plan.stop_loss === 'N/A' ? 'No clear level' : analysis.trading_plan.stop_loss}
            </p>
          </div>
          {stopLossPct != null && (
            <span className="font-mono text-xs font-semibold tabular-nums text-[#f43f5e]">
              {stopLossPct.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Extended resistance levels */}
        {(['target_2', 'target_3'] as const).some(k => {
          const t = analysis.trading_plan[k]
          return t && t !== 'N/A'
        }) && (
          <div className="pt-1">
            <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.06em] mb-2">Extended levels</p>
            <div className="flex gap-2 flex-wrap">
              {(['target_2', 'target_3'] as const).map((k, i) => {
                const t    = analysis.trading_plan[k]
                const tNum = t && t !== 'N/A' ? parsePrice(t) : null
                return tNum ? (
                  <span key={k} className="font-mono text-xs font-medium text-[#10b981] tabular-nums px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {i === 0 ? PRICE_LEVEL_LABELS.t2 : PRICE_LEVEL_LABELS.t3}: {fmtPrice(tNum)}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}

        {analysis.trading_plan.trailing_stop_advice && (
          <p className="text-[11px] text-ash leading-relaxed pt-1">
            {analysis.trading_plan.trailing_stop_advice}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Risk-Reward Card ─────────────────────────────────────────────────────────
function RiskRewardCard({ analysis }: { analysis: StockAnalysis }) {
  const entryNum      = parsePrice(analysis.trading_plan.entry_price)
  const stopNum       = parsePrice(analysis.trading_plan.stop_loss)
  const targetNum     = analysis.target_price
  const base          = entryNum ?? analysis.current_price
  const targetGainPct = ((targetNum - base) / base) * 100
  const stopLossPct   = stopNum != null ? ((stopNum - base) / base) * 100 : null
  const rrRatio       = stopLossPct != null && stopLossPct !== 0
    ? Math.abs(targetGainPct / stopLossPct) : null

  if (rrRatio == null || stopLossPct == null) return null

  const riskWidth   = Math.abs(stopLossPct) / (targetGainPct + Math.abs(stopLossPct)) * 100
  const rewardWidth = targetGainPct / (targetGainPct + Math.abs(stopLossPct)) * 100

  return (
    <div className="rounded-xl border border-iron bg-graphite p-4">
      <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.06em] mb-4 flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ash">
          <path d="M1 6h10M6 1v10" />
        </svg>
        Risk-Reward Ratio
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.04em]">To R1</p>
          <p className="font-mono text-sm font-bold text-[#10b981] tabular-nums leading-none">+{targetGainPct.toFixed(2)}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.04em]">To Support</p>
          <p className="font-mono text-sm font-bold text-[#f43f5e] tabular-nums leading-none">{stopLossPct.toFixed(2)}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.04em]">R:R</p>
          <p className="font-mono text-sm font-bold text-white tabular-nums leading-none">1:{rrRatio.toFixed(2)}</p>
          <p className={cn('text-[10px] font-semibold mt-0.5',
            rrRatio >= 3 ? 'text-[#10b981]' : rrRatio >= 2 ? 'text-brand-blue' : 'text-ash')}>
            {rrRatio >= 3 ? 'Favorable' : rrRatio >= 2 ? 'Acceptable' : 'Tight'}
          </p>
        </div>
      </div>

      {/* Solid-color risk/reward bar — no gradients */}
      <div className="flex items-center rounded-full overflow-hidden h-1.5 bg-iron">
        <div className="h-full bg-[#f43f5e] rounded-l-full" style={{ width: `${riskWidth}%` }} />
        <div className="w-px h-full bg-obsidian shrink-0" />
        <div className="h-full bg-[#10b981] rounded-r-full" style={{ width: `${rewardWidth}%` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-[#f43f5e]/60 font-medium">Support</span>
        <span className="text-[10px] text-[#10b981]/60 font-medium">Resistance</span>
      </div>
    </div>
  )
}

// ─── Grouped Technical Indicators ─────────────────────────────────────────────
function GroupedIndicators({ indicators }: { indicators: Record<string, number | string | undefined> }) {
  const entries = Object.entries(indicators).filter(([, v]) => v != null) as [string, string | number][]

  const groups: Array<{ label: string; palette: 'accent' | 'success' | 'danger' | 'muted'; matcher: (k: string) => boolean }> = [
    { label: 'Trend',              palette: 'accent',  matcher: k => k.includes('MACD') || k.toLowerCase().includes('macd') },
    { label: 'Momentum',           palette: 'accent',  matcher: k => ['RSI', 'rsi', 'Stochastic K', 'stochastic_k', 'Stochastic D', 'stochastic_d'].includes(k) },
    { label: 'Volatility Bands',   palette: 'muted',   matcher: k => k.includes('Bollinger') || k.toLowerCase().includes('bollinger') },
    { label: 'Support/Resistance', palette: 'muted',   matcher: k => k.startsWith('S/R') || k.toLowerCase().startsWith('support_resistance') },
    { label: 'Risk Metrics',       palette: 'danger',  matcher: k => k.startsWith('Risk') || k.toLowerCase().startsWith('risk') },
  ]

  const matched = new Set<string>()
  const categorized = groups.map(g => {
    const items = entries.filter(([k]) => g.matcher(k))
    items.forEach(([k]) => matched.add(k))
    return { ...g, items }
  }).filter(g => g.items.length > 0)

  const other = entries.filter(([k]) => !matched.has(k))

  const paletteLabel: Record<string, string> = {
    accent:  'text-brand-blue',
    success: 'text-[#10b981]',
    danger:  'text-[#f43f5e]',
    muted:   'text-ash',
  }
  const paletteBorder: Record<string, string> = {
    accent:  'border-iron',
    success: 'border-iron',
    danger:  'border-[rgba(244,63,94,0.2)]',
    muted:   'border-iron',
  }

  const renderGroup = (label: string, palette: string, items: [string, string | number][]) => (
    <div key={label} className={cn('rounded-xl border bg-inkwell p-4', paletteBorder[palette] ?? 'border-iron')}>
      <p className={cn('text-[11px] font-semibold uppercase tracking-[0.04em] mb-3', paletteLabel[palette] ?? 'text-ash')}>{label}</p>
      <div className="flex flex-col divide-y divide-iron">
        {items.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
            <span className="text-xs text-ash">{fmtKey(k)}</span>
            <span className="font-mono text-xs font-semibold text-white tabular-nums">
              {typeof v === 'number' ? formatNumber(v, 2) : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {categorized.map(g => renderGroup(g.label, g.palette, g.items))}
      {other.length > 0 && renderGroup('Other', 'muted', other)}
    </div>
  )
}

// ─── News Sentiment (bug-fixed) ───────────────────────────────────────────────
function NewsSentimentContent({ sentiment }: { sentiment: StockAnalysis['sentiment'] }) {
  const summaryRaw = sentiment['summary'] as unknown
  const scoresRaw  = sentiment['scores']  as unknown

  const summary = summaryRaw && typeof summaryRaw === 'object' && !Array.isArray(summaryRaw)
    ? summaryRaw as { positive?: number; negative?: number; neutral?: number }
    : null

  const scoresArr = Array.isArray(scoresRaw) ? scoresRaw as unknown[] : null
  const scoreCounts = scoresArr
    ? scoresArr.reduce(
        (acc: { positive: number; negative: number; neutral: number }, s) => {
          const key = String(s).toLowerCase()
          if (key === 'positive') acc.positive++
          else if (key === 'negative') acc.negative++
          else acc.neutral++
          return acc
        },
        { positive: 0, negative: 0, neutral: 0 }
      )
    : null

  const scalarRows = Object.entries(sentiment).filter(([k, v]) => {
    if (k === 'summary' || k === 'scores') return false
    return v != null && (typeof v === 'number' || typeof v === 'string')
  }) as [string, string | number][]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-fog leading-snug">
        <span className="text-ash font-medium">Source:</span> Financial news articles &amp; company disclosures
        {' · '}<span className="text-ash font-medium">Method:</span> SBERT semantic scoring
      </p>

      {/* Summary object (positive/negative/neutral counts) */}
      {summary && (
        <div>
          <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.06em] mb-2">Article Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {(summary.positive ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#10b981]" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1 h-1 rounded-full bg-[#10b981] shrink-0" />
                {summary.positive} positive
              </span>
            )}
            {(summary.negative ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#f43f5e]" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <span className="w-1 h-1 rounded-full bg-[#f43f5e] shrink-0" />
                {summary.negative} negative
              </span>
            )}
            {(summary.neutral ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-ash" style={{ background: 'rgba(119,122,136,0.1)', border: '1px solid rgba(119,122,136,0.2)' }}>
                <span className="w-1 h-1 rounded-full bg-ash shrink-0" />
                {summary.neutral} neutral
              </span>
            )}
          </div>
        </div>
      )}

      {/* Scores array (fallback if no summary object) */}
      {scoreCounts && !summary && (
        <div>
          <p className="text-[10px] font-semibold text-ash uppercase tracking-[0.06em] mb-2">Article Scores</p>
          <div className="flex flex-wrap gap-2">
            {scoreCounts.positive > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#10b981]" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                {scoreCounts.positive} positive
              </span>
            )}
            {scoreCounts.negative > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-[#f43f5e]" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                {scoreCounts.negative} negative
              </span>
            )}
            {scoreCounts.neutral > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-ash" style={{ background: 'rgba(119,122,136,0.1)', border: '1px solid rgba(119,122,136,0.2)' }}>
                {scoreCounts.neutral} neutral
              </span>
            )}
          </div>
        </div>
      )}

      {/* Scalar fields */}
      {scalarRows.length > 0 && (
        <div className="flex flex-col divide-y divide-iron">
          {scalarRows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-ash">{fmtKey(k)}</span>
              <span className="font-mono text-xs font-semibold text-white tabular-nums">
                {typeof v === 'number' ? formatNumber(v, 2) : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function AnalysisView({
  analysis,
  onSwitchTab,
}: {
  analysis:     StockAnalysis
  onSwitchTab?: (tab: 'swing' | 'position' | 'compare') => void
}) {
  const signal     = classifySignal(analysis.trading_plan.signal)
  const points     = buildReasoning(analysis)
  const bullishPts = points.filter(p => p.status === 'bullish')
  const cautionPts = points.filter(p => p.status !== 'bullish')
  const bullish    = bullishPts.length
  const bearish    = points.filter(p => p.status === 'bearish').length

  const { addToWatchlist, removeFromWatchlist, isWatched } = useWatchlistStore()
  const watched = isWatched(analysis.symbol)
  const [shareToast, setShareToast] = useState(false)

  const handleShare = async () => {
    const text = `${analysis.symbol} — AI Score: ${analysis.overall_score}/100 | ${signalLabel(signal)} | ${PRICE_LEVEL_LABELS.t1}: ${fmtPrice(analysis.target_price)} | SentiQuant`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${analysis.symbol} Technical Analysis`, text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      }
    } catch { /* user cancelled */ }
  }

  const fundRows = Object.entries(analysis.fundamentals).filter(([, v]) => v != null && v !== '') as Array<[string, string | number]>

  const verdict = analysis.trading_plan.strategy ||
    (bullish > bearish
      ? `${bullish} of ${points.length} technical indicators show bullish conditions. ${bearish} show caution. Overall technical picture leans positive.`
      : bearish > bullish
      ? `${bearish} of ${points.length} technical indicators show bearish conditions. ${bullish} show positive signals. Overall technical picture leans cautious.`
      : `Technical indicators are mixed — ${bullish} bullish, ${bearish} bearish signals. No strong directional bias at current levels.`)

  const signalKey = signal === 'buy' || signal === 'strong-buy' ? 'bull'
    : signal === 'sell' || signal === 'avoid' ? 'bear'
    : 'neutral'

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── SECTION 1: Unified Header ── */}
      <div className="rounded-xl border border-iron bg-graphite overflow-hidden">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Score */}
            <div className="flex items-center gap-3 sm:pr-5 sm:border-r sm:border-iron">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-ash uppercase tracking-[0.06em]">AI Score</span>
                <div className="flex items-baseline gap-1 leading-none">
                  <span className="font-mono text-3xl font-bold text-brand-blue tabular-nums">
                    {analysis.overall_score.toFixed(0)}
                  </span>
                  <span className="text-sm text-ash">/100</span>
                </div>
              </div>
              <ScoreBar score={analysis.overall_score} showValue={false} className="w-16 sm:w-20" />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-0.5 sm:px-5 sm:border-r sm:border-iron">
              <span className="text-[10px] font-semibold text-ash uppercase tracking-[0.06em] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-soft shrink-0" aria-hidden="true" />
                Live Price
              </span>
              <div className="flex items-baseline gap-2 leading-none">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {fmtPrice(analysis.current_price)}
                </span>
                <Change value={analysis.potential_return} size="sm" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 sm:pl-5 flex-wrap">
              <SignalBadge strength={signal} />
              <GradeBadge grade={analysis.investment_grade} showFull />
              <SystemBadge type={analysis.system_type} />
            </div>
          </div>

          <p className="text-xs text-ash mt-3">
            {analysis.time_horizon} · AI-generated technical reading · updated {timeAgo(analysis.analysis_timestamp)}
          </p>
        </div>
      </div>

      {/* ── Mobile: price levels before signals ── */}
      <div className="lg:hidden flex flex-col gap-4">
        <PriceLevelsCard analysis={analysis} />
        <RiskRewardCard analysis={analysis} />
      </div>

      {/* ── 2-col layout: signals left, price right (desktop) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5">

          {/* ── SECTION 2: Signal Cards ── */}
          {points.length > 0 && (
            <div className="rounded-xl border border-iron bg-graphite overflow-hidden">
              <div className="px-5 py-4 border-b border-iron flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ash shrink-0">
                    <circle cx="7" cy="7" r="5.5" /><path d="M7 4v4M7 9.5v.5" />
                  </svg>
                  <span className="font-semibold text-sm text-white">How this reading was generated</span>
                </div>
                <span className="shrink-0 text-xs text-ash tabular-nums font-mono">
                  {bullish}↑ · {bearish}↓
                </span>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bullishPts.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-semibold text-[#10b981] uppercase tracking-[0.05em]">Positive Signals</p>
                      {bullishPts.map((pt, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl"
                          style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.18)' }}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#10b981] mb-1">{pt.label}</p>
                          <p className="text-xs text-pearl leading-relaxed">{pt.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {cautionPts.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className={cn(
                        'text-[10px] font-semibold uppercase tracking-[0.05em]',
                        cautionPts.some(p => p.status === 'bearish') ? 'text-[#f43f5e]' : 'text-[#f59e0b]'
                      )}>
                        Caution Signals
                      </p>
                      {cautionPts.map((pt, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl"
                          style={pt.status === 'bearish'
                            ? { background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.18)' }
                            : { background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.18)' }}
                        >
                          <p className={cn(
                            'text-[10px] font-semibold uppercase tracking-[0.04em] mb-1',
                            pt.status === 'bearish' ? 'text-[#f43f5e]' : 'text-[#f59e0b]'
                          )}>{pt.label}</p>
                          <p className="text-xs text-pearl leading-relaxed">{pt.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Technical summary callout */}
              <div
                className="mx-5 mb-5 px-4 py-3 rounded-xl text-xs leading-relaxed"
                style={signalKey === 'bull'
                  ? { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: '#acafb9' }
                  : signalKey === 'bear'
                  ? { background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', color: '#acafb9' }
                  : { background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', color: '#acafb9' }
                }
              >
                <span className={cn('font-semibold',
                  signalKey === 'bull' ? 'text-[#10b981]' : signalKey === 'bear' ? 'text-[#f43f5e]' : 'text-[#f59e0b]'
                )}>Technical summary: </span>
                {verdict}
              </div>

              <AIDisclosureNote variant="inline" className="text-[10px] text-fog px-5 pb-4" />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (desktop only) */}
        <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-[4.5rem]">
          <PriceLevelsCard analysis={analysis} />
          <RiskRewardCard analysis={analysis} />
        </div>
      </div>

      {/* ── SECTION 4: Grouped Technical Indicators ── */}
      <Section
        title="Technical Indicators"
        defaultOpen
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 10L5.5 6 8 8.5 12 4" />
          </svg>
        }
      >
        {Object.keys(analysis.technical_indicators).length > 0 ? (
          <GroupedIndicators indicators={analysis.technical_indicators} />
        ) : (
          <p className="text-xs text-ash">Technical indicator data is being loaded. Try refreshing the analysis.</p>
        )}
      </Section>

      {/* ── SECTION 5: News Sentiment (bug-fixed) ── */}
      <Section
        title="News Sentiment"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="5.5" /><path d="M4.5 8.5s.75 1.5 2.5 1.5 2.5-1.5 2.5-1.5M5 5.5v.5M9 5.5v.5" />
          </svg>
        }
      >
        <NewsSentimentContent sentiment={analysis.sentiment} />
      </Section>

      {/* ── SECTION 6: Fundamentals ── */}
      <Section
        title="Fundamentals"
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="2" width="10" height="10" rx="1.5" /><path d="M5 7h4M5 5h4M5 9h2" />
          </svg>
        }
      >
        {fundRows.length > 0 ? (
          <div className="flex flex-col divide-y divide-iron">
            {fundRows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-ash">{fmtKey(k)}</span>
                <span className="font-mono text-xs font-semibold text-white tabular-nums">
                  {typeof v === 'number' ? formatNumber(v, 2) : String(v)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-fog shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="6.5" /><path d="M8 6v4M8 5v.5" />
            </svg>
            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-ash leading-relaxed">
                {analysis.system_type === 'Swing'
                  ? 'Fundamental data is not included in swing analysis — it focuses on short-term price action.'
                  : 'No fundamental data available for this stock.'}
              </p>
              {analysis.system_type === 'Swing' && onSwitchTab && (
                <button
                  onClick={() => onSwitchTab('position')}
                  className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-pearl border border-iron rounded-[2px] px-3 py-1.5 hover:border-steel hover:text-white transition-colors duration-150"
                >
                  Switch to Position analysis →
                </button>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── SECTION 7: Utility buttons ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => watched ? removeFromWatchlist(analysis.symbol) : addToWatchlist(analysis.symbol)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-[2px] border text-xs font-medium transition-colors duration-150',
            watched
              ? 'bg-[rgba(6,100,232,0.1)] border-[rgba(6,100,232,0.3)] text-brand-blue hover:bg-[rgba(244,63,94,0.08)] hover:border-[rgba(244,63,94,0.3)] hover:text-[#f43f5e]'
              : 'border-iron text-pearl hover:border-steel hover:text-white'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6.5 1.2l1.5 3.1 3.4.5-2.45 2.4.58 3.38L6.5 9.1 3.97 10.58l.58-3.38L2.1 4.8l3.4-.5z" />
          </svg>
          {watched ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
        <button
          onClick={handleShare}
          className="relative flex items-center gap-2 px-4 py-2 rounded-[2px] border border-iron text-pearl text-xs font-medium hover:border-steel hover:text-white transition-colors duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="10.5" cy="2.5" r="1.5" /><circle cx="2.5" cy="6.5" r="1.5" /><circle cx="10.5" cy="10.5" r="1.5" />
            <path d="M4 5.8l5-2.5M4 7.2l5 2.5" />
          </svg>
          {shareToast ? 'Link copied!' : 'Share'}
        </button>
      </div>

      {/* ── Disclaimer ── */}
      <AIDisclosureNote variant="full" />

      {/* ── Timestamp ── */}
      <p className="text-xs text-ash text-right">
        Technical reading generated {timeAgo(analysis.analysis_timestamp)}
      </p>
    </div>
  )
}
