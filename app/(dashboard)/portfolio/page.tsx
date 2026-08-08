'use client'
import { Fragment, useState, useCallback, useEffect, useRef } from 'react'
import { Confetti }      from '@/components/ui/Confetti'
import { SuccessToast }  from '@/components/ui/SuccessToast'
import { useCreateSwingPortfolio, useCreatePositionPortfolio } from '@/hooks/useQueryHooks'
import { usePortfolioStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { BudgetInput } from '@/components/ui/Input'
import { ErrorState } from '@/components/common/ErrorState'
import { validateSwingForm, validatePositionForm, hasErrors } from '@/lib/utils/validators'
import { formatINR, formatINRCompact } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { track } from '@/lib/analytics'
import { RISK_LABELS } from '@/types/portfolio.types'
import type { PortfolioJob } from '@/lib/api/portfolio.api'
import type { RiskAppetite } from '@/types/stock.types'
import type { PortfolioResponse } from '@/types/portfolio.types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AIDisclosureNote } from '@/components/common/AIDisclosureNote'
import { generatePortfolioPDF } from '@/lib/generatePortfolioPDF'
import { gradeLabel } from '@/lib/portfolioGrade'
// Extended holding type with targets
interface HoldingWithTargets {
  symbol?: string
  company?: string
  score?: number
  price?: number
  stop_loss?: number
  risk?: number
  investment_amount?: number
  number_of_shares?: number
  percentage_allocation?: number
  target_1?: number
  target_2?: number
  target_3?: number
}
// ─────────────────────────────────────────────
//  PORTFOLIO PROGRESS
// ─────────────────────────────────────────────
function PortfolioProgress({ job }: { job: PortfolioJob | null }) {
  const messages = [
    'Connecting to market data feeds…',
    'Fetching OHLCV data for 240 stocks…',
    'Running AI scoring models…',
    'Applying risk filters…',
    'Optimising position sizes…',
    'Calculating stop-losses…',
    'Finalising your allocation…',
  ]
  const msgIndex = job ? Math.min(Math.floor((job.progress / 100) * messages.length), messages.length - 1) : 0
  return (
    <div className="flex flex-col items-center gap-6 py-12 animate-fade-in">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-surface-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-cyan animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
            <path d="M4 20l6-6 4 4 6-8" /><path d="M18 8h6v6" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white">Building your portfolio</h3>
        <p className="text-sm text-surface-400 animate-pulse min-h-[20px]">{messages[msgIndex]}</p>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-2">
        <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan rounded-full transition-all duration-1000" style={{ width: `${job?.progress ?? 5}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-surface-500 font-mono">
          <span>{job?.status === 'queued' ? 'Queued…' : 'Scanning 240 stocks'}</span>
          <span>{job?.progress ?? 0}%</span>
        </div>
      </div>
      <p className="text-xs text-surface-600 text-center max-w-xs leading-relaxed">
        This takes 5–8 minutes. You can leave this page — your portfolio will be ready when you return.
      </p>
    </div>
  )
}
// ─────────────────────────────────────────────
//  SCORE BADGE
// ─────────────────────────────────────────────
function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-surface-600 font-mono text-xs">—</span>
  const color = score >= 70 ? 'text-emerald-400 bg-emerald-400/10' : score >= 50 ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs tabular-nums', color)}>
      {Math.round(score)}
    </span>
  )
}
// ─────────────────────────────────────────────
//  GRADE + DIVERSIFICATION HELPERS
// ─────────────────────────────────────────────
function computeGrade(avgScore: number): { label: string; color: string } {
  const label = gradeLabel(avgScore)
  const color = avgScore >= 75 ? '#0664e8' : avgScore >= 65 ? '#10b981' : '#f59e0b'
  return { label, color }
}
function computeDivScore(holdings: HoldingWithTargets[]): number {
  if (!holdings.length) return 0
  const hhi = holdings.reduce((sum, h) => sum + ((h.percentage_allocation ?? 0) / 100) ** 2, 0)
  return Math.round((1 - hhi) * 100) / 10
}
// ─────────────────────────────────────────────
//  PORTFOLIO RESULT
// ─────────────────────────────────────────────
function PortfolioResult({ result, type, onReset }: {
  result: PortfolioResponse
  type: 'swing' | 'position'
  onReset: () => void
}) {
  const { summary, portfolio } = result
  const [sortKey, setSortKey] = useState<'allocation' | 'score' | 'symbol'>('allocation')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [isAdmin,      setIsAdmin]      = useState(false)
  const [tracking,     setTracking]     = useState(false)
  const [tracked,      setTracked]      = useState(false)
  const [trackError,   setTrackError]   = useState<string | null>(null)
  const [trackSuccess, setTrackSuccess] = useState<{ added: number; skipped: string[] } | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const [tableScrolled, setTableScrolled] = useState(false)
  const onTableScroll = () => {
    const el = tableRef.current
    if (el) setTableScrolled(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }
  useEffect(() => {
    setIsAdmin(!!sessionStorage.getItem('sq_admin_secret'))
  }, [])
  const sorted = [...(portfolio ?? [])].map(h => h as HoldingWithTargets).sort((a, b) => {
    const av = sortKey === 'allocation' ? (a.percentage_allocation ?? 0)
           : sortKey === 'score'      ? (a.score ?? 0)
           : (a.symbol ?? '').localeCompare(b.symbol ?? '')
    const bv = sortKey === 'allocation' ? (b.percentage_allocation ?? 0)
           : sortKey === 'score'      ? (b.score ?? 0)
           : (b.symbol ?? '').localeCompare(a.symbol ?? '')
    if (sortKey === 'symbol') return sortDir === 'asc' ? Number(av) : -Number(av)
    return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number)
  })
  const deployedPct = summary.total_budget > 0 ? (summary.total_allocated / summary.total_budget) * 100 : 0
  const grade       = computeGrade(summary.average_score)
  const divScore    = computeDivScore(sorted)
  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }
  const SortIcon = ({ k }: { k: typeof sortKey }) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      className={cn('ml-1 inline-block transition-all', sortKey === k ? 'text-brand-cyan' : 'text-surface-600')}>
      {sortKey === k && sortDir === 'asc'
        ? <path d="M2 7l3-4 3 4" />
        : <path d="M2 3l3 4 3-4" />}
    </svg>
  )
  const handleDownload = () => {
    track.portfolioDownloaded(type)
    generatePortfolioPDF(result, type)
  }
  async function handleTrack() {
    const count = portfolio?.length ?? 0
    if (!confirm(`Add all ${count} positions to the live tracker?`)) return
    setTracking(true)
    setTrackError(null)
    const secret = sessionStorage.getItem('sq_admin_secret') ?? ''
    const today = new Date().toISOString().split('T')[0]
    const dateLabel = new Date().toLocaleDateString('en-IN')
    const skipped: string[] = []
    let added = 0
    let unauthorized = false
    for (const h of ((portfolio ?? []) as HoldingWithTargets[])) {
      const missing: string[] = []
      if (!h.symbol)    missing.push('symbol')
      if (!h.price)     missing.push('price')
      if (!h.stop_loss) missing.push('stop_loss')
      if (!h.target_1)  missing.push('target_1')
      if (!h.target_2)  missing.push('target_2')
      if (!h.target_3)  missing.push('target_3')
      if (missing.length > 0) {
        skipped.push(`${h.symbol ?? 'unknown'}: missing ${missing.join(', ')}`)
        continue
      }
      const res = await fetch('/api/portfolio-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({
          symbol:     h.symbol!,
          name:       h.company ?? h.symbol!,
          entryPrice: h.price!,
          entryDate:  today,
          stopLoss:   h.stop_loss!,
          t1:         h.target_1!,
          t2:         h.target_2!,
          t3:         h.target_3!,
          status:     'active',
          exitPrice:  null,
          exitDate:   null,
          notes:      `Added from ${type === 'swing' ? 'Swing' : 'Position'} portfolio generator on ${dateLabel}`,
          source:     'portfolio_generator',
        }),
      })
      if (res.status === 401) { unauthorized = true; break }
      if (res.ok) added++
    }
    setTracking(false)
    if (unauthorized) {
      setTrackError('Admin session expired — please log in again at /admin/portfolio')
      return
    }
    setTracked(true)
    setTrackSuccess({ added, skipped })
  }
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
              {type === 'swing' ? 'Swing' : 'Position'} portfolio · ready
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Your AI portfolio</h2>
          <p className="text-sm text-surface-400">
            {summary.diversification} positions · avg score {Math.round(summary.average_score)}/100 · {deployedPct.toFixed(1)}% deployed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleTrack}
              disabled={tracking || tracked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: tracked ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(6,100,232,0.30)',
                background: 'transparent',
                color: tracked ? '#10b981' : '#0664e8',
                borderRadius: '2px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                cursor: tracking || tracked ? 'not-allowed' : 'pointer',
                opacity: tracking ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!tracking && !tracked) {
                  e.currentTarget.style.background = 'rgba(6,100,232,0.06)'
                  e.currentTarget.style.borderColor = '#0664e8'
                }
              }}
              onMouseLeave={(e) => {
                if (!tracking && !tracked) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(6,100,232,0.30)'
                }
              }}
            >
              {tracked ? (
                <span>✓ Tracked</span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="7" cy="9" r="1.5" />
                    <path d="M4.5 6.5a3.5 3.5 0 015 0" />
                    <path d="M2 4a7 7 0 0110 0" />
                  </svg>
                  {tracking ? 'Adding…' : 'Track this portfolio →'}
                </>
              )}
            </button>
          )}
          <button onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-surface-700 text-surface-500 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 1.5a4.5 4.5 0 10.9 4.5M9 1.5V5M9 1.5H5.5" />
            </svg>
            New
          </button>
        </div>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Portfolio grade',  value: grade.label,                                  color: '',                                                                               valueStyle: { color: grade.color, fontFamily: 'var(--font-display), serif', fontSize: '22px', lineHeight: '1.1' } },
          { label: 'Avg AI score',     value: `${Math.round(summary.average_score)}/100`,   color: summary.average_score >= 70 ? 'text-emerald-400' : 'text-amber-400',             valueStyle: undefined },
          { label: 'Diversification',  value: `${divScore}/10`,                             color: divScore >= 7 ? 'text-emerald-400' : divScore >= 5 ? 'text-amber-400' : 'text-rose-400', valueStyle: undefined },
          { label: 'Total budget',     value: formatINRCompact(summary.total_budget),       color: '',                                                                               valueStyle: undefined },
          { label: 'Allocated',        value: formatINRCompact(summary.total_allocated),    color: 'text-brand-cyan',                                                                valueStyle: undefined, sub: `${deployedPct.toFixed(1)}% deployed` },
          { label: 'Cash remaining',   value: formatINRCompact(summary.remaining_cash),     color: '',                                                                               valueStyle: undefined },
        ].map((c, i) => (
          <div key={c.label}
            className={cn('rounded-xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pop-in', i < 3 ? 'p-4' : 'p-3')}
            style={{ animationDelay: `${i*60}ms`, ...(i < 3 ? { borderTop: '2px solid rgba(6,100,232,0.4)' } : {}) }}
          >
            <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={cn('font-mono font-bold tabular-nums', i < 3 ? 'text-xl' : 'text-base', c.color || 'text-surface-900 dark:text-white')} style={c.valueStyle}>{c.value}</p>
            {c.sub && <p className="text-[10px] text-surface-500 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>
      {/* Allocation bar */}
      <div className="rounded-xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-3">Allocation breakdown</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-px">
          {sorted.map((h, i) => {
            const pct = h.percentage_allocation ?? 0
            return (
              <div key={h.symbol} style={{ width: `${pct}%`, background: `hsl(${190 + (i * 15) % 60}, 70%, ${55 - (i % 3) * 8}%)` }}
                className="h-full first:rounded-l-full last:rounded-r-full" title={`${h.symbol}: ${pct.toFixed(1)}%`} />
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {sorted.slice(0, 8).map((h, i) => (
            <div key={h.symbol} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: `hsl(${190 + (i * 15) % 60}, 70%, ${55 - (i % 3) * 8}%)` }} />
              <span className="text-[10px] font-mono text-surface-400">{h.symbol} {h.percentage_allocation?.toFixed(1)}%</span>
            </div>
          ))}
          {sorted.length > 8 && <span className="text-[10px] text-surface-600">+{sorted.length - 8} more</span>}
        </div>
      </div>
      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-surface-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan">
              <path d="M2 4h10M2 7h7M2 10h4" />
            </svg>
            Holdings · {portfolio?.length ?? 0} positions
          </h3>
          <span className="text-[10px] text-surface-500">Click column to sort</span>
        </div>
        <div className="relative hidden md:block">
          <div ref={tableRef} className="overflow-x-auto" onScroll={onTableScroll}>
          <table className="text-xs" style={{ width: '100%', minWidth: '1100px' }}>
            <thead>
              {/* Group header row */}
              <tr className="bg-gray-50/30 dark:bg-surface-900/30">
                <th colSpan={3} className="px-4 pb-1 pt-2" />
                <th colSpan={3} className="px-4 pb-1 pt-2 text-left text-[9px] font-semibold text-surface-600 uppercase tracking-widest" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>Position</th>
                <th colSpan={2} className="px-4 pb-1 pt-2 text-right text-[9px] font-semibold text-surface-600 uppercase tracking-widest" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>Risk</th>
                <th colSpan={3} className="px-4 pb-1 pt-2 text-right text-[9px] font-semibold text-surface-600 uppercase tracking-widest" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>Targets</th>
                <th className="px-4 pb-1 pt-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }} />
              </tr>
              <tr className="border-b border-gray-100 dark:border-surface-800 bg-gray-50/50 dark:bg-surface-900/50">
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider w-8">#</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>Stock <SortIcon k="symbol" /></th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('allocation')}>Allocation <SortIcon k="allocation" /></th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>Amount</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Entry</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Shares</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>Stop Loss</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Max Loss</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>T1</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">T2</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">T3</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-surface-500 uppercase tracking-wider cursor-pointer hover:text-white" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }} onClick={() => handleSort('score')}>Score <SortIcon k="score" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-surface-800/60">
              {sorted.map((h, i) => {
                const stopPct = h.price && h.stop_loss ? ((h.stop_loss - h.price) / h.price) * 100 : null
                return (
                  <tr key={`${h.symbol}-${i}`} className="hover:bg-gray-50/50 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="px-4 py-3 text-surface-600 font-mono tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-surface-900 dark:text-white text-sm">{h.symbol ?? '—'}</span>
                        <span className="text-[10px] text-surface-500 truncate max-w-[140px]">{h.company ?? ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono font-bold text-brand-cyan tabular-nums">{h.percentage_allocation?.toFixed(1) ?? '—'}%</span>
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-surface-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-blue/70 to-brand-cyan/70 rounded-full" style={{ width: `${Math.min(100, h.percentage_allocation ?? 0)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-surface-900 dark:text-white tabular-nums text-sm" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>{h.investment_amount ? formatINRCompact(h.investment_amount) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-surface-300 tabular-nums">{h.price ? formatINR(h.price, 0) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-surface-300 tabular-nums">{h.number_of_shares ? Math.round(h.number_of_shares) : '—'}</td>
                    <td className="px-4 py-3 text-right" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-rose-400 tabular-nums">{h.stop_loss ? formatINR(h.stop_loss, 0) : '—'}</span>
                        {stopPct != null && <span className="text-[10px] text-rose-400/60 tabular-nums">{stopPct.toFixed(1)}%</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-400 tabular-nums">{h.risk ? formatINRCompact(h.risk) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400/80 tabular-nums text-[11px]" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>{(h as HoldingWithTargets).target_1 ? formatINR((h as HoldingWithTargets).target_1!, 0) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400 tabular-nums text-[11px]">{(h as HoldingWithTargets).target_2 ? formatINR((h as HoldingWithTargets).target_2!, 0) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400/60 tabular-nums text-[11px]">{(h as HoldingWithTargets).target_3 ? formatINR((h as HoldingWithTargets).target_3!, 0) : '—'}</td>
                    <td className="px-4 py-3 text-right" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}><ScoreBadge score={h.score} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 transition-opacity duration-200"
            style={{ background: 'linear-gradient(to left, #18181b, transparent)', opacity: tableScrolled ? 0 : 1 }}
          />
        </div>
        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-50 dark:divide-surface-800/60">
          {sorted.map((h, i) => {
            const stopPct = h.price && h.stop_loss ? ((h.stop_loss - h.price) / h.price) * 100 : null
            return (
              <div key={`${h.symbol}-${i}`} className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-surface-600 font-mono w-4">{i+1}</span>
                    <div>
                      <p className="font-mono font-bold text-sm text-white">{h.symbol}</p>
                      <p className="text-[10px] text-surface-500 truncate max-w-[160px]">{h.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={h.score} />
                    <span className="font-mono font-bold text-brand-cyan text-sm">{h.percentage_allocation?.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pl-6">
                  {[
                    { label: 'Amount',    value: h.investment_amount ? formatINRCompact(h.investment_amount) : '—', color: 'text-white' },
                    { label: 'Entry',     value: h.price ? formatINR(h.price, 0) : '—',                             color: 'text-surface-300' },
                    { label: 'Shares',    value: h.number_of_shares ? String(Math.round(h.number_of_shares)) : '—', color: 'text-surface-300' },
                    { label: 'Stop Loss', value: h.stop_loss ? formatINR(h.stop_loss, 0) : '—',                     color: 'text-rose-400' },
                    { label: 'Max Loss',  value: h.risk ? formatINRCompact(h.risk) : '—',                           color: 'text-amber-400' },
                    { label: 'SL %',      value: stopPct != null ? `${stopPct.toFixed(1)}%` : '—',                  color: 'text-rose-400/70' },
                    { label: 'T1',        value: (h as HoldingWithTargets).target_1 ? formatINR((h as HoldingWithTargets).target_1!, 0) : '—', color: 'text-emerald-400' },
                    { label: 'T2',        value: (h as HoldingWithTargets).target_2 ? formatINR((h as HoldingWithTargets).target_2!, 0) : '—', color: 'text-emerald-400' },
                    { label: 'T3',        value: (h as HoldingWithTargets).target_3 ? formatINR((h as HoldingWithTargets).target_3!, 0) : '—', color: 'text-emerald-400/60' },
                  ].map(m => (
                    <div key={m.label}>
                      <p className="text-[9px] text-surface-600 uppercase tracking-wider">{m.label}</p>
                      <p className={cn('font-mono text-xs font-semibold tabular-nums', m.color)}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 pl-6">
                  <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-blue/70 to-brand-cyan/70 rounded-full" style={{ width: `${Math.min(100, h.percentage_allocation ?? 0)}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v8M4 7l4 4 4-4" /><path d="M2 13h12" />
          </svg>
          Download Portfolio
        </button>
        <button onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-surface-700 rounded-xl font-semibold text-sm text-surface-300 hover:bg-surface-800/40 transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M11.5 2a5.5 5.5 0 10.8 4.5M11.5 2v4M11.5 2H7.5" />
          </svg>
          Generate New Portfolio
        </button>
      </div>
      {/* Track result banners — admin only */}
      {trackError && (
        <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.20)', borderRadius: '10px', padding: '16px' }}>
          <p style={{ color: '#f43f5e', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', fontSize: '13px', fontWeight: 500, margin: 0 }}>
            {trackError}
          </p>
        </div>
      )}
      {trackSuccess && (
        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.20)', borderRadius: '10px', padding: '16px' }}>
          <p style={{ color: '#10b981', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>
            {trackSuccess.added} position{trackSuccess.added !== 1 ? 's' : ''} added to the live tracker
          </p>
          <a
            href="/#portfolio-tracker"
            style={{ color: '#0664e8', fontSize: '12px', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', textDecoration: 'underline' }}
          >
            View tracker on homepage →
          </a>
          {trackSuccess.skipped.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ color: '#777a88', fontSize: '12px', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', margin: '0 0 4px' }}>
                {trackSuccess.skipped.length} skipped:
              </p>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {trackSuccess.skipped.map((s) => (
                  <li key={s} style={{ color: '#777a88', fontSize: '11px', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Disclaimer */}
      <AIDisclosureNote variant="full" />
    </div>
  )
}
// ─────────────────────────────────────────────
//  WIZARD STEPPER
// ─────────────────────────────────────────────
const WIZARD_STEPS = [
  { n: 1, label: 'Strategy' },
  { n: 2, label: 'Risk'     },
  { n: 3, label: 'Budget'   },
  { n: 4, label: 'Review'   },
] as const
function WizardStepper({ step }: { step: number }) {
  return (
    <div className="flex items-start w-full">
      {WIZARD_STEPS.map((s, i) => (
        <Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
              step > s.n  ? 'bg-brand-cyan text-white'
              : step === s.n ? 'bg-gradient-to-br from-brand-blue to-brand-cyan text-white shadow-[0_0_14px_rgba(6,182,212,0.40)]'
              : 'bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-700 text-gray-400 dark:text-surface-500'
            )}>
              {step > s.n ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>
              ) : s.n}
            </div>
            <span className={cn('text-[10px] font-medium whitespace-nowrap transition-colors duration-300', step >= s.n ? 'text-surface-900 dark:text-surface-300' : 'text-gray-400 dark:text-surface-600')}>
              {s.label}
            </span>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div className={cn('h-px flex-1 mx-2 mt-4 transition-colors duration-500', step > s.n ? 'bg-brand-cyan/60' : 'bg-gray-200 dark:bg-surface-800')} />
          )}
        </Fragment>
      ))}
    </div>
  )
}
// ─────────────────────────────────────────────
//  RISK OPTIONS
// ─────────────────────────────────────────────
const RISK_OPTIONS = [
  { value: 'LOW' as RiskAppetite, label: 'Conservative', sub: 'Capital preservation', detail: 'Blue-chip stocks with strong fundamentals. Lower volatility, stable returns.', icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 2L3 6v5c0 3.31 2.69 5 6 5s6-1.69 6-5V6L9 2z" /></svg>), activeClass: 'border-emerald-400/40 bg-emerald-400/8', iconClass: 'bg-emerald-400/10 text-emerald-400', labelClass: 'text-emerald-400' },
  { value: 'MEDIUM' as RiskAppetite, label: 'Balanced', sub: 'Growth + stability', detail: 'Mix of large-cap and growth stocks. Moderate risk with better upside.', icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 10l4-4 3 3 5-6" /><path d="M14 4h3v3" /></svg>), activeClass: 'border-amber-400/40 bg-amber-400/8', iconClass: 'bg-amber-400/10 text-amber-400', labelClass: 'text-amber-400' },
  { value: 'HIGH' as RiskAppetite, label: 'Aggressive', sub: 'Maximum growth', detail: 'High-momentum and mid-cap stocks. Higher risk, higher potential reward.', icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 14l5-5 4 4 5-7" /><path d="M13 6h4v4" /></svg>), activeClass: 'border-rose-400/40 bg-rose-400/8', iconClass: 'bg-rose-400/10 text-rose-400', labelClass: 'text-rose-400' },
] as const
// ─────────────────────────────────────────────
//  PORTFOLIO PAGE
// ─────────────────────────────────────────────
type PortfolioType = 'swing' | 'position'
type WizardStep = 1 | 2 | 3 | 4
export default function PortfolioPage() {
  const [step, setStep]             = useState<WizardStep>(1)
  const [direction, setDirection]   = useState<'forward' | 'back'>('forward')
  const [type, setType]             = useState<PortfolioType>('swing')
  const [budget, setBudget]         = useState<string>('')
  const [risk, setRisk]             = useState<RiskAppetite | undefined>(undefined)
  const [timePeriod, setTimePeriod] = useState<number>(18)
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({})
  const [result, setResult]         = useState<PortfolioResponse | null>(null)
  const [resultType, setResultType] = useState<PortfolioType>('swing')
  const [currentJob, setCurrentJob] = useState<PortfolioJob | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showToast,    setShowToast]    = useState(false)
  const [restored,     setRestored]     = useState(false)   // ★ FIX 1: track whether mount-restore has run
  // ★ FIX 1: also read the saved portfolios + clear fn from the store
  const { saveSwingPortfolio, savePositionPortfolio, lastSwingPortfolio, lastPositionPortfolio, clearPortfolios } = usePortfolioStore()
  const swingMutation    = useCreateSwingPortfolio()
  const positionMutation = useCreatePositionPortfolio()
  const mutation         = type === 'swing' ? swingMutation : positionMutation
  const handleProgress   = useCallback((job: PortfolioJob) => { setCurrentJob(job) }, [])
  // ★ FIX 2: Restore last generated portfolio on mount. It IS persisted to the
  // store (localStorage), but the page previously never read it back — so
  // navigating away and returning showed the empty wizard (portfolio "lost").
  // Runs client-side only (useEffect), so no SSR hydration mismatch.
  useEffect(() => {
    if (result || restored) return
    const saved = lastSwingPortfolio ?? lastPositionPortfolio
    if (saved?.result) {
      setResult(saved.result)
      setResultType(saved.type)
    }
    setRestored(true)
  }, [result, restored, lastSwingPortfolio, lastPositionPortfolio])
  function goNext() {
    if (step === 2 && !risk) { setFormErrors({ riskAppetite: 'Please select a risk level to continue' }); return }
    if (step === 3) {
      const errors = type === 'swing'
        ? validateSwingForm({ budget: Number(budget), riskAppetite: risk })
        : validatePositionForm({ budget: Number(budget), riskAppetite: risk, timePeriod })
      const errs = errors as Record<string, string | undefined>
      if (hasErrors(errs)) { setFormErrors(errs); return }
    }
    setFormErrors({})
    setDirection('forward')
    setStep((s) => (s + 1) as WizardStep)
  }
  function goBack() {
    setFormErrors({})
    setDirection('back')
    setStep((s) => (s - 1) as WizardStep)
  }
  async function handleGenerate() {
    track.portfolioBuildStarted(type, Number(budget), risk ?? 'UNKNOWN')
    setCurrentJob({ status: 'queued', progress: 0, result: null, error: null })
    try {
      let data: PortfolioResponse
      if (type === 'swing') {
        data = await swingMutation.mutateAsync({ budget: Number(budget), riskAppetite: risk!, onProgress: handleProgress })
        saveSwingPortfolio({ type: 'swing', generatedAt: new Date().toISOString(), request: { budget: Number(budget), riskAppetite: risk! }, result: data })
      } else {
        data = await positionMutation.mutateAsync({ budget: Number(budget), riskAppetite: risk!, timePeriod: timePeriod as 9 | 18 | 36 | 60, onProgress: handleProgress })
        savePositionPortfolio({ type: 'position', generatedAt: new Date().toISOString(), request: { budget: Number(budget), riskAppetite: risk!, timePeriod: timePeriod as 9 | 18 | 36 | 60 }, result: data })
      }
      track.portfolioBuildCompleted(type, data.portfolio?.length ?? 0, Math.round(data.summary?.average_score ?? 0))
      setResult(data)
      setResultType(type)
      setRestored(true)   // ★ FIX 3: a just-generated result counts as "restored" so the mount effect won't override it
      setCurrentJob(null)
      setShowConfetti(true)
      setShowToast(true)
      setTimeout(() => setShowConfetti(false), 2000)
    } catch {
      setCurrentJob(null)
    }
  }
  function handleReset() {
    setResult(null); setStep(1); setDirection('forward')
    setBudget(''); setRisk(undefined); setTimePeriod(18)
    setFormErrors({}); setShowToast(false); setCurrentJob(null)
    swingMutation.reset(); positionMutation.reset()
    clearPortfolios()   // ★ FIX 4: clear persisted portfolio so a deliberate "new" start stays fresh
    setRestored(true)   // ★ FIX 4: prevent the just-cleared portfolio from re-restoring
  }
  const isGenerating = mutation.isPending || (currentJob !== null && currentJob.status !== 'complete' && currentJob.status !== 'failed')
  return (
    <div className="flex flex-col gap-8" style={{ maxWidth: '880px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
      {!result && (
        <div className="flex flex-col gap-2">
          <span className="hero-entry-1 block text-xs font-semibold text-brand-cyan uppercase tracking-widest">Portfolio builder</span>
          <h1 className="hero-entry-2 font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05]">Build your portfolio</h1>
          <p className="hero-entry-3 text-sm sm:text-base text-surface-400 leading-relaxed mt-1">Answer 3 quick questions — get a fully allocated NSE/BSE portfolio with position sizes and technical reference levels.</p>
        </div>
      )}
      {!result ? (
        isGenerating ? (
          <PortfolioProgress job={currentJob} />
        ) : (
          <div className="hero-entry-4 flex flex-col gap-6">
            {/* ── "What you'll get" preview ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <p style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '11px', color: '#777a88', letterSpacing: '0.02em' }}>
                Your output will look like this
              </p>
              <div style={{ pointerEvents: 'none', userSelect: 'none', display: 'flex', gap: '12px', width: '100%', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                {/* Card 1 — AI Grade */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', minWidth: '160px', flex: '1', flexShrink: 0 }}>
                  <p className="font-display" style={{ fontSize: '36px', color: '#0664e8', lineHeight: 1, margin: '0 0 6px' }}>A+</p>
                  <p style={{ filter: 'blur(1.5px)', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '11px', color: '#777a88', margin: 0 }}>Portfolio grade</p>
                </div>
                {/* Card 2 — Allocation bars */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', minWidth: '160px', flex: '1', flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px', filter: 'blur(1.5px)' }}>
                    {([['HDFC', 32, '#0664e8'], ['TCS', 24, '#10b981'], ['INFY', 18, '#06b6d4']] as const).map(([label, pct, color]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '10px', color: '#5e616e', width: '30px', flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '9999px' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '10px', color: '#5e616e', width: '26px', textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ filter: 'blur(1.5px)', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '11px', color: '#777a88', margin: 0 }}>Top holdings</p>
                </div>
                {/* Card 3 — Diversification */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', minWidth: '160px', flex: '1', flexShrink: 0 }}>
                  <p className="font-display" style={{ fontSize: '28px', color: '#10b981', lineHeight: 1, margin: '0 0 6px' }}>
                    9.2<span style={{ fontSize: '15px', opacity: 0.55 }}>/10</span>
                  </p>
                  <p style={{ filter: 'blur(1.5px)', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '11px', color: '#777a88', margin: 0 }}>Diversification score</p>
                </div>
              </div>
            </div>
            <WizardStepper step={step} />
            <div key={step} className={direction === 'forward' ? 'animate-step-in' : 'animate-step-back'}>
              {/* ── Step 1 — Strategy ── */}
              {step === 1 && (
                <div className="flex flex-col gap-4 rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">What is your goal?</p>
                    <p className="text-sm text-surface-400 mt-1">Choose a trading strategy to get started</p>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6,100,232,0.08)', border: '1px solid rgba(6,100,232,0.15)', borderRadius: '9999px', padding: '4px 12px', alignSelf: 'flex-start' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#9194a1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="6" cy="6" r="4.5" />
                      <path d="M6 3.5V6l1.5 1.5" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '12px', color: '#9194a1' }}>Takes 3–5 minutes to generate</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Swing — fully enabled */}
                    <button type="button" onClick={() => setType('swing')}
                      className={cn('relative flex flex-col gap-3 p-5 rounded-xl border text-left transition-all duration-200 active:scale-[0.98]',
                        type === 'swing'
                          ? 'bg-gradient-to-br from-brand-blue/12 to-brand-cyan/8 border-brand-cyan/35 shadow-[0_4px_20px_rgba(6,182,212,0.14)]'
                          : 'bg-white dark:bg-surface-900/60 border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600')}>
                      {type === 'swing' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-cyan flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2 2 4-4" /></svg>
                        </div>
                      )}
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', type === 'swing' ? 'bg-brand-cyan/12 border border-brand-cyan/30' : 'bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-surface-700')}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 2L4 11h7l-2 7 9-10h-7l2-8z" />
                        </svg>
                      </div>
                      <div>
                        <p className={cn('font-semibold text-sm', type === 'swing' ? 'text-brand-cyan' : 'text-surface-900 dark:text-white')}>Swing trading</p>
                        <p className="text-xs text-surface-400 mt-1 leading-relaxed">Short-term trades · 1–4 weeks · higher frequency</p>
                      </div>
                    </button>
                    {/* Position — BLOCKED with Coming Soon */}
                    <div className="relative hidden sm:flex flex-col gap-3 p-5 rounded-xl border border-gray-200 dark:border-surface-800 bg-surface-900/30 cursor-not-allowed opacity-80 select-none">
                      {/* Coming soon badge */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-surface-700 border border-surface-600">
                        <span className="text-[9px] font-bold text-surface-400 uppercase tracking-wider">Coming soon</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-surface-700">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 14l4-4 3 3 4-5 3 2" />
                          <path d="M14 7h3v3" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-surface-500">Position trading</p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#9194a1' }}>Long-term holds · 6 months – 5 years · launching soon</p>
                      </div>
                    </div>
                  </div>
                  {/* Trust signals */}
                  <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-2 sm:gap-6 pt-1">
                    {([
                      ['240+ stocks scanned', <svg key="bars" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 13V9M6 13V5M10 13V7M14 13V3" /></svg>],
                      ['AI-powered allocation', <svg key="bolt" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.5 2L4 9h5l-2 5L14 7H9l1.5-5z" /></svg>],
                      ['Risk-adjusted picks', <svg key="shield" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2L3 4.5v4c0 3 2 5 5 5s5-2 5-5v-4L8 2z" /></svg>],
                    ] as [string, React.ReactNode][]).map(([label, icon]) => (
                      <span key={label} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 text-center sm:text-left" style={{ fontSize: '11px', color: '#5e616e', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                        {icon}<span>{label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* ── Step 2 — Risk ── */}
              {step === 2 && (
                <div className="flex flex-col gap-4 rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Your risk tolerance</p>
                    <p className="text-sm text-surface-400 mt-1">This shapes how aggressively we allocate your budget</p>
                  </div>
                  {formErrors.riskAppetite && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5h1v4h-1v-4zm0 5h1v1h-1v-1z"/></svg>
                      {formErrors.riskAppetite}
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    {RISK_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => { setRisk(opt.value); setFormErrors({}) }}
                        className={cn('flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                          risk === opt.value ? opt.activeClass : 'bg-white dark:bg-surface-900/60 border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600')}>
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', opt.iconClass)}>{opt.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-semibold text-sm', risk === opt.value ? opt.labelClass : 'text-surface-900 dark:text-white')}>{opt.label}</p>
                          <p className="text-xs text-surface-500 mt-0.5">{opt.sub} · {opt.detail}</p>
                        </div>
                        {risk === opt.value && (
                          <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0', opt.iconClass)}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4" /></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* ── Step 3 — Budget ── */}
              {step === 3 && (
                <div className="flex flex-col gap-5 rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Investment details</p>
                    <p className="text-sm text-surface-400 mt-1">How much are you investing?</p>
                  </div>
                  <BudgetInput label="Investment budget" required value={budget} onChange={(e) => { setBudget(e.target.value); setFormErrors({}) }} error={formErrors.budget} />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider self-center mr-1">Quick:</span>
                    {[50000, 100000, 250000, 500000].map((amt) => (
                      <button key={amt} type="button" onClick={() => { setBudget(String(amt)); setFormErrors({}) }}
                        className={cn('px-3 py-1.5 rounded-lg border text-xs font-medium font-mono transition-all',
                          Number(budget) === amt ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan' : 'border-gray-200 dark:border-surface-700 text-surface-500 hover:border-brand-cyan/30 hover:text-brand-cyan')}>
                        ₹{(amt/1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* ── Step 4 — Review ── */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Ready to build</p>
                    <p className="text-sm text-surface-400 mt-1">Review your settings before generating</p>
                  </div>
                  <div className="premium-card p-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Strategy</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-1.5">
                          Swing trading
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Risk level</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white">{risk ? (RISK_LABELS[risk] ?? risk) : '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Budget</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white font-mono tabular-nums">{budget ? formatINR(Number(budget), 0) : '—'}</span>
                      </div>
                    </div>
                  </div>
                  {mutation.isError && (
                    <ErrorState
                      compact
                      message="Portfolio generation failed. Please try again."
                      onRetry={handleGenerate}
                      retryLabel="Try again"
                    />
                  )}
                  <div className="rounded-xl border border-brand-cyan/15 bg-brand-cyan/5 p-4">
                    <p className="text-xs text-surface-400 leading-relaxed flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-cyan shrink-0 mt-0.5"><circle cx="7" cy="7" r="5.5" /><path d="M7 5v3M7 9.5v.5" /></svg>
                      Portfolio generation scans 240 stocks — takes <strong className="text-surface-300">5–8 minutes</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Navigation buttons */}
            <div className={cn('flex gap-3', step > 1 ? 'justify-between' : 'justify-end')}>
              {step > 1 && (
                <button type="button" onClick={goBack} disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white border border-gray-200 dark:border-surface-700 hover:border-gray-400 dark:hover:border-surface-500 bg-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 3L5 7l4 4" /></svg>
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                  style={{ background: '#0664e8', color: '#ffffff', border: 'none', fontWeight: 600, padding: '12px 32px', borderRadius: '9999px', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '14px', cursor: 'pointer', transition: 'background 150ms ease', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0552c7' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0664e8' }}
                >
                  Continue
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
                </button>
              ) : (
                <Button size="lg" loading={isGenerating} onClick={handleGenerate} disabled={isGenerating} className="flex-1 sm:flex-none sm:min-w-[200px] h-11 text-[15px] font-semibold">
                  {isGenerating ? 'Starting…' : 'Build my portfolio'}
                </Button>
              )}
            </div>
          </div>
        )
      ) : (
        <div key={result?.summary?.total_budget} className="animate-slide-in-right">
          <ErrorBoundary context="PortfolioResult">
            <PortfolioResult result={result} type={resultType} onReset={handleReset} />
          </ErrorBoundary>
        </div>
      )}
      <Confetti active={showConfetti} />
      <SuccessToast show={showToast} message="Portfolio generated!" description="Your AI-powered allocation is ready." onClose={() => setShowToast(false)} />
    </div>
  )
}
