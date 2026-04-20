'use client'

// AUTH: Email verification page — called when user clicks the link in their inbox.
// URL shape: /verify-email?token=<flask_signed_token>
// Uses Suspense around useSearchParams() — required by Next.js 14 for static pages.

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams }               from 'next/navigation'
import Link                              from 'next/link'
import { verifyEmail }                   from '@/lib/api/auth.api'
import { cn }                            from '@/lib/utils/cn'

type VerifyStatus = 'loading' | 'success' | 'error'

// ─────────────────────────────────────────────
//  VERIFY CONTENT
//  Separated so useSearchParams() is inside Suspense.
// ─────────────────────────────────────────────
function VerifyContent() {
  const searchParams              = useSearchParams()
  const [status,  setStatus]      = useState<VerifyStatus>('loading')
  const [message, setMessage]     = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('No verification token found. Make sure you used the full link from your email.')
      return
    }

    // AUTH: Call Flask to verify the signed token
    verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Your email has been verified. You can now sign in.')
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Verification failed. The link may have expired.'
        setStatus('error')
        setMessage(msg)
      })
  }, [searchParams])

  return (
    <div className={cn('flex flex-col items-center gap-6 text-center animate-fade-in')}>

      {/* ── Status icon ── */}
      {status === 'loading' && (
        <div className="w-16 h-16 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center">
          <svg
            className="animate-spin w-8 h-8 text-brand-cyan"
            viewBox="0 0 24 24" fill="none"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {status === 'success' && (
        <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
      )}

      {status === 'error' && (
        <div className="w-16 h-16 rounded-full bg-rose-400/10 border border-rose-400/25 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>
      )}

      {/* ── Heading ── */}
      <div className="flex flex-col gap-2">
        {status === 'loading' && (
          <>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Verifying your email
            </h1>
            <p className="text-sm text-surface-400">Please wait a moment…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Email verified
            </h1>
            <p className="text-sm text-surface-400 leading-relaxed">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Verification failed
            </h1>
            <p className="text-sm text-surface-400 leading-relaxed">{message}</p>
          </>
        )}
      </div>

      {/* ── CTA ── */}
      {status === 'success' && (
        <Link
          href="/login"
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
            'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
            'hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
          )}
        >
          Sign in to Sentiquant
        </Link>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/signup"
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
              'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
              'hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
            )}
          >
            Create a new account
          </Link>
          <Link
            href="/login"
            className="text-sm text-surface-500 hover:text-surface-200 transition-colors"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  VERIFY EMAIL PAGE
//  Wraps VerifyContent in Suspense so useSearchParams()
//  doesn't break static generation (Next.js 14).
// ─────────────────────────────────────────────
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
