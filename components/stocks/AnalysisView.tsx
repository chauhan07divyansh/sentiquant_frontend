'use client'

// PERF: extracted from stocks/[symbol]/page.tsx to create a valid code-split
//       boundary for the lazy-loaded CompareView. Both [symbol]/page.tsx and
//       CompareView.tsx import AnalysisView from here.

import type { ReactNode } from 'react'
import { Card, StatCard }   from '@/components/ui/Card'
import { SignalBadge, GradeBadge, SystemBadge } from '@/components/ui/Badge'
import { ScoreBar, TradingPlanGrid, Change } from '@/components/ui/DataDisplay'
import { classifySignal }   from '@/types/stock.types'
import { formatINR, formatNumber, timeAgo } from '@/lib/utils/formatters'
import type { StockAnalysis } from '@/types/stock.types'

// ─────────────────────────────────────────────
//  TECHNICALS TABLE
// ─────────────────────────────────────────────
function TechnicalsTable({ indicators }: { indicators: StockAnalysis['technical_indicators'] }) {
  const rows = Object.entries(indicators).filter(([, v]) => v !== undefined && v !== null)
  if (rows.length === 0) return <p className="text-xs text-surface-500">No technical data available.</p>

  const formatKey = (k: string) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="flex flex-col divide-y divide-surface-800">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-2">
          <span className="text-xs text-surface-400">{formatKey(key)}</span>
          <span className="font-mono text-xs text-white tabular-nums">
            {typeof value === 'number' ? formatNumber(value, 2) : String(value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  FUNDAMENTALS TABLE
// ─────────────────────────────────────────────
function FundamentalsTable({ data }: { data: StockAnalysis['fundamentals'] }) {
  const rows = Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (rows.length === 0) return <p className="text-xs text-surface-500">No fundamental data available.</p>

  const formatKey = (k: string) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="flex flex-col divide-y divide-surface-800">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-2">
          <span className="text-xs text-surface-400">{formatKey(key)}</span>
          <span className="font-mono text-xs text-white tabular-nums">{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  SENTIMENT CARD
// ─────────────────────────────────────────────
function SentimentCard({ data }: { data: StockAnalysis['sentiment'] }) {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          const isScore = typeof value === 'number' && (key.includes('score') || key.includes('sentiment'))
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-400">{label}</span>
                <span className="font-mono text-xs text-white tabular-nums">
                  {typeof value === 'number' ? formatNumber(value as number, 2) : String(value)}
                </span>
              </div>
              {isScore && typeof value === 'number' && (
                <ScoreBar score={(value as number) * 100} size="sm" showValue={false} />
              )}
            </div>
          )
        })}
    </div>
  )
}

// ─────────────────────────────────────────────
//  INSIGHT CARDS
//  Derive 2–3 prominent highlights from the
//  analysis data so users immediately see what
//  matters — score tier, upside, signal.
// ─────────────────────────────────────────────
interface Insight {
  label:       string
  description: string
  color:       string
  bg:          string
  icon:        ReactNode
}

