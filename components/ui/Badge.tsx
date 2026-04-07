import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'
import type { SignalStrength } from '@/types/stock.types'
import type { InvestmentGrade } from '@/types/stock.types'
import type { RiskAppetite } from '@/types/stock.types'

// ─────────────────────────────────────────────
//  GENERIC BADGE
// ─────────────────────────────────────────────

const colorMap = {
  teal:    'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan',
  indigo:  'bg-brand-blue/10 border-brand-blue/30 text-brand-blue',
  success: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
  warning: 'bg-amber-400/10 border-amber-400/30 text-amber-400',
  danger:  'bg-rose-400/10 border-rose-400/30 text-rose-400',
  neutral: 'bg-surface-800 border-surface-700 text-surface-400',
  orange:  'bg-orange-400/10 border-orange-400/30 text-orange-400',
} as const

export type BadgeColor = keyof typeof colorMap

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?:   BadgeColor
  dot?:     boolean
  size?:    'sm' | 'md'
}

export function Badge({
  color   = 'neutral',
  dot     = false,
  size    = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        colorMap[color],
        size === 'sm' && 'text-[10px] px-1.5 py-0.5',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            color === 'success' && 'bg-emerald-400 animate-pulse-soft',
            color === 'danger'  && 'bg-rose-400',
            color === 'warning' && 'bg-amber-400',
            color === 'teal'    && 'bg-brand-cyan',
            color === 'indigo'  && 'bg-brand-blue',
            color === 'neutral' && 'bg-surface-500',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────
//  SIGNAL BADGE — maps SignalStrength → colors
// ─────────────────────────────────────────────

const signalColorMap: Record<SignalStrength, BadgeColor> = {
  'strong-buy': 'success',
  'buy':        'teal',
  'hold':       'warning',
  'sell':       'orange',
  'avoid':      'danger',
  'unknown':    'neutral',
}

const signalLabelMap: Record<SignalStrength, string> = {
  'strong-buy': 'Strong Buy',
  'buy':        'Buy',
  'hold':       'Hold',
  'sell':       'Sell',
  'avoid':      'Avoid',
  'unknown':    'No Signal',
}

interface SignalBadgeProps {
  strength:   SignalStrength
  className?: string
  showDot?:   boolean
}

export function SignalBadge({ strength, className, showDot = true }: SignalBadgeProps) {
  return (
    <Badge
      color={signalColorMap[strength]}
      dot={showDot}
      className={cn('font-semibold', className)}
    >
      {signalLabelMap[strength]}
    </Badge>
  )
}

// ─────────────────────────────────────────────
//  GRADE BADGE — investment grade
// ─────────────────────────────────────────────

const gradeColorMap: Record<InvestmentGrade, BadgeColor> = {
  'A+ (Excellent)':   'success',
  'A (Good)':         'teal',
  'B (Average)':      'warning',
  'C (Below Average)':'orange',
  'D (Poor)':         'danger',
}

const gradeLabelMap: Record<InvestmentGrade, string> = {
  'A+ (Excellent)':   'A+',
  'A (Good)':         'A',
  'B (Average)':      'B',
  'C (Below Average)':'C',
  'D (Poor)':         'D',
}

interface GradeBadgeProps {
  grade:      InvestmentGrade
  showFull?:  boolean
  className?: string
}

export function GradeBadge({ grade, showFull = false, className }: GradeBadgeProps) {
  return (
    <Badge
      color={gradeColorMap[grade]}
      className={cn('font-bold tracking-wider', className)}
    >
      {showFull ? grade : gradeLabelMap[grade]}
    </Badge>
  )
}

// ─────────────────────────────────────────────
//  RISK BADGE — portfolio risk appetite
// ─────────────────────────────────────────────

const riskColorMap: Record<RiskAppetite, BadgeColor> = {
  LOW:    'success',
  MEDIUM: 'warning',
  HIGH:   'danger',
}

const riskLabelMap: Record<RiskAppetite, string> = {
  LOW:    'Conservative',
  MEDIUM: 'Balanced',
  HIGH:   'Aggressive',
}

interface RiskBadgeProps {
  risk:       RiskAppetite
  className?: string
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  return (
    <Badge color={riskColorMap[risk]} dot className={className}>
      {riskLabelMap[risk]}
    </Badge>
  )
}

// ─────────────────────────────────────────────
//  LIVE BADGE — for real-time indicators
// ─────────────────────────────────────────────
export function LiveBadge({ className }: { className?: string }) {
  return (
    <Badge color="success" dot className={className}>
      Live
    </Badge>
  )
}

// ─────────────────────────────────────────────
//  SYSTEM TYPE BADGE — Swing / Position
// ─────────────────────────────────────────────
export function SystemBadge({
  type,
  className,
}: {
  type: 'Swing' | 'Position'
  className?: string
}) {
  return (
    <Badge color={type === 'Swing' ? 'teal' : 'indigo'} className={className}>
      {/* UX: aria-hidden on decorative emoji */}
      {type === 'Swing'
        ? <><span aria-hidden="true">⚡</span>{' '}Swing</>
        : <><span aria-hidden="true">📈</span>{' '}Position</>}
    </Badge>
  )
}
