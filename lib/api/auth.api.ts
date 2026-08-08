// ─────────────────────────────────────────────
//  AUTH: Flask authentication API — client-side functions
//  login() is handled server-side inside lib/auth.ts (NextAuth authorize).
//  This module covers the remaining auth endpoints called from the browser.
// ─────────────────────────────────────────────

import { BackendError } from '@/types/api.types'

// AUTH: Always read from NEXT_PUBLIC_ var — this code runs in the browser
const FLASK_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────

export interface RegisterData {
  email:    string
  password: string
  name?:    string
}

// ─────────────────────────────────────────────
//  registerUser
//  POST /api/v1/auth/register
//  Flask creates the account and sends a verification email.
//  No token is returned — user must verify email before logging in.
// ─────────────────────────────────────────────
export async function registerUser(data: RegisterData): Promise<void> {
  // AUTH: Trim fields before sending to avoid server-side validation noise
  const payload = {
    email:    data.email.trim().toLowerCase(),
    password: data.password,
    name:     data.name?.trim() || undefined,
  }

  const res = await fetch(`${FLASK_URL}/api/v1/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendError(
      body?.error ?? body?.message ?? 'Registration failed. Please try again.',
      res.status
    )
  }
}

// ─────────────────────────────────────────────
//  verifyEmail
//  GET /api/v1/auth/verify-email?token=...
//  Called from the verify-email page after user clicks the link in their inbox.
// ─────────────────────────────────────────────
export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(
    `${FLASK_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`
  )

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new BackendError(
      body?.error ?? body?.message ?? 'Verification failed. The link may have expired.',
      res.status
    )
  }
}
