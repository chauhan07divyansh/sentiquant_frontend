// ─────────────────────────────────────────────
//  VALIDATORS
//  Client-side validation that EXACTLY mirrors
//  Flask backend validation rules.
//  Use these in forms before API calls fire.
// ─────────────────────────────────────────────

import type { RiskAppetite } from '@/types/stock.types'
import type { TimePeriod } from '@/types/portfolio.types'

// ── Budget ─────────────────────────────────────
// Flask: 10_000 ≤ budget ≤ 10_000_000

export const BUDGET_MIN = 10_000
export const BUDGET_MAX = 10_000_000

export function validateBudget(value: unknown): string | null {
  const num = Number(value)
  if (!value || isNaN(num))   return 'Please enter a valid budget amount.'
  if (num < BUDGET_MIN)       return `Minimum budget is ₹10,000.`
  if (num > BUDGET_MAX)       return `Maximum budget is ₹1,00,00,000.`
  return null
}

// ── Risk appetite ──────────────────────────────
// Flask: must be 'LOW', 'MEDIUM', or 'HIGH' (case-insensitive)

export const RISK_OPTIONS: RiskAppetite[] = ['LOW', 'MEDIUM', 'HIGH']

export function validateRiskAppetite(value: unknown): string | null {
  if (!value || !RISK_OPTIONS.includes((value as string)?.toUpperCase() as RiskAppetite)) {
    return 'Please select a risk level: Low, Medium, or High.'
  }
  return null
}

// ── Time period ───────────────────────────────
// Flask: must be exactly 9, 18, 36, or 60

export const TIME_PERIOD_OPTIONS_VALUES: TimePeriod[] = [9, 18, 36, 60]

export function validateTimePeriod(value: unknown): string | null {
  const num = Number(value)
  if (!TIME_PERIOD_OPTIONS_VALUES.includes(num as TimePeriod)) {
    return 'Please select a time period: 9, 18, 36, or 60 months.'
  }
  return null
}

// ── Symbol ────────────────────────────────────
// Flask: non-empty string

export function validateSymbol(value: unknown): string | null {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return 'Please enter a stock symbol.'
  }
  return null
}

// ── Combined form validators ──────────────────

export interface SwingFormErrors {
  budget?: string
  riskAppetite?: string
}

export interface PositionFormErrors {
  budget?: string
  riskAppetite?: string
  timePeriod?: string
}

export function validateSwingForm(data: {
  budget: unknown
  riskAppetite: unknown
}): SwingFormErrors {
  const errors: SwingFormErrors = {}
  const budget = validateBudget(data.budget)
  const risk   = validateRiskAppetite(data.riskAppetite)
  if (budget) errors.budget = budget
  if (risk)   errors.riskAppetite = risk
  return errors
}

export function validatePositionForm(data: {
  budget: unknown
  riskAppetite: unknown
  timePeriod: unknown
}): PositionFormErrors {
  const errors: PositionFormErrors = {}
  const budget = validateBudget(data.budget)
  const risk   = validateRiskAppetite(data.riskAppetite)
  const period = validateTimePeriod(data.timePeriod)
  if (budget) errors.budget = budget
  if (risk)   errors.riskAppetite = risk
  if (period) errors.timePeriod = period
  return errors
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}
