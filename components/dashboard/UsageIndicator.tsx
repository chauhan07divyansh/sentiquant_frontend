'use client'

import Link from 'next/link'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { cn } from '@/lib/utils/cn'

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100)
  const color =
    pct >= 100 ? 'bg-rose-500' :
    pct >= 80  ? 'bg-amber-500' :
                 'bg-emerald-500'

  return (
    <div className="w-full h-1.5 rounded-full bg-surface-800">
      <div
        className={cn('h-1.5 rounded-full transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function UsageIndicator() {
  const { plan, limits, usage, loading, remainingApiCalls, remainingPortfolios } = usePlanLimits()

  if (loading || !usage) {
    return (
      <div className="rounded-xl border bg-surface-900/80 border-surface-800 p-4 animate-pulse">
        <div className="h-4 w-24 rounded-lg bg-surface-800 mb-4" />
        <div className="space-y-3">
          <div className="h-7 rounded-lg bg-surface-800" />
          <div className="h-7 rounded-lg bg-surface-800" />
        </div>
      </div>
    )
  }

  const apiPct       = (usage.daily_api_calls_used / limits.daily_api_calls) * 100
  const portfolioPct = (usage.portfolios_used_today / limits.portfolio_per_day) * 100
  const isNearLimit  = apiPct >= 80 || portfolioPct >= 80
  const isUnlimited  = limits.daily_api_calls >= 999999

  return (
    <div className="rounded-xl border bg-surface-900/80 border-surface-800 p-4 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-surface-500 uppercase tracking-widest">Plan</p>
          <p className="font-display font-bold text-sm text-white">{plan}</p>
        </div>
        {plan === 'FREE' && (
          <Link
            href="/pricing"
            className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150',
              'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
              'hover:opacity-90 hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]',
            )}
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Daily API Calls — total across all endpoints (matches backend enforcement) */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-surface-500">Daily API calls</span>
          <span className="font-mono font-medium text-surface-300">
            {usage.daily_api_calls_used} / {isUnlimited ? '∞' : limits.daily_api_calls}
          </span>
        </div>
        {!isUnlimited && (
          <>
            <UsageBar used={usage.daily_api_calls_used} total={limits.daily_api_calls} />
            <p className="text-[10px] text-surface-600 mt-1">{remainingApiCalls} remaining today</p>
          </>
        )}
      </div>

      {/* Portfolio generations */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-surface-500">Portfolios today</span>
          <span className="font-mono font-medium text-surface-300">
            {usage.portfolios_used_today} / {limits.portfolio_per_day >= 999 ? '∞' : limits.portfolio_per_day}
          </span>
        </div>
        {limits.portfolio_per_day < 999 && (
          <>
            <UsageBar used={usage.portfolios_used_today} total={limits.portfolio_per_day} />
            <p className="text-[10px] text-surface-600 mt-1">{remainingPortfolios} remaining today</p>
          </>
        )}
      </div>

      {/* Near-limit warning — only shown for FREE users */}
      {isNearLimit && plan === 'FREE' && (
        <div className="mt-4 px-3 py-2.5 rounded-lg bg-amber-400/8 border border-amber-400/20">
          <p className="text-xs text-amber-400 leading-relaxed">
            Approaching your daily limit.{' '}
            <Link href="/pricing" className="underline underline-offset-2 hover:text-amber-300 transition-colors">
              Upgrade to PRO
            </Link>{' '}
            for 500 calls/day.
          </p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-[10px] text-surface-600 mt-4 pt-3 border-t border-surface-800/60 leading-relaxed">
        Counts all API calls (analyze, compare, portfolio). Resets at midnight.
      </p>
    </div>
  )
}