function InsightCards({ analysis }: { analysis: StockAnalysis }) {
  const signal   = classifySignal(analysis.trading_plan.signal)
  const insights: Insight[] = []

  // 1. Score-tier insight
  if (analysis.overall_score >= 70) {
    insights.push({
      label:       'High-conviction setup',
      description: `AI score ${analysis.overall_score}/100 — strong technical & fundamental alignment`,
      color: 'text-brand-cyan',
      bg:    'bg-brand-cyan/8 border-brand-cyan/20',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M7 1.5l1.3 2.6 2.9.4-2.1 2 .5 2.9L7 7.8l-2.6 1.3.5-2.9-2.1-2 2.9-.4z"/>
        </svg>
      ),
    })
  } else if (analysis.overall_score >= 50) {
    insights.push({
      label:       'Moderate opportunity',
      description: `AI score ${analysis.overall_score}/100 — watch for breakout confirmation`,
      color: 'text-brand-blue',
      bg:    'bg-brand-blue/8 border-brand-blue/20',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="7" cy="7" r="5.5"/><path d="M7 5v4M7 4v.5"/>
        </svg>
      ),
    })
  }

  // 2. Upside potential insight
  if (analysis.potential_return >= 10) {
    insights.push({
      label:       `${analysis.potential_return.toFixed(1)}% upside potential`,
      description: `Target ${formatINR(analysis.target_price, 0)} from current ${formatINR(analysis.current_price, 0)}`,
      color: 'text-emerald-400',
      bg:    'bg-emerald-400/8 border-emerald-400/20',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 10L5.5 6 8 8.5 12 4"/><path d="M9 4h3v3"/>
        </svg>
      ),
    })
  } else if (analysis.potential_return < 0) {
    insights.push({
      label:       'Negative return projection',
      description: `Target is below current price — consider risk carefully`,
      color: 'text-rose-400',
      bg:    'bg-rose-400/8 border-rose-400/20',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M7 2.5v6M7 10.5v.5"/><circle cx="7" cy="7" r="5.5"/>
        </svg>
      ),
    })
  }

  // 3. Signal insight
  if (signal === 'strong-buy') {
    insights.push({
      label:       'Strong buy signal',
      description: `${analysis.trading_plan.signal} — entry around ${analysis.trading_plan.entry_price}`,
      color: 'text-brand-cyan',
      bg:    'bg-brand-cyan/8 border-brand-cyan/20',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 9L5 6l2.5 2.5L12 4"/>
        </svg>
      ),
    })
  } else if (signal === 'sell' || signal === 'avoid') {
    insights.push({
      label:       signal === 'avoid' ? 'Avoid — poor setup' : 'Sell signal detected',
      description: `${analysis.trading_plan.signal} — review stop-loss before acting`,
      color: 'text-rose-400',
      bg:    'bg-rose-400/8 border-rose-400/20',
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 2l10 10M12 2L2 12"/>
        </svg>
      ),
    })
  }

  if (insights.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {insights.slice(0, 3).map((insight, i) => (
        <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${insight.bg}`}>
          <div className={`shrink-0 mt-0.5 ${insight.color}`}>{insight.icon}</div>
          <div className="min-w-0">
            <p className={`text-xs font-semibold ${insight.color} leading-tight`}>{insight.label}</p>
            <p className="text-[11px] text-surface-400 mt-1 leading-relaxed">{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  FULL ANALYSIS VIEW (one system)
// ─────────────────────────────────────────────
export function AnalysisView({ analysis }: { analysis: StockAnalysis }) {
  const signal = classifySignal(analysis.trading_plan.signal)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── Key insights ── */}
      <InsightCards analysis={analysis} />

      {/* ── Trust strip ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-brand-cyan bg-brand-cyan/8 border border-brand-cyan/20 px-2.5 py-1 rounded-full">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 1l.9 1.9 2.1.3-1.5 1.5.35 2.1L5 5.8l-1.85.9.35-2.1L2 3.2l2.1-.3z"/>
          </svg>
          AI-powered analysis
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-surface-500 bg-surface-800/60 border border-surface-700 px-2.5 py-1 rounded-full">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-emerald-400">
            <circle cx="4" cy="4" r="4"/>
          </svg>
          Live {analysis.system_type} data · {analysis.time_horizon}
        </span>
      </div>

      {/* ── Hero stat grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="AI Score"
          value={
            <span className="font-display tabular-nums">
              {analysis.overall_score}
              <span className="text-surface-500 text-lg font-normal">/100</span>
            </span>
          }
          sub={<GradeBadge grade={analysis.investment_grade} />}
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M7 1l1.5 3 3.4.5-2.45 2.4.58 3.4L7 8.8l-3.03 1.5.58-3.4L2.1 4.5l3.4-.5z"/>
            </svg>
          }
        />
        <StatCard
          label="Current price"
          value={<span className="font-mono tabular-nums text-xl">{formatINR(analysis.current_price, 0)}</span>}
          sub={<span className="text-xs text-surface-500">{analysis.time_horizon}</span>}
        />
        <StatCard
          label="Target price"
          value={<span className="font-mono tabular-nums text-xl">{formatINR(analysis.target_price, 0)}</span>}
          sub={<Change value={analysis.potential_return} size="sm" />}
          trend={analysis.potential_return > 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Signal"
          value={<SignalBadge strength={signal} className="text-sm px-3 py-1.5" />}
          sub={<span className="text-xs text-surface-500">{analysis.system_type} system</span>}
        />
      </div>

      {/* ── Score bar prominent ── */}
      <Card>
        <ScoreBar score={analysis.overall_score} label="Investment score" showValue />
      </Card>

      {/* ── Trading plan + Technicals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-sm text-white">Trading plan</h2>
            <SystemBadge type={analysis.system_type} />
          </div>
          <TradingPlanGrid plan={analysis.trading_plan} />
        </Card>

        <Card>
          <h2 className="font-sans font-semibold text-sm text-white mb-4">Technical indicators</h2>
          <TechnicalsTable indicators={analysis.technical_indicators} />
        </Card>
      </div>

      {/* ── Fundamentals + Sentiment ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-sans font-semibold text-sm text-white mb-4">Fundamentals</h2>
          <FundamentalsTable data={analysis.fundamentals} />
        </Card>

        <Card>
          <h2 className="font-sans font-semibold text-sm text-white mb-4">Sentiment</h2>
          <SentimentCard data={analysis.sentiment} />
        </Card>
      </div>

      {/* ── Timestamp ── */}
      <p className="text-xs text-surface-600 text-right">
        Analysis generated {timeAgo(analysis.analysis_timestamp)}
      </p>
    </div>
  )
}
