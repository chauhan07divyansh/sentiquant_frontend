'use client'

import React from 'react'
import loggingService from '@/lib/services/loggingService'
import { cn } from '@/lib/utils/cn'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    loggingService.logComponentError(error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg-page)] px-4">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6 animate-fade-in">

          {/* Error icon */}
          <div className="w-16 h-16 rounded-full bg-rose-400/10 border border-rose-400/25 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4M12 16v.01"/>
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-surface-400 leading-relaxed">
              We&apos;ve logged the error and will fix it soon.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className={cn(
              'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
              'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
              'hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
            )}
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}
