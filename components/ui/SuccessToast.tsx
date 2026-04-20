'use client'

// ENHANCEMENT: Success notification toast — slides in from bottom-right.
// Auto-dismisses after `duration` ms. Works in both light and dark mode.

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface SuccessToastProps {
  show:         boolean
  message:      string
  description?: string
  onClose?:     () => void
  duration?:    number  // ms before auto-dismiss
}

export function SuccessToast({
  show,
  message,
  description,
  onClose,
  duration = 5000,
}: SuccessToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    setVisible(true)
    const t = setTimeout(() => { setVisible(false); onClose?.() }, duration)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])  // intentionally omit duration/onClose — only re-fire when `show` flips

  if (!visible) return null

  return (
    // ENHANCEMENT: animate-slide-in-right — defined in globals.css, springs in from right
    <div
      className="fixed bottom-6 right-6 z-[9997] animate-slide-in-right"
      role="status"
      aria-live="polite"
    >
      <div className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-xl',
        'bg-white dark:bg-surface-900',
        'border border-emerald-400/30',
        'shadow-[0_4px_24px_rgba(0,0,0,0.14)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.55)]',
        'min-w-[280px] max-w-[360px]'
      )}>
        {/* ENHANCEMENT: Checkmark icon — animate-scale-in springs it in with overshoot */}
        <div className="w-9 h-9 rounded-full bg-emerald-400/12 border border-emerald-400/25 flex items-center justify-center shrink-0 animate-scale-in">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-emerald-400"
          >
            <path d="M3 8l3 3 7-7" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 dark:text-white">{message}</p>
          {description && (
            <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>

        {/* ENHANCEMENT: Dismiss button */}
        <button
          type="button"
          onClick={() => { setVisible(false); onClose?.() }}
          className="shrink-0 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors p-0.5 rounded"
          aria-label="Dismiss notification"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
