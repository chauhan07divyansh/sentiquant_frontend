'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

type Plan = 'FREE' | 'PRO' | 'ENTERPRISE'
type CallType = 'analysis' | 'portfolio' | 'compare' | 'other'

// Mirrors backend PLAN_LIMITS exactly
const PLAN_CONFIG: Record<Plan, { daily_api_calls: number; portfolio_per_day: number }> = {
  FREE:       { daily_api_calls: 10,     portfolio_per_day: 1   },
  PRO:        { daily_api_calls: 500,    portfolio_per_day: 999 },
  ENTERPRISE: { daily_api_calls: 999999, portfolio_per_day: 999 },
}

interface UsageState {
  daily_api_calls_used:  number
  portfolios_used_today: number
}

export function usePlanLimits() {
  const { data: session, status } = useSession()
  const [usage, setUsage]         = useState<UsageState | null>(null)
  const [loading, setLoading]     = useState(true)
  const usageRef                  = useRef<UsageState | null>(null)

  const plan   = ((session?.user?.plan ?? 'FREE') as Plan)
  const config = PLAN_CONFIG[plan] ?? PLAN_CONFIG.FREE

  // Fetch real usage from Flask DB — source of truth, not localStorage
  const fetchUsage = useCallback(async () => {
    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem('access_token')
      : null
    if (!token) { setLoading(false); return }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/usage`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) return
      const json = await res.json()
      if (json.success) {
        const fresh: UsageState = {
          daily_api_calls_used:  json.data.daily_api_calls_used,
          portfolios_used_today: json.data.portfolios_used_today,
        }
        usageRef.current = fresh
        setUsage(fresh)
      }
    } catch {
      // Network error — keep stale state, don't crash
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount and whenever session becomes authenticated
  useEffect(() => {
    if (status === 'authenticated') fetchUsage()
    else if (status === 'unauthenticated') setLoading(false)
  }, [status, fetchUsage])

  // Keep ref in sync so trackApiCall always sees fresh state
  useEffect(() => {
    usageRef.current = usage
  }, [usage])

  // Optimistic local increment — UI updates instantly, then syncs with DB
  const trackApiCall = useCallback((type: CallType = 'other') => {
    const current = usageRef.current
    if (!current) return
    const updated: UsageState = {
      daily_api_calls_used:  current.daily_api_calls_used + 1,
      portfolios_used_today:
        type === 'portfolio'
          ? current.portfolios_used_today + 1
          : current.portfolios_used_today,
    }
    usageRef.current = updated
    setUsage(updated)
    // Re-fetch from DB after 2s to confirm server-side count
    setTimeout(fetchUsage, 2000)
  }, [fetchUsage])

  // Listen to events dispatched by stocks.api.ts / portfolio.api.ts
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ type: CallType }>).detail
      trackApiCall(detail?.type ?? 'other')
    }
    window.addEventListener('api-call-made', handler as EventListener)
    return () => window.removeEventListener('api-call-made', handler as EventListener)
  }, [trackApiCall])

  const canMakeApiCall       = usage ? usage.daily_api_calls_used  < config.daily_api_calls  : true
  const canGeneratePortfolio = usage ? usage.portfolios_used_today < config.portfolio_per_day : true
  const remainingApiCalls    = usage
    ? Math.max(0, config.daily_api_calls  - usage.daily_api_calls_used)
    : config.daily_api_calls
  const remainingPortfolios  = usage
    ? Math.max(0, config.portfolio_per_day - usage.portfolios_used_today)
    : config.portfolio_per_day

  return {
    plan,
    limits: config,
    usage,
    loading: status === 'loading' || loading,
    canMakeApiCall,
    canGeneratePortfolio,
    remainingApiCalls,
    remainingPortfolios,
    trackApiCall,
  }
}
