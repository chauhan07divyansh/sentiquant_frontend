'use client'

import { useUIStore } from '@/store'
import { DegradedModeError } from '@/types/api.types'
import { useEffect } from 'react'

// ─────────────────────────────────────────────
//  DEGRADED BANNER
//  Shown when Flask returns 503 (trading systems
//  failed to initialize). Dismissible.
// ─────────────────────────────────────────────

export function DegradedBanner() {
  const { showDegradedBanner, setDegradedBanner } = useUIStore()

  if (!showDegradedBanner) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 bg-amber-400/10 border-b border-amber-400/20 text-amber-300 text-xs font-medium"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-amber-400" aria-hidden="true">⚠</span>
        <span>
          The trading system is initializing or under maintenance.
          Analysis features may be temporarily unavailable — please try again in a moment.
        </span>
      </div>
      <button
        onClick={() => setDegradedBanner(false)}
        className="shrink-0 text-amber-400/60 hover:text-amber-300 transition-colors p-1 rounded"
        aria-label="Dismiss banner"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 2l10 10M12 2L2 12"/>
        </svg>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
//  HOOK — call this wherever you make API calls
//  to automatically show the banner on 503
// ─────────────────────────────────────────────
export function useDegradedDetection(error: unknown) {
  const { setDegradedBanner } = useUIStore()

  useEffect(() => {
    if (error instanceof DegradedModeError) {
      setDegradedBanner(true)
    }
  }, [error, setDegradedBanner])
}

// ─────────────────────────────────────────────
//  ERROR STATE — inline component for API errors
// ─────────────────────────────────────────────
interface ErrorStateProps {
  error:     unknown
  onRetry?:  () => void
  compact?:  boolean
}

export function ErrorState({ error, onRetry, compact = false }: ErrorStateProps) {
  const isDegraded = error instanceof DegradedModeError
  const message    = error instanceof Error ? error.message : 'Something went wrong.'

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-surface-400 py-4">
        <span className={isDegraded ? 'text-amber-400' : 'text-rose-400'} aria-hidden="true">
          {isDegraded ? '⚠' : '✕'}
        </span>
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-brand-cyan hover:text-brand-blue underline transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="card p-8 flex flex-col items-center text-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDegraded ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400' : 'bg-rose-400/10 border border-rose-400/20 text-rose-400'}`}>
        {isDegraded ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.22 3.22l1.42 1.42M15.36 15.36l1.42 1.42M3.22 16.78l1.42-1.42M15.36 4.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L2 17h16L10 3z" />
            <path d="M10 9v4M10 15v.5" />
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-surface-900 dark:text-white">
          {isDegraded ? 'System Maintenance' : 'Something went wrong'}
        </p>
        <p className="text-xs text-surface-500 max-w-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-base btn-ghost text-xs px-4 py-2"
        >
          Try again
        </button>
      )}
    </div>
  )
}
