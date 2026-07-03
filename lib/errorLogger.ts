interface ErrorContext {
  context: string
  componentStack?: string | null
  [key: string]: unknown
}

export function logError(error: Error, context: ErrorContext) {
  console.error(`[${context.context}]`, error.message, {
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  })

  if (typeof window !== 'undefined') {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context: context.context,
        componentStack: context.componentStack,
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail — logging must never cause a secondary error
    })
  }

  // TODO: swap this body to Sentry.captureException(error, { extra: context })
  // or LogRocket.captureException(error) when ready — no call sites change.
}

export function logWarning(message: string, context: Record<string, unknown> = {}) {
  console.warn('[Warning]', message, context)
}
