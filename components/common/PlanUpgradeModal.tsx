'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface UpgradeDetail {
  message: string
  plan?: string
  upgradeUrl?: string
}

interface RateLimitDetail {
  message: string
}

type ModalState =
  | { type: 'upgrade'; detail: UpgradeDetail }
  | { type: 'ratelimit'; detail: RateLimitDetail }
  | null

// Listens for plan-upgrade-required and rate-limit-exceeded window events
// dispatched by lib/api/client.ts interceptors.
export default function PlanUpgradeModal() {
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    function handleUpgrade(e: Event) {
      setModal({ type: 'upgrade', detail: (e as CustomEvent<UpgradeDetail>).detail })
    }
    function handleRateLimit(e: Event) {
      setModal({ type: 'ratelimit', detail: (e as CustomEvent<RateLimitDetail>).detail })
    }

    window.addEventListener('plan-upgrade-required', handleUpgrade as EventListener)
    window.addEventListener('rate-limit-exceeded',   handleRateLimit as EventListener)

    return () => {
      window.removeEventListener('plan-upgrade-required', handleUpgrade as EventListener)
      window.removeEventListener('rate-limit-exceeded',   handleRateLimit as EventListener)
    }
  }, [])

  if (!modal) return null

  const close = () => setModal(null)

  if (modal.type === 'ratelimit') {
    return (
      <div
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-fade-in"
        role="alert"
      >
        <div className={cn(
          'flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg',
          'bg-surface-900 border-amber-400/30',
        )}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5">
            <path d="M8 2L1 14h14L8 2z"/><path d="M8 7v4M8 12.5v.5"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-400">Rate limit reached</p>
            <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{modal.detail.message}</p>
          </div>
          <button onClick={close} className="text-surface-600 hover:text-surface-300 transition-colors shrink-0" aria-label="Dismiss">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l8 8M10 2L2 10"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  const { message, upgradeUrl = '/pricing' } = modal.detail

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className={cn(
        'relative z-10 w-full max-w-md rounded-2xl border shadow-2xl animate-fade-in',
        'bg-surface-950 border-surface-800',
      )}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-surface-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1l2 4 4.5.5-3.25 3.2.75 4.5L8 11l-4 2.2.75-4.5L1.5 5.5 6 5z"/>
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-white">Upgrade Required</h2>
          </div>
          <p className="text-sm text-surface-400 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6">
          <Link
            href={upgradeUrl}
            onClick={close}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
              'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
              'hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
            )}
          >
            Upgrade to PRO
          </Link>
          <button
            onClick={close}
            className={cn(
              'flex-1 py-2.5 rounded-lg font-medium text-sm border transition-all duration-150',
              'border-surface-700 text-surface-400 hover:border-surface-600 hover:text-surface-200',
            )}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
