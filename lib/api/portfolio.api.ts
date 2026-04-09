import { post } from './client'
import { ValidationError } from '@/types/api.types'
import type {
  PortfolioResponse,
  SwingPortfolioRequest,
  PositionPortfolioRequest,
  TimePeriod,
} from '@/types/portfolio.types'
import type { RiskAppetite } from '@/types/stock.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sentiquant.org"

// ── Validators ─

function validateBudget(budget: unknown): number {
  const val = Number(budget)
  if (isNaN(val)) throw new ValidationError('Budget must be a valid number.')
  if (val < 10_000)     throw new ValidationError('Budget must be at least ₹10,000.')
  if (val > 10_000_000) throw new ValidationError('Budget cannot exceed ₹1,00,00,000.')
  return val
}

function validateRiskAppetite(risk: unknown): RiskAppetite {
  if (typeof risk !== 'string' || !['LOW', 'MEDIUM', 'HIGH'].includes(risk.toUpperCase())) {
    throw new ValidationError('Risk appetite must be LOW, MEDIUM, or HIGH.')
  }
  return risk.toUpperCase() as RiskAppetite
}

function validateTimePeriod(period: unknown): TimePeriod {
  const val = Number(period)
  if (![9, 18, 36, 60].includes(val)) {
    throw new ValidationError('Time period must be 9, 18, 36, or 60 months.')
  }
  return val as TimePeriod
}

// ── APIs ─

export async function createSwingPortfolio(
  req: SwingPortfolioRequest
): Promise<PortfolioResponse> {
  const budget = validateBudget(req.budget)
  const risk   = validateRiskAppetite(req.riskAppetite)

  return post<PortfolioResponse>(`${BASE_URL}/api/portfolio/swing`, {
    budget,
    risk_appetite: risk,
  })
}

export async function createPositionPortfolio(
  req: PositionPortfolioRequest
): Promise<PortfolioResponse> {
  const budget     = validateBudget(req.budget)
  const risk       = validateRiskAppetite(req.riskAppetite)
  const timePeriod = validateTimePeriod(req.timePeriod)

  return post<PortfolioResponse>(`${BASE_URL}/api/portfolio/position`, {
    budget,
    risk_appetite: risk,
    time_period:  timePeriod,
  })
}
