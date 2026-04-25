// ─────────────────────────────────────────────
//  API CLIENT
//  Single Axios instance for all Flask calls.
//  Handles: base URL, timeouts, error normalization,
//  503 degraded mode, and response unwrapping.
//
//  ROUTING: Browser calls go through Next.js /flask/* proxy
//  (next.config.ts rewrites) → Flask internal URL.
//  This bypasses Cloudflare WAF which blocks server-to-server
//  POST requests without browser fingerprints.
// ─────────────────────────────────────────────

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios'
import { BackendError, DegradedModeError } from '@/types/api.types'

// Browser: use /flask proxy (relative URL, goes through Next.js → Flask internal)
// Server:  use Flask internal URL directly (SSR / API routes)
const BASE_URL = typeof window !== 'undefined'
  ? '/flask'
  : (process.env.FLASK_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000')

// ── Create the instance ───────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,          // Analysis endpoints can take 30-50s
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Extend config type for per-request start-time tracking
type TimedConfig = InternalAxiosRequestConfig & { _startTime?: number }

// ── Request interceptor ───────────────────────
// AUTH: Attach Flask access_token to every outgoing request.
// PERF: Record start time so the response interceptor can compute duration.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    ;(config as TimedConfig)._startTime = typeof window !== 'undefined' ? Date.now() : 0
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────
// Normalizes all errors into typed custom error classes.
// Unwraps the { success, data } envelope.
// AUTH: Also handles 401 with automatic Flask token refresh.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Dispatch timing event so loggingService can record API call duration
    if (typeof window !== 'undefined') {
      const start = (response.config as TimedConfig)._startTime ?? 0
      window.dispatchEvent(new CustomEvent('api-request-logged', {
        detail: {
          url:      response.config.url ?? '',
          method:   (response.config.method ?? 'get').toUpperCase(),
          status:   response.status,
          duration: start ? Date.now() - start : 0,
        },
      }))
    }

    // Flask always returns { success: bool, data?: any, error?: string }
    const body = response.data

    if (body?.success === false) {
      // Backend returned 200 but flagged an error inside the body
      throw new BackendError(body.error ?? 'Unknown backend error', response.status)
    }

    // Return raw response — service layer extracts .data
    return response
  },
  async (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status
      const body   = error.response?.data

      // AUTH: 401 — attempt token refresh using the stored Flask refresh_token.
      // On success, replay the original request with the new access_token.
      // On failure, wipe both tokens and redirect to /login.
      if (status === 401 && typeof window !== 'undefined') {
        // AUTH: Use a _retry flag to prevent infinite retry loops
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          const refreshToken = localStorage.getItem('refresh_token')

          if (refreshToken) {
            try {
              // Use proxy for refresh too — avoids Cloudflare block
              const res = await fetch(`/flask/api/v1/auth/refresh`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ refresh_token: refreshToken }),
              })

              if (res.ok) {
                const data = await res.json()
                const newToken: string = data.access_token
                // AUTH: Update stored access_token and retry the original request
                sessionStorage.setItem('access_token', newToken)
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                return apiClient(originalRequest)
              }
            } catch {
              // AUTH: Network error during refresh — fall through to session wipe
            }

            // AUTH: Refresh failed (token expired / revoked) — clear session and redirect
            sessionStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login?error=SessionRequired'
            return Promise.reject(error)   // Unreachable after redirect
          }
        }

        throw new BackendError('Authentication required. Please sign in again.', 401)
      }

      // 403 = email not verified OR plan restriction
      if (status === 403 && typeof window !== 'undefined') {
        const errMsg: string = body?.error ?? ''
        if (errMsg.toLowerCase().includes('verify') || errMsg.toLowerCase().includes('email')) {
          window.location.href = '/verify-email-notice'
          return Promise.reject(error)
        }
        window.dispatchEvent(new CustomEvent('plan-upgrade-required', {
          detail: {
            message: errMsg || 'Upgrade your plan to access this feature.',
            plan:       body?.plan_required,
            upgradeUrl: body?.upgrade_url ?? '/pricing',
          },
        }))
        return Promise.reject(error)
      }

      // 429 = rate limit or daily quota exceeded
      if (status === 429 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rate-limit-exceeded', {
          detail: {
            message: body?.error ?? 'Rate limit exceeded. Please try again later.',
          },
        }))
        return Promise.reject(error)
      }

      // 503 = trading systems failed to initialize
      if (status === 503) {
        throw new DegradedModeError()
      }

      // 404 = symbol not found / endpoint missing
      if (status === 404) {
        throw new BackendError(body?.error ?? 'Resource not found', 404)
      }

      // 400 = validation error from Flask
      if (status === 400) {
        throw new BackendError(body?.error ?? 'Invalid request parameters', 400)
      }

      // 500 = internal Flask error
      if (status === 500) {
        throw new BackendError('An internal server error occurred. Please try again.', 500)
      }

      // Network / timeout
      if (error.code === 'ECONNABORTED') {
        throw new BackendError(
          'The request timed out. Analysis may take up to 60 seconds — please try again.',
          408
        )
      }

      if (!error.response) {
        throw new BackendError(
          'Cannot reach the server. Please check your connection.',
          0
        )
      }

      throw new BackendError(body?.error ?? error.message, status ?? 0)
    }

    // Re-throw non-Axios errors as-is (DegradedModeError etc.)
    throw error
  }
)

// ── Usage tracking helper ─────────────────────
// Dispatches a window event so usePlanLimits can count every tracked API call.
export function dispatchApiUsage(type: 'analysis' | 'portfolio' | 'compare' | 'other'): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-call-made', { detail: { type } }))
  }
}

// ── Typed GET / POST helpers ──────────────────
// These unwrap the Flask envelope and return T directly.

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<{ success: true; data: T }>(url, { params })
  return response.data.data
}

export async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await apiClient.post<{ success: true; data: T }>(url, body)
  return response.data.data
}

export default apiClient
