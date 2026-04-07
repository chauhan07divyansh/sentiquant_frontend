// ─────────────────────────────────────────────
//  FORMATTERS
//  All display-layer formatting for Sentiquant.
//  Indian market conventions (₹, Lakhs, Crores).
// ─────────────────────────────────────────────

import type { InvestmentGrade, SignalStrength } from '@/types/stock.types'

// ── Currency ──────────────────────────────────

/**
 * Format a number as Indian Rupees.
 * e.g. 1234567.89 → "₹12,34,567.89"
 */
export function formatINR(value: number, decimals = 2): string {
  if (isNaN(value)) return '₹—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Compact format for large amounts.
 * e.g. 1_500_000 → "₹15 L"  |  10_000_000 → "₹1 Cr"
 */
export function formatINRCompact(value: number): string {
  if (isNaN(value)) return '₹—'
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`
  if (value >= 100_000)    return `₹${(value / 100_000).toFixed(2)} L`
  if (value >= 1_000)      return `₹${(value / 1_000).toFixed(1)} K`
  return formatINR(value, 0)
}

// ── Percentage ────────────────────────────────

/**
 * Format a decimal or percentage value with sign.
 * e.g.  12.34  → "+12.34%"
 *       -5.2   → "-5.20%"
 */
export function formatPercent(value: number, decimals = 2): string {
  if (isNaN(value)) return '—%'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

// ── Score / Grade ─────────────────────────────

export function gradeColor(grade: InvestmentGrade): string {
  const map: Record<InvestmentGrade, string> = {
    'A+ (Excellent)':   'text-emerald-400',
    'A (Good)':         'text-green-400',
    'B (Average)':      'text-amber-400',
    'C (Below Average)':'text-orange-400',
    'D (Poor)':         'text-red-400',
  }
  return map[grade] ?? 'text-zinc-400'
}

export function gradeBg(grade: InvestmentGrade): string {
  const map: Record<InvestmentGrade, string> = {
    'A+ (Excellent)':   'bg-emerald-400/10 border-emerald-400/30',
    'A (Good)':         'bg-green-400/10 border-green-400/30',
    'B (Average)':      'bg-amber-400/10 border-amber-400/30',
    'C (Below Average)':'bg-orange-400/10 border-orange-400/30',
    'D (Poor)':         'bg-red-400/10 border-red-400/30',
  }
  return map[grade] ?? 'bg-zinc-400/10 border-zinc-400/30'
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 70) return 'bg-green-400'
  if (score >= 60) return 'bg-amber-400'
  if (score >= 50) return 'bg-orange-400'
  return 'bg-red-400'
}

// ── Signal ────────────────────────────────────

export function signalColor(strength: SignalStrength): string {
  const map: Record<SignalStrength, string> = {
    'strong-buy': 'text-emerald-400',
    'buy':        'text-green-400',
    'hold':       'text-amber-400',
    'sell':       'text-orange-400',
    'avoid':      'text-red-400',
    'unknown':    'text-zinc-400',
  }
  return map[strength]
}

export function signalBg(strength: SignalStrength): string {
  const map: Record<SignalStrength, string> = {
    'strong-buy': 'bg-emerald-400/10 border-emerald-400/30',
    'buy':        'bg-green-400/10 border-green-400/30',
    'hold':       'bg-amber-400/10 border-amber-400/30',
    'sell':       'bg-orange-400/10 border-orange-400/30',
    'avoid':      'bg-red-400/10 border-red-400/30',
    'unknown':    'bg-zinc-700/50 border-zinc-600/30',
  }
  return map[strength]
}

export function signalLabel(strength: SignalStrength): string {
  const map: Record<SignalStrength, string> = {
    'strong-buy': 'Strong Buy',
    'buy':        'Buy',
    'hold':       'Hold / Watch',
    'sell':       'Sell',
    'avoid':      'Avoid',
    'unknown':    'No Signal',
  }
  return map[strength]
}

// ── Numbers ───────────────────────────────────

export function formatNumber(value: number, decimals = 2): string {
  if (isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Relative time e.g. "2 minutes ago" */
export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
