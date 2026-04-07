// ─────────────────────────────────────────────
//  API CLIENT
//  Single Axios instance for all Flask calls.
//  Handles: base URL, timeouts, error normalization,
//  503 degraded mode, and response unwrapping.
// ─────────────────────────────────────────────

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios'
import { BackendError, DegradedModeError } from '@/types/api.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// ── Create the instance ───────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,          // Analysis endpoints can take 30-50s
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptor ───────────────────────
// Attach auth token if present (for future auth integration)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token will be injected here once auth is added.
    // const token = getAuthToken()
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────
// Normalizes all errors into typed custom error classes.
// Unwraps the { success, data } envelope.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Flask always returns { success: bool, data?: any, error?: string }
    const body = response.data

    if (body?.success === false) {
      // Backend returned 200 but flagged an error inside the body
      throw new BackendError(body.error ?? 'Unknown backend error', response.status)
    }

    // Return raw response — service layer extracts .data
    return response
  },
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status
      const body = error.response?.data

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
