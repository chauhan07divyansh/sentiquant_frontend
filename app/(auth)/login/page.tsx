'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import Link                               from 'next/link'
import { signIn }                         from 'next-auth/react'
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
      <label
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize:   '12px',
          fontWeight: 500,
          color:      '#777a88',
        }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm text-white transition-colors duration-150 outline-none',
            type === 'password' && 'pr-10',
          )}
          style={{
            backgroundColor: '#121317',
            border:          error ? '1px solid #f43f5e' : '1px solid #2e3038',
            borderRadius:    '2px',
            fontFamily:      'var(--font-inter)',
            color:           '#ffffff',
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = '#0664e8'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#f43f5e' : '#2e3038'
          }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: '#464853', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#464853' }}
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
        <p className="text-xs flex items-center gap-1.5" style={{ color: '#f43f5e' }} role="alert">
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
//  GOOGLE BUTTON
// ─────────────────────────────────────────────
function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      style={{
        backgroundColor: '#121317',
        border:          '1px solid #2e3038',
        borderRadius:    '2px',
        color:           '#ffffff',
        fontFamily:      'var(--font-inter)',
        fontSize:        '14px',
        fontWeight:      500,
        padding:         '11px 16px',
        cursor:          'pointer',
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = '#464853' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e3038' }}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {loading ? 'Signing in…' : 'Continue with Google'}
    </button>
  )
}

// ─────────────────────────────────────────────
//  LOGIN CONTENT
// ─────────────────────────────────────────────
function LoginContent() {
  const { login } = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [errors,       setErrors]       = useState<{ email?: string | null; password?: string | null }>({})
  const [formError,    setFormError]    = useState<string | null>(null)
  const [forgotInfo,   setForgotInfo]   = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [touched,      setTouched]      = useState({ email: false, password: false })

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

  useEffect(() => {
    if (searchParams.get('error') === 'SessionRequired') {
      setFormError('Your session expired. Please sign in again.')
    }
    if (searchParams.get('error') === 'OAuthAccountNotLinked') {
      setFormError('This email is already registered. Please sign in with your password.')
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

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setFormError(null)
    try {
      await signIn('google', { callbackUrl: getReturnUrl() })
    } catch {
      setFormError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Heading */}
      <div className="text-center flex flex-col gap-1.5">
        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize:   '32px',
            fontWeight: 400,
            color:      '#ffffff',
            margin:     0,
            lineHeight: 1.2,
          }}
        >
          Welcome back
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#777a88', margin: 0 }}>
          Sign in to your Sentiquant account
        </p>
      </div>

      {/* Google Sign In */}
      <GoogleButton loading={googleLoading} onClick={handleGoogleSignIn} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: '#2e3038' }} />
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#5e616e' }}>
          or continue with email
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#2e3038' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 px-3.5 py-3 text-xs leading-relaxed"
            style={{
              backgroundColor: 'rgba(244,63,94,0.08)',
              border:          '1px solid rgba(244,63,94,0.20)',
              borderRadius:    '2px',
              color:           '#fca5a5',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" className="shrink-0 mt-0.5" aria-hidden="true">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5h1v4h-1v-4zm0 5h1v1h-1v-1z"/>
            </svg>
            {formError}
          </div>
        )}

        {forgotInfo && (
          <div
            role="status"
            className="flex items-start gap-2.5 px-3.5 py-3 text-xs leading-relaxed"
            style={{
              backgroundColor: 'rgba(46,48,56,0.50)',
              border:          '1px solid #2e3038',
              borderRadius:    '2px',
              color:           '#777a88',
            }}
          >
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
          <div className="flex justify-end mt-0.5">
            <button
              type="button"
              style={{
                fontFamily:  'var(--font-inter)',
                fontSize:    '12px',
                color:       '#5e616e',
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                padding:     0,
                transition:  'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#5e616e' }}
              onClick={() => { setForgotInfo('Password reset is coming soon.'); setFormError(null) }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          style={{
            backgroundColor: '#ffffff',
            color:           '#000000',
            border:          '1px solid #ffffff',
            borderRadius:    '2px',
            fontFamily:      'var(--font-inter)',
            fontSize:        '14px',
            fontWeight:      600,
            padding:         '11px',
            cursor:          'pointer',
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#e2e3e9'; e.currentTarget.style.borderColor = '#e2e3e9' } }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#ffffff' }}
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

      {/* Sign up link */}
      <p
        className="text-center"
        style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#777a88' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          style={{ color: '#0664e8', textDecoration: 'none', fontWeight: 500 }}
          className="hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────
function LoginFallback() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col gap-2 items-center">
        <div className="h-7 w-40 rounded" style={{ backgroundColor: '#1c1d22' }} />
        <div className="h-4 w-56 rounded" style={{ backgroundColor: 'rgba(28,29,34,0.6)' }} />
      </div>
      <div className="h-14 rounded border" style={{ backgroundColor: 'rgba(28,29,34,0.6)', borderColor: '#1c1d22' }} />
      <div className="flex flex-col gap-3">
        <div className="h-16 rounded" style={{ backgroundColor: 'rgba(28,29,34,0.6)' }} />
        <div className="h-16 rounded" style={{ backgroundColor: 'rgba(28,29,34,0.6)' }} />
        <div className="h-10 rounded" style={{ backgroundColor: 'rgba(28,29,34,0.4)' }} />
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
