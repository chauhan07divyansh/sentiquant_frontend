'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

type Plan = 'FREE' | 'PRO' | 'ENTERPRISE'
type CallType = 'analysis' | 'portfolio' | 'compare' | 'other'

// Mirrors backend PLAN_LIMITS exactly — total daily API calls across all endpoints
const PLAN_CONFIG: Record<Plan, { daily_api_calls: number; portfolio_per_day: number }> = {
  FREE:       { daily_api_calls: 10,     portfolio_per_day: 1   },
  PRO:        { daily_api_calls: 500,    portfolio_per_day: 999 },
  ENTERPRISE: { daily_api_calls: 999999, portfolio_per_day: 999 },
}

interface UsageState {
  daily_api_calls_used: number
  portfolios_used_today: number
  last_reset: string  // YYYY-MM-DD — used to detect day rollover
}

const STORAGE_KEY = 'sentiquant_usage'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function loadOrResetUsage(): UsageState {
  const today = todayStr()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: UsageState = JSON.parse(stored)
      if (parsed.last_reset === today) return parsed
    }
  } catch { /* corrupted storage — fall through */ }

  const fresh: UsageState = { daily_api_calls_used: 0, portfolios_used_today: 0, last_reset: today }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)) } catch { /* ignore */ }
  return fresh
}

export function usePlanLimits() {
  const { data: session, status } = useSession()
  const [usage, setUsage] = useState<UsageState | null>(null)
  // Ref keeps trackApiCall's closure fresh without re-adding the event listener
  const usageRef = useRef<UsageState | null>(null)

  const plan   = ((session?.user?.plan ?? 'FREE') as Plan)
  const config = PLAN_CONFIG[plan] ?? PLAN_CONFIG.FREE

  // Initialize from localStorage after mount (client-side only)
  useEffect(() => {
    const initial = loadOrResetUsage()
    usageRef.current = initial
    setUsage(initial)
  }, [])

  // Keep ref in sync so trackApiCall always sees fresh state
  useEffect(() => {
    usageRef.current = usage
  }, [usage])

  const trackApiCall = useCallback((type: CallType = 'other') => {
    const current = usageRef.current
    if (!current) return

    const updated: UsageState = {
      ...current,
      daily_api_calls_used: current.daily_api_calls_used + 1,
      portfolios_used_today:
        type === 'portfolio' ? current.portfolios_used_today + 1 : current.portfolios_used_today,
    }

    usageRef.current = updated
    setUsage(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
  }, []) // stable — reads from ref, not captured state

  // Listen to events dispatched by stocks.api.ts / portfolio.api.ts
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ type: CallType }>).detail
      trackApiCall(detail?.type ?? 'other')
    }

    window.addEventListener('api-call-made', handler as EventListener)
    return () => window.removeEventListener('api-call-made', handler as EventListener)
  }, [trackApiCall])

  const canMakeApiCall      = usage ? usage.daily_api_calls_used  < config.daily_api_calls  : true
  const canGeneratePortfolio = usage ? usage.portfolios_used_today < config.portfolio_per_day : true

  const remainingApiCalls   = usage ? Math.max(0, config.daily_api_calls  - usage.daily_api_calls_used)  : config.daily_api_calls
  const remainingPortfolios = usage ? Math.max(0, config.portfolio_per_day - usage.portfolios_used_today) : config.portfolio_per_day

  return {
    plan,
    limits: config,
    usage,
    loading: status === 'loading' || usage === null,
    canMakeApiCall,
    canGeneratePortfolio,
    remainingApiCalls,
    remainingPortfolios,
    trackApiCall,
  }
}
