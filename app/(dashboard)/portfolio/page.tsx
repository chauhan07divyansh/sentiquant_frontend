'use client'

import { Fragment, useState } from 'react'
// ENHANCEMENT: Success celebration components
import { Confetti }      from '@/components/ui/Confetti'
import { SuccessToast }  from '@/components/ui/SuccessToast'
import { useCreateSwingPortfolio, useCreatePositionPortfolio } from '@/hooks/useQueryHooks'
import { usePortfolioStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { BudgetInput, RiskSelector, Select } from '@/components/ui/Input'
import { StatCard } from '@/components/ui/Card'
import { PortfolioTableSkeleton } from '@/components/ui/Skeleton'
import { ScoreBar } from '@/components/ui/DataDisplay'
import { ErrorState } from '@/components/common/DegradedBanner'
import { validateSwingForm, validatePositionForm, hasErrors } from '@/lib/utils/validators'
import { formatINR, formatINRCompact } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import { TIME_PERIOD_OPTIONS } from '@/types/portfolio.types'
import type { RiskAppetite } from '@/types/stock.types'
import type { PortfolioResponse, PortfolioHolding } from '@/types/portfolio.types'

// ─────────────────────────────────────────────
//  PORTFOLIO HOLDINGS TABLE
// ─────────────────────────────────────────────
function HoldingsTable({ holdings }: { holdings: PortfolioHolding[] }) {
  return (
    <div className="overflow-x-auto px-2 pb-2">
      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '180px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '80px' }} />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-100 dark:border-surface-700/60 bg-gray-50/80 dark:bg-surface-900/60 backdrop-blur-sm">
            {['Stock', 'Score', 'Price', 'Stop loss', 'Invested', 'Shares', 'Alloc %'].map((h) => (
              <th key={h} className="text-left py-3.5 px-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-surface-800/40">
          {holdings.map((h, i) => (
            <tr key={`${h.symbol}-${i}`} className="group hover:bg-gray-50 dark:hover:bg-surface-800/40 transition-all duration-150">
              {/* Stock */}
              <td className="py-3.5 px-3">
                <div className="font-mono font-semibold text-surface-900 dark:text-white tracking-tight truncate">{h.symbol ?? '—'}</div>
                <div className="text-[11px] text-surface-500 truncate mt-0.5">{h.company ?? ''}</div>
              </td>
              {/* Score */}
              <td className="py-3 px-3">
                {h.score != null ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-surface-900 dark:text-white tabular-nums">{Math.round(h.score)}</span>
                    <ScoreBar score={h.score} size="sm" showValue={false} />
                  </div>
                ) : <span className="text-surface-600">—</span>}
              </td>
              {/* Price */}
              <td className="py-3 px-3 font-mono text-surface-900 dark:text-white tabular-nums">
                {h.price ? formatINR(h.price, 0) : '—'}
              </td>
              {/* Stop loss */}
              <td className="py-3.5 px-3 font-mono text-rose-400 tabular-nums text-right">
                {h.stop_loss ? formatINR(h.stop_loss, 0) : '—'}
              </td>
              {/* Invested */}
              <td className="py-3.5 px-3 font-mono text-surface-900 dark:text-white tabular-nums text-right">
                {h.investment_amount ? formatINRCompact(h.investment_amount) : '—'}
              </td>
              {/* Shares */}
              <td className="py-3.5 px-3 font-mono text-surface-900 dark:text-white tabular-nums text-right">
                {h.number_of_shares ? Math.round(h.number_of_shares) : '—'}
              </td>
              {/* Allocation */}
              <td className="py-3 px-3">
                {h.percentage_allocation != null ? (
                  <div className="flex flex-col gap-1.5 items-end">
                    <span className="font-mono text-brand-cyan tabular-nums">
                      {h.percentage_allocation.toFixed(1)}%
                    </span>
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-blue/70 to-brand-cyan/70 rounded-full"
                        style={{ width: `${Math.min(100, h.percentage_allocation)}%` }}
                      />
                    </div>
                  </div>
                ) : <span className="text-surface-600">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PORTFOLIO RESULT
// ─────────────────────────────────────────────
function PortfolioResult({
  result,
  type,
  onReset,
}: {
  result: PortfolioResponse
  type: 'swing' | 'position'
  onReset: () => void
}) {
  const { summary, portfolio } = result

  return (
    <div className="flex flex-col gap-6">

      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
            {type === 'swing' ? 'Swing' : 'Position'} portfolio
          </span>
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white tracking-tight">
            Your allocation
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white border border-gray-200 dark:border-surface-700 hover:border-gray-400 dark:hover:border-surface-500 bg-transparent transition-all duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l4 4-4 4M7 5h4" />
          </svg>
          New portfolio
        </button>
      </div>

      {/* Summary stats */}
      {/* ANIMATION: animate-pop-in with staggered delays — cards spring in sequentially */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <div className="animate-pop-in" style={{ animationDelay: '0ms' }}>
          <StatCard
            label="Total budget"
            value={
              <span className="font-mono text-xl tabular-nums text-surface-900 dark:text-white">
                {formatINRCompact(summary.total_budget)}
              </span>
            }
            className="bg-white dark:bg-surface-900/60 border-gray-200 dark:border-surface-700/60"
          />
        </div>

        {/* Allocated (highlighted) */}
        <div className="animate-pop-in" style={{ animationDelay: '80ms' }}>
          <StatCard
            label="Allocated"
            value={
              <span className="font-mono text-xl tabular-nums text-brand-cyan">
                {formatINRCompact(summary.total_allocated)}
              </span>
            }
            sub={
              <span className="text-xs text-surface-400">
                {((summary.total_allocated / summary.total_budget) * 100).toFixed(1)}% deployed
              </span>
            }
            className="relative bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 border border-brand-cyan/30 shadow-[0_8px_30px_rgba(6,182,212,0.15)]"
          />
        </div>

        <div className="animate-pop-in" style={{ animationDelay: '160ms' }}>
          <StatCard
            label="Cash remaining"
            value={
              <span className="font-mono text-xl tabular-nums text-surface-900 dark:text-white">
                {formatINRCompact(summary.remaining_cash)}
              </span>
            }
            className="bg-white dark:bg-surface-900/60 border-gray-200 dark:border-surface-700/60"
          />
        </div>

        <div className="animate-pop-in" style={{ animationDelay: '240ms' }}>
          <StatCard
            label="Stocks"
            value={
              <span className="font-mono text-xl tabular-nums text-surface-900 dark:text-white">
                {summary.diversification}
              </span>
            }
            sub={
              <span className="text-xs text-surface-400">
                Avg score {summary.average_score.toFixed(0)}/100
              </span>
            }
            className="bg-white dark:bg-surface-900/60 border-gray-200 dark:border-surface-700/60"
          />
        </div>

      </div>

      {/* Holdings table */}
      {portfolio && portfolio.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-surface-800 bg-gray-50/80 dark:bg-surface-900/60 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
              Holdings · {portfolio.length} positions
            </span>
          </div>
          <HoldingsTable holdings={portfolio} />
        </div>
      )}

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
          {/* Circle + label */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
              step > s.n
                ? 'bg-brand-cyan text-white'
                : step === s.n
                  ? 'bg-gradient-to-br from-brand-blue to-brand-cyan text-white shadow-[0_0_14px_rgba(6,182,212,0.40)]'
                  : 'bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-700 text-gray-400 dark:text-surface-500'
            )}>
              {step > s.n ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              ) : s.n}
            </div>
            <span className={cn(
              'text-[10px] font-medium whitespace-nowrap transition-colors duration-300',
              step >= s.n ? 'text-surface-900 dark:text-surface-300' : 'text-gray-400 dark:text-surface-600'
            )}>
              {s.label}
            </span>
          </div>
          {/* Connector line */}
          {i < WIZARD_STEPS.length - 1 && (
            <div className={cn(
              'h-px flex-1 mx-2 mt-4 transition-colors duration-500',
              step > s.n
                ? 'bg-brand-cyan/60'
                : 'bg-gray-200 dark:bg-surface-800'
            )} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  PORTFOLIO PAGE — WIZARD
// ─────────────────────────────────────────────
type PortfolioType = 'swing' | 'position'
type WizardStep = 1 | 2 | 3 | 4

const RISK_LABELS: Record<string, string> = {
  LOW:    'Conservative',
  MEDIUM: 'Moderate',
  HIGH:   'Aggressive',
}

export default function PortfolioPage() {
  const [step, setStep] = useState<WizardStep>(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [type, setType] = useState<PortfolioType>('swing')
  const [budget, setBudget] = useState<string>('')
  const [risk, setRisk] = useState<RiskAppetite | undefined>(undefined)
  const [timePeriod, setTimePeriod] = useState<number>(18)
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({})
  const [result, setResult] = useState<PortfolioResponse | null>(null)
  const [resultType, setResultType] = useState<PortfolioType>('swing')
  // ENHANCEMENT: Success animation state
  const [showConfetti, setShowConfetti] = useState(false)
  const [showToast,    setShowToast]    = useState(false)

  const { saveSwingPortfolio, savePositionPortfolio } = usePortfolioStore()
  const swingMutation    = useCreateSwingPortfolio()
  const positionMutation = useCreatePositionPortfolio()
  const mutation         = type === 'swing' ? swingMutation : positionMutation

  // ── Wizard navigation ──────────────────────
  function goNext() {
    if (step === 2 && !risk) {
      setFormErrors({ riskAppetite: 'Please select a risk level to continue' })
      return
    }
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
    try {
      let data: PortfolioResponse
      if (type === 'swing') {
        data = await swingMutation.mutateAsync({ budget: Number(budget), riskAppetite: risk! })
        saveSwingPortfolio({
          type: 'swing',
          generatedAt: new Date().toISOString(),
          request: { budget: Number(budget), riskAppetite: risk! },
          result: data,
        })
      } else {
        data = await positionMutation.mutateAsync({ budget: Number(budget), riskAppetite: risk!, timePeriod: timePeriod as 9 | 18 | 36 | 60 })
        savePositionPortfolio({
          type: 'position',
          generatedAt: new Date().toISOString(),
          request: { budget: Number(budget), riskAppetite: risk!, timePeriod: timePeriod as 9 | 18 | 36 | 60 },
          result: data,
        })
      }
      setResult(data)
      setResultType(type)
      // ENHANCEMENT: Trigger confetti burst + success toast on successful generation
      setShowConfetti(true)
      setShowToast(true)
      setTimeout(() => setShowConfetti(false), 3500)
    } catch {
      // Error shown by mutation.error below
    }
  }

  function handleReset() {
    setResult(null)
    setStep(1)
    setDirection('forward')
    setBudget('')
    setRisk(undefined)
    setTimePeriod(18)
    setFormErrors({})
    setShowToast(false)
    swingMutation.reset()
    positionMutation.reset()
  }

  const timePeriodLabel = TIME_PERIOD_OPTIONS.find((o) => o.value === timePeriod)?.label ?? '18 months'

  // ── Render ─────────────────────────────────
  return (
    <div className="flex flex-col gap-8 dashboard-container-narrow">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-2">
        <span className="hero-entry-1 block text-xs font-semibold text-brand-cyan uppercase tracking-widest">
          Portfolio builder
        </span>
        <h1 className="hero-entry-2 font-display text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight leading-[1.05]">
          Build your portfolio
        </h1>
        <p className="hero-entry-3 text-sm sm:text-base text-surface-400 leading-relaxed mt-1">
          Answer 3 quick questions — get a fully allocated NSE/BSE portfolio with position sizes and stop-losses.
        </p>
      </div>

      {!result ? (
        mutation.isPending ? (
          <PortfolioTableSkeleton rows={8} />
        ) : (
          <div className="hero-entry-4 flex flex-col gap-6">

            {/* ── Progress stepper ── */}
            <WizardStepper step={step} />

            {/* ── Step content — keyed so React re-mounts on change, triggering animation ── */}
            <div
              key={step}
              className={direction === 'forward' ? 'animate-step-in' : 'animate-step-back'}
            >

              {/* Step 1 — Strategy */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">What is your goal?</p>
                    <p className="text-sm text-surface-400 mt-1">Choose a trading strategy to get started</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['swing', 'position'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={cn(
                          'relative flex flex-col gap-3 p-5 rounded-xl border text-left transition-all duration-200 active:scale-[0.98]',
                          type === t
                            ? 'bg-gradient-to-br from-brand-blue/12 to-brand-cyan/8 border-brand-cyan/35 shadow-[0_4px_20px_rgba(6,182,212,0.14)]'
                            : 'bg-white dark:bg-surface-900/60 border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600'
                        )}
                      >
                        {type === t && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-cyan flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 5l2 2 4-4" />
                            </svg>
                          </div>
                        )}

                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                          type === t
                            ? 'bg-brand-cyan/12 border border-brand-cyan/30'
                            : 'bg-gray-100 dark:bg-surface-800/60 border border-gray-200 dark:border-surface-700'
                        )}>
                          <span aria-hidden="true">{t === 'swing' ? '⚡' : '📈'}</span>
                        </div>

                        <div>
                          <p className={cn(
                            'font-semibold text-sm',
                            type === t ? 'text-brand-cyan' : 'text-surface-900 dark:text-white'
                          )}>
                            {t === 'swing' ? 'Swing trading' : 'Position trading'}
                          </p>
                          <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                            {t === 'swing'
                              ? 'Short-term trades · 1–4 weeks · higher frequency'
                              : 'Long-term holds · 6 months – 5 years · lower frequency'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Risk Profile */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Your risk tolerance</p>
                    <p className="text-sm text-surface-400 mt-1">This shapes how aggressively we allocate your budget</p>
                  </div>
                  <RiskSelector
                    value={risk}
                    onChange={(v) => { setRisk(v); setFormErrors({}) }}
                    error={formErrors.riskAppetite}
                  />
                </div>
              )}

              {/* Step 3 — Budget & Timeline */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Investment details</p>
                    <p className="text-sm text-surface-400 mt-1">How much are you investing?</p>
                  </div>
                  <BudgetInput
                    label="Investment budget"
                    required
                    value={budget}
                    onChange={(e) => { setBudget(e.target.value); setFormErrors({}) }}
                    error={formErrors.budget}
                  />
                  {type === 'position' && (
                    <>
                      <div className="h-px bg-gray-100 dark:bg-surface-800" />
                      <Select
                        label="Investment horizon"
                        required
                        value={String(timePeriod)}
                        onChange={(e) => setTimePeriod(Number(e.target.value))}
                        error={formErrors.timePeriod}
                        options={TIME_PERIOD_OPTIONS.map((o) => ({
                          value: o.value,
                          label: `${o.label} — ${o.description}`,
                        }))}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Step 4 — Review & Generate */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-lg">Ready to build</p>
                    <p className="text-sm text-surface-400 mt-1">Review your settings before generating</p>
                  </div>

                  {/* Summary review card */}
                  <div className="premium-card p-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Strategy</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-1.5">
                          <span aria-hidden="true">{type === 'swing' ? '⚡' : '📈'}</span>
                          {type === 'swing' ? 'Swing trading' : 'Position trading'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Risk level</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white">
                          {risk ? (RISK_LABELS[risk] ?? risk) : '—'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Budget</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white font-mono tabular-nums">
                          {budget ? formatINR(Number(budget), 0) : '—'}
                        </span>
                      </div>
                      {type === 'position' && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Horizon</span>
                          <span className="text-sm font-semibold text-surface-900 dark:text-white">{timePeriodLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* API error */}
                  {mutation.error && <ErrorState error={mutation.error} compact />}

                  {mutation.isPending && (
                    <p className="text-xs text-surface-500 text-center animate-pulse">
                      Scanning 250+ stocks in real time — takes up to 60 seconds. Hang tight.
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* ── Navigation buttons ── */}
            <div className={cn('flex gap-3', step > 1 ? 'justify-between' : 'justify-end')}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={mutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white border border-gray-200 dark:border-surface-700 hover:border-gray-400 dark:hover:border-surface-500 bg-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M9 3L5 7l4 4" />
                  </svg>
                  Back
                </button>
              )}

              {step < 4 ? (
                <Button size="md" onClick={goNext}>
                  Continue
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M5 3l4 4-4 4" />
                  </svg>
                </Button>
              ) : (
                <Button
                  size="lg"
                  loading={mutation.isPending}
                  onClick={handleGenerate}
                  disabled={mutation.isPending}
                  className="flex-1 sm:flex-none sm:min-w-[200px] h-11 text-[15px] font-semibold"
                >
                  {mutation.isPending ? 'Building portfolio…' : 'Build my portfolio'}
                </Button>
              )}
            </div>

          </div>
        )
      ) : (
        /* ANIMATION: key re-mounts on each new result, re-triggering slide-in */
        <div key={result?.summary?.total_budget} className="animate-slide-in-right">
          <PortfolioResult
            result={result}
            type={resultType}
            onReset={handleReset}
          />
        </div>
      )}

      {/* ENHANCEMENT: Confetti burst + toast on successful portfolio generation */}
      <Confetti active={showConfetti} />
      <SuccessToast
        show={showToast}
        message="Portfolio generated!"
        description="Your AI-powered allocation is ready. Review the positions below."
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}
