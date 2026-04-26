// ─────────────────────────────────────────────
//  PORTFOLIO API SERVICE
//  Wraps: POST /api/v1/portfolio/swing
//         POST /api/v1/portfolio/position
//
//  CLIENT-SIDE VALIDATION mirrors Flask exactly:
//    validate_budget()       → 10_000 – 10_000_000
//    validate_risk_appetite() → LOW | MEDIUM | HIGH
//    validate_time_period()  → 9 | 18 | 36 | 60
// ─────────────────────────────────────────────
import apiClient, { dispatchApiUsage } from './client'
import { ValidationError } from '@/types/api.types'
import type {
  PortfolioResponse,
  SwingPortfolioRequest,
  PositionPortfolioRequest,
  TimePeriod,
} from '@/types/portfolio.types'
import type { RiskAppetite } from '@/types/stock.types'

// ── Validators (intentionally strict — match Flask) ─
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

// Portfolio generation analyzes 240 stocks in parallel — can take 5-8 minutes.
// Use a dedicated 10-minute timeout instead of the default 60s.
const PORTFOLIO_TIMEOUT = 600_000

// ─────────────────────────────────────────────
//  POST /api/v1/portfolio/swing
//  Generates a swing trading portfolio.
//  Expects: { budget, risk_appetite }
//  Budget: ₹10,000 – ₹10,000,000
//  Risk:   LOW | MEDIUM | HIGH
// ─────────────────────────────────────────────
export async function createSwingPortfolio(
  req: SwingPortfolioRequest
): Promise<PortfolioResponse> {
  const budget = validateBudget(req.budget)
  const risk   = validateRiskAppetite(req.riskAppetite)

  const response = await apiClient.post<{ success: true; data: PortfolioResponse }>(
    '/api/v1/portfolio/swing',
    { budget, risk_appetite: risk },
    { timeout: PORTFOLIO_TIMEOUT }
  )

  dispatchApiUsage('portfolio')
  return response.data.data
}

// ─────────────────────────────────────────────
//  POST /api/v1/portfolio/position
//  Generates a position/long-term portfolio.
//  Expects: { budget, risk_appetite, time_period }
//  Budget:      ₹10,000 – ₹10,000,000
//  Risk:        LOW | MEDIUM | HIGH
//  Time period: 9 | 18 | 36 | 60 (months)
// ─────────────────────────────────────────────
export async function createPositionPortfolio(
  req: PositionPortfolioRequest
): Promise<PortfolioResponse> {
  const budget     = validateBudget(req.budget)
  const risk       = validateRiskAppetite(req.riskAppetite)
  const timePeriod = validateTimePeriod(req.timePeriod)

  const response = await apiClient.post<{ success: true; data: PortfolioResponse }>(
    '/api/v1/portfolio/position',
    { budget, risk_appetite: risk, time_period: timePeriod },
    { timeout: PORTFOLIO_TIMEOUT }
  )

  dispatchApiUsage('portfolio')
  return response.data.data
}
