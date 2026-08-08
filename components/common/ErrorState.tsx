'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
  compact?: boolean
  className?: string
}

export function ErrorState({
  title = "Couldn't load this content",
  message = "We're having trouble reaching live data right now. Please try again in a moment.",
  onRetry,
  retryLabel = 'Try again',
  showBackButton = false,
  backHref = '/',
  backLabel = 'Go back',
  compact = false,
  className,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs py-3', className)}>
        <span className="text-rose-400 shrink-0" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.5" />
          </svg>
        </span>
        <span className="text-surface-400">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-brand-cyan hover:text-brand-blue underline transition-colors shrink-0"
          >
            {retryLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-5 py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
        <svg
          width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" className="text-rose-400"
        >
          <circle cx="14" cy="14" r="11" />
          <path d="M14 9v5M14 17v.5" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-medium text-white">{title}</p>
        <p className="text-sm text-surface-400 max-w-xs leading-relaxed">{message}</p>
      </div>
      {(onRetry || showBackButton) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-medium hover:bg-brand-blue/80 transition-colors"
            >
              {retryLabel}
            </button>
          )}
          {showBackButton && (
            <Link href={backHref} className="text-sm text-surface-400 hover:text-white transition-colors">
              {backLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
