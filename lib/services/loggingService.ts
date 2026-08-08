'use client'

// ─────────────────────────────────────────────
//  CLIENT-SIDE LOGGING SERVICE
//  Queues log events and flushes them to /api/logs in batches.
//  Also listens to api-request-logged events dispatched by client.ts
//  so API call durations are tracked without a direct import dependency.
// ─────────────────────────────────────────────

interface LogEvent {
  level:     'info' | 'warn' | 'error' | 'debug'
  message:   string
  userId?:   string
  email?:    string
  metadata?: Record<string, unknown>
}

interface EnrichedLogEvent extends LogEvent {
  metadata: Record<string, unknown>
}

interface ApiRequestDetail {
  url:      string
  method:   string
  status:   number
  duration: number
}

class LoggingService {
  private queue: EnrichedLogEvent[] = []
  private flushTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    if (typeof window === 'undefined') return

    // Batch flush every 5 seconds
    this.flushTimer = setInterval(() => this.flush(), 5_000)

    // Best-effort flush on unload via sendBeacon (doesn't block page close)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushBeacon()
    })

    // Listen for API timing events dispatched by lib/api/client.ts
    window.addEventListener('api-request-logged', (e: Event) => {
      const detail = (e as CustomEvent<ApiRequestDetail>).detail
      this.info('API call', {
        action:   'api_call',
        endpoint: detail.url,
        method:   detail.method,
        status:   detail.status,
        duration: detail.duration,
      })
    })
  }

  // ── Internal helpers ─────────────────────────

  private enrich(event: LogEvent): EnrichedLogEvent {
    return {
      ...event,
      metadata: {
        timestamp:  new Date().toISOString(),
        url:        typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent:  typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        ...event.metadata,
      },
    }
  }

  private async flush() {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.queue.length)

    try {
      await fetch('/api/logs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ logs: batch }),
        // keepalive so the request outlives short-lived contexts
        keepalive: true,
      })
    } catch {
      // Re-queue on network failure so logs aren't silently dropped
      this.queue.unshift(...batch)
    }
  }

  // sendBeacon is fire-and-forget — ideal for page-hide / beforeunload
  private flushBeacon() {
    if (this.queue.length === 0 || typeof navigator === 'undefined') return
    const batch = this.queue.splice(0, this.queue.length)
    navigator.sendBeacon(
      '/api/logs',
      new Blob([JSON.stringify({ logs: batch })], { type: 'application/json' })
    )
  }

  private log(event: LogEvent) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console[event.level === 'error' ? 'error' : event.level === 'warn' ? 'warn' : 'log'](
        `[${event.level.toUpperCase()}] ${event.message}`,
        event.metadata ?? ''
      )
    }

    this.queue.push(this.enrich(event))

    // Flush immediately on errors — don't wait for the timer
    if (event.level === 'error') this.flush()
  }

  // ── Public API ───────────────────────────────

  info(message: string, metadata?: Record<string, unknown>) {
    this.log({ level: 'info', message, metadata })
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log({ level: 'warn', message, metadata })
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log({
      level:   'error',
      message,
      metadata: {
        ...metadata,
        errorMessage: error?.message,
        stack:        error?.stack,
      },
    })
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log({ level: 'debug', message, metadata })
  }

  // ── Auth-specific helpers ────────────────────

  logLogin(email: string, userId?: string) {
    this.info('User logged in', { action: 'login', email, userId })
  }

  logLoginFailed(email: string, reason?: string) {
    this.warn('Login failed', { action: 'login_failed', email, reason })
  }

  logLogout(email?: string) {
    this.info('User logged out', { action: 'logout', email })
  }

  logRegistration(email: string) {
    this.info('User registered', { action: 'registration', email })
  }

  logPageView(path: string) {
    this.info('Page viewed', { action: 'page_view', path })
  }

  logComponentError(error: Error, componentStack?: string | null) {
    this.error('React render error', error, {
      action:         'react_error_boundary',
      componentStack: componentStack ?? undefined,
    })
  }
}

// Module-level singleton — initialised once per browser session
const loggingService = new LoggingService()
export default loggingService
