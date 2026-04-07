import { cn } from '@/lib/utils/cn'
import { scoreBarColor } from '@/lib/utils/formatters'
import type { TradingPlan } from '@/types/stock.types'
import { classifySignal } from '@/types/stock.types'
import { SignalBadge } from './Badge'

// ─────────────────────────────────────────────
//  SCORE BAR — animated, colour-coded 0–100
// ─────────────────────────────────────────────
interface ScoreBarProps {
  score:     number
  label?:    string
  showValue?: boolean
  className?: string
  size?:     'sm' | 'md'
}

export function ScoreBar({
  score,
  label,
  showValue = true,
  className,
  size = 'md',
}: ScoreBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const color = scoreBarColor(clampedScore)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-surface-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-mono font-semibold text-surface-900 dark:text-white tabular-nums">
              {clampedScore.toFixed(0)}
              <span className="text-surface-500 font-normal">/100</span>
            </span>
          )}
        </div>
      )}
      <div className={cn('score-bar-track', size === 'sm' && 'h-1')}>
        <div
          className={cn('score-bar-fill', color)}
          style={
            {
              '--score-width': `${clampedScore}%`,
              width: `${clampedScore}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  TRADING PLAN GRID — displays all plan fields
// ─────────────────────────────────────────────
interface TradingPlanGridProps {
  plan:       TradingPlan
  className?: string
}

const planFields = [
  { key: 'entry_price', label: 'Entry' },
  { key: 'stop_loss',   label: 'Stop loss' },
  { key: 'target_1',    label: 'Target 1' },
  { key: 'target_2',    label: 'Target 2' },
  { key: 'target_3',    label: 'Target 3' },
] as const

export function TradingPlanGrid({ plan, className }: TradingPlanGridProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Signal */}
      <div className="flex items-center gap-2">
        <SignalBadge strength={classifySignal(plan.signal)} />
        <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">
          {plan.strategy}
        </p>
      </div>

      {/* Price levels */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {planFields.map(({ key, label }) => {
          const value = plan[key]
          const isNA = !value || value === 'N/A'

          const dotColor =
            key === 'stop_loss'
              ? 'bg-rose-400'
              : key === 'entry_price'
              ? 'bg-amber-400'
              : 'bg-brand-cyan'

          return (
            <div
              key={key}
              className="flex flex-col gap-1 p-2.5 rounded-lg bg-surface-800/60 border border-surface-800"
            >
              <div className="flex items-center gap-1.5">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
                <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <span
                className={cn(
                  'text-sm font-mono font-semibold tabular-nums leading-none',
                  isNA ? 'text-surface-600' : 'text-white',
                  key === 'stop_loss' && !isNA && 'text-rose-400',
                )}
              >
                {isNA ? '—' : `₹${value}`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Trailing stop advice */}
      {plan.trailing_stop_advice && (
        <p className="text-xs text-surface-500 leading-relaxed border-l-2 border-brand-blue/30 pl-3">
          {plan.trailing_stop_advice}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  CHANGE INDICATOR — shows +/- returns
// ─────────────────────────────────────────────
interface ChangeProps {
  value:      number   // percentage
  className?: string
  size?:      'xs' | 'sm' | 'md'
}

export function Change({ value, className, size = 'sm' }: ChangeProps) {
  const isPositive = value > 0
  const isZero     = value === 0
  const sign       = isPositive ? '+' : ''

  const sizeClass = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm',
  }[size]

  return (
    <span
      className={cn(
        'font-mono font-semibold tabular-nums inline-flex items-center gap-0.5',
        sizeClass,
        isZero     && 'text-surface-400',
        isPositive && 'text-emerald-400',
        !isPositive && !isZero && 'text-rose-400',
        className
      )}
    >
      {!isZero && (
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
          className={cn('shrink-0', !isPositive && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="M5 2l4 5H1l4-5z"/>
        </svg>
      )}
      {sign}{Math.abs(value).toFixed(2)}%
    </span>
  )
}

// ─────────────────────────────────────────────
//  DIVIDER with optional label
// ─────────────────────────────────────────────
export function Divider({ label, className }: { label?: string; className?: string }) {
  if (!label) return <hr className={cn('border-surface-800', className)} />
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <hr className="flex-1 border-surface-800" />
      <span className="text-xs text-surface-600 uppercase tracking-widest">{label}</span>
      <hr className="flex-1 border-surface-800" />
    </div>
  )
}
