'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import Link                               from 'next/link'
import { useAuth }                        from '@/hooks/useAuth'
import { cn }                             from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  FIELD VALIDATION
// ─────────────────────────────────────────────
function validateEmail(v: string) {
  if (!v.trim())                return 'Email is required.'
  if (!/\S+@\S+\.\S+/.test(v)) return 'Enter a valid email address.'
  return null
}
function validatePassword(v: string) {
  if (!v) return 'Password is required.'
  return null
}

// ─────────────────────────────────────────────
//  INPUT FIELD
// ─────────────────────────────────────────────
function AuthInput({
  label, type = 'text', value, onChange, error, placeholder, autoComplete, autoFocus,
}: {
  label: string; type?: string; value: string
  onChange: (v: string) => void; error?: string | null
  placeholder?: string; autoComplete?: string; autoFocus?: boolean
}) {
  const [showPass, setShowPass] = useState(false)
  const inputType = type === 'password' ? (showPass ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-surface-300">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            'w-full bg-surface-900 border rounded-lg px-3.5 py-2.5',
            'text-sm text-white placeholder:text-surface-600',
            'transition-all duration-150 outline-none font-sans',
            'focus:ring-2',
            error
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-surface-700 focus:border-brand-blue focus:ring-brand-blue/12',
            type === 'password' && 'pr-10'
          )}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
            aria-label={showPass ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPass ? (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/>
                <circle cx="8" cy="8" r="2"/>
                <path d="M2 2l12 12"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/>
                <circle cx="8" cy="8" r="2"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5" role="alert">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5h1v4h-1v-4zm0 5h1v1h-1v-1z"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  LOGIN CONTENT
//  Separated so useSearchParams() is inside Suspense (Next.js 14 req).
// ─────────────────────────────────────────────
function LoginContent() {
  const { login } = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [errors,     setErrors]     = useState<{ email?: string | null; password?: string | null }>({})
  const [formError,  setFormError]  = useState<string | null>(null)
  const [forgotInfo, setForgotInfo] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [touched,    setTouched]    = useState({ email: false, password: false })

  // AUTH: Resolve post-login destination.
  // Reads ?from (manual app redirects) or ?callbackUrl (NextAuth withAuth blocks).
  // Absolute callbackUrl values (e.g. http://host/dashboard) reduced to pathname.
  function getReturnUrl(): string {
    const from = searchParams.get('from')
    if (from?.startsWith('/')) return from

    const cb = searchParams.get('callbackUrl')
    if (cb) {
      try { return new URL(cb).pathname } catch { /* relative path */ }
      if (cb.startsWith('/')) return cb
    }

    return '/dashboard'
  }

  // Show error from URL param (e.g. session expired via 401 interceptor)
  useEffect(() => {
    if (searchParams.get('error') === 'SessionRequired') {
      setFormError('Your session expired. Please sign in again.')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setForgotInfo(null)

    const emailErr    = validateEmail(email)
    const passwordErr = validatePassword(password)
    setErrors({ email: emailErr, password: passwordErr })
    setTouched({ email: true, password: true })
    if (emailErr || passwordErr) return

    setLoading(true)
    try {
      const error = await login(email, password)
      if (error === 'VERIFY_EMAIL_REQUIRED') {
        router.push('/verify-email-notice')
        return
      }
      if (error) {
        setFormError(error)
        return
      }
      router.replace(getReturnUrl())
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  // ── Form ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Heading */}
      <div className="text-center flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-surface-400">
          Sign in to your Sentiquant account
        </p>
      </div>

      {/* Demo credentials hint */}
      <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-brand-blue/8 border border-brand-cyan/20 text-xs text-brand-blue dark:text-brand-cyan leading-relaxed">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="shrink-0 mt-0.5">
          <circle cx="7" cy="7" r="5.5"/>
          <path d="M7 6v4M7 4.5v.5"/>
        </svg>
        <span>
          Demo: <span className="font-mono font-semibold">demo@sentiquant.com</span>
          {' '}/<span className="font-mono font-semibold"> demo1234</span>
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* Global error */}
        {formError && (
          <div role="alert" className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-400/8 border border-rose-400/20 text-xs text-rose-300 leading-relaxed">
            <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" className="shrink-0 mt-0.5" aria-hidden="true">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5h1v4h-1v-4zm0 5h1v1h-1v-1z"/>
            </svg>
            {formError}
          </div>
        )}

        {/* Forgot-password info message — neutral styling, not an error */}
        {forgotInfo && (
          <div role="status" className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-xs text-surface-400 leading-relaxed">
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="6" cy="6" r="5"/><path d="M6 5v3M6 4v.5"/>
            </svg>
            {forgotInfo}
          </div>
        )}

        <AuthInput
          label="Email address"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); if (touched.email) setErrors((e) => ({ ...e, email: validateEmail(v) })) }}
          error={touched.email ? errors.email : null}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(v) => { setPassword(v); if (touched.password) setErrors((e) => ({ ...e, password: validatePassword(v) })) }}
            error={touched.password ? errors.password : null}
            placeholder="Your password"
            autoComplete="current-password"
          />
          {/* Forgot password — no backend endpoint yet; shows info message */}
          <div className="flex justify-end mt-0.5">
            <button
              type="button"
              className="text-xs text-surface-500 hover:text-brand-cyan transition-colors"
              onClick={() => { setForgotInfo('Password reset is coming soon.'); setFormError(null) }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-center gap-2 mt-1',
            'py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
            'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
            'hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950',
          )}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-800" />
        <span className="text-xs text-surface-600">or</span>
        <div className="flex-1 h-px bg-surface-800" />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-surface-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-brand-cyan hover:text-brand-blue transition-colors underline-offset-2 hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
//  LOGIN PAGE
//  Suspense wraps LoginContent so useSearchParams()
//  doesn't break static generation (Next.js 14).
// ─────────────────────────────────────────────
// Shown while the LoginContent chunk / searchParams resolve during SSR hydration
function LoginFallback() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col gap-2 items-center">
        <div className="h-7 w-40 rounded-lg bg-surface-800" />
        <div className="h-4 w-56 rounded-lg bg-surface-800/60" />
      </div>
      <div className="h-14 rounded-xl bg-surface-800/60 border border-surface-800" />
      <div className="flex flex-col gap-3">
        <div className="h-16 rounded-lg bg-surface-800/60" />
        <div className="h-16 rounded-lg bg-surface-800/60" />
        <div className="h-10 rounded-lg bg-surface-800/40" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}
