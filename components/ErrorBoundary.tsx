'use client'

import React from 'react'
import { logError } from '@/lib/errorLogger'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
  context?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      context: this.props.context ?? 'Unknown',
      componentStack: errorInfo.componentStack,
    })
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }
    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: '#0a0a0a',
        border: '1px solid #2e3038',
        borderRadius: '10px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '9999px',
          background: 'rgba(244,63,94,0.1)',
          border: '1px solid rgba(244,63,94,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: '#f43f5e',
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        !
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 600,
          color: '#ffffff',
          margin: '0 0 8px 0',
        }}
      >
        Something went wrong
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: '13px',
          color: '#777a88',
          maxWidth: '360px',
          margin: '0 0 20px 0',
          lineHeight: 1.6,
        }}
      >
        This section ran into an unexpected error. The rest of the page should still work.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '9px 20px',
          borderRadius: '2px',
          border: '1px solid #2e3038',
          background: 'transparent',
          color: '#acafb9',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && (
        <pre
          style={{
            marginTop: '20px',
            fontSize: '11px',
            color: '#5e616e',
            maxWidth: '500px',
            overflow: 'auto',
            textAlign: 'left',
            background: '#000000',
            padding: '12px',
            borderRadius: '4px',
          }}
        >
          {error.message}
        </pre>
      )}
    </div>
  )
}
