// ─────────────────────────────────────────────
//  PORTFOLIO API SERVICE
//  Uses async job polling to bypass Cloudflare's 100s timeout.
//  Flow: POST /start → get job_id → poll /job/:id every 5s → return result
//
//  CLIENT-SIDE VALIDATION mirrors Flask exactly:
//    validate_budget()       → 10_000 – 10_000_000
//    validate_risk_appetite() → LOW | MEDIUM | HIGH
//    validate_time_period()  → 9 | 18 | 36 | 60
// ─────────────────────────────────────────────
import apiClient, { dispatchApiUsage, get, post } from './client'
import { ValidationError, BackendError } from '@/types/api.types'
import type {
  PortfolioResponse,
  SwingPortfolioRequest,
  PositionPortfolioRequest,
  TimePeriod,
  TrackedPortfolio,
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

// ── Job types ─────────────────────────────────
export interface PortfolioJob {
  status:   'queued' | 'processing' | 'complete' | 'failed'
  progress: number   // 0–100
  result:   PortfolioResponse | null
  error:    string | null
}

const POLL_INTERVAL = 5_000    // poll every 5 seconds
const POLL_TIMEOUT  = 600_000  // give up after 10 minutes

// ── Poll until job is done ─────────────────────
async function pollJob(
  jobId: string,
  onProgress?: (job: PortfolioJob) => void
): Promise<PortfolioResponse> {
  const start = Date.now()

  while (Date.now() - start < POLL_TIMEOUT) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL))

    const res = await apiClient.get<{ success: true; data: PortfolioJob }>(
      `/api/v1/portfolio/job/${jobId}`
    )
    const job = res.data.data
    onProgress?.(job)

    if (job.status === 'complete' && job.result) return job.result
    if (job.status === 'failed') {
      throw new BackendError(job.error ?? 'Portfolio generation failed', 500)
    }
  }

  throw new BackendError('Portfolio generation timed out. Please try again.', 408)
}

// ─────────────────────────────────────────────
//  POST /api/v1/portfolio/swing/start
//  Starts swing portfolio job → polls → returns result.
//  onProgress: called every 5s with current job state (for progress UI).
// ─────────────────────────────────────────────
export async function createSwingPortfolio(
  req: SwingPortfolioRequest & { onProgress?: (job: PortfolioJob) => void }
): Promise<PortfolioResponse> {
  const { onProgress, ...rest } = req
  const budget = validateBudget(rest.budget)
  const risk   = validateRiskAppetite(rest.riskAppetite)

  const startRes = await apiClient.post<{ success: true; job_id: string }>(
    '/api/v1/portfolio/swing/start',
    { budget, risk_appetite: risk }
  )
  const jobId = startRes.data.job_id

  const result = await pollJob(jobId, onProgress)
  dispatchApiUsage('portfolio')
  return { ...result, job_id: jobId }
}

// ─────────────────────────────────────────────
//  POST /api/v1/portfolio/track
//  Persists a completed swing job into the user's tracked portfolios.
// ─────────────────────────────────────────────
export async function trackPortfolio(jobId: string): Promise<TrackedPortfolio> {
  return post<TrackedPortfolio>('/api/v1/portfolio/track', { job_id: jobId })
}

// ─────────────────────────────────────────────
//  GET /api/v1/portfolio/tracked
//  Returns the logged-in user's active tracked portfolios.
// ─────────────────────────────────────────────
export async function getTrackedPortfolios(): Promise<TrackedPortfolio[]> {
  return get<TrackedPortfolio[]>('/api/v1/portfolio/tracked')
}

// ─────────────────────────────────────────────
//  POST /api/v1/portfolio/position/start
//  Starts position portfolio job → polls → returns result.
// ─────────────────────────────────────────────
export async function createPositionPortfolio(
  req: PositionPortfolioRequest & { onProgress?: (job: PortfolioJob) => void }
): Promise<PortfolioResponse> {
  const { onProgress, ...rest } = req
  const budget     = validateBudget(rest.budget)
  const risk       = validateRiskAppetite(rest.riskAppetite)
  const timePeriod = validateTimePeriod(rest.timePeriod)

  const startRes = await apiClient.post<{ success: true; job_id: string }>(
    '/api/v1/portfolio/position/start',
    { budget, risk_appetite: risk, time_period: timePeriod }
  )
  const jobId = startRes.data.job_id

  const result = await pollJob(jobId, onProgress)
  dispatchApiUsage('portfolio')
  return { ...result, job_id: jobId }
}
