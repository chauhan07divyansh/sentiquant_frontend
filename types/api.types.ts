// ─────────────────────────────────────────────
//  API RESPONSE ENVELOPE
//  Matches Flask: { success: bool, data: any }
//              or { success: false, error: string }
// ─────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code?: string
  plan_required?: string
  upgrade_url?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─────────────────────────────────────────────
//  CUSTOM ERROR CLASSES
// ─────────────────────────────────────────────

export class BackendError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'BackendError'
  }
}

/** Thrown when Flask returns 503 — trading systems failed to init */
export class DegradedModeError extends Error {
  constructor() {
    super('The trading system is currently initializing or in maintenance mode. Please try again shortly.')
    this.name = 'DegradedModeError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
