'use client'

import { useState, useCallback } from 'react'
import Link                      from 'next/link'
import { signIn }                from 'next-auth/react'
import { registerUser }          from '@/lib/api/auth.api'
import { cn }                    from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  FIELD VALIDATORS
// ─────────────────────────────────────────────
const validators = {
  name: (v: string) => {
    if (!v.trim())       return 'Full name is required.'
    if (v.trim().length < 2) return 'Name must be at least 2 characters.'
    return null
  },
  email: (v: string) => {
    if (!v.trim())               return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(v)) return 'Enter a valid email address.'
    return null
  },
  password: (v: string) => {
    if (!v)         return 'Password is required.'
    if (v.length < 8) return 'Password must be at least 8 characters.'
    return null
  },
  confirm: (v: string, password: string) => {
    if (!v)           return 'Please confirm your password.'
    if (v !== password) return 'Passwords do not match.'
    return null
  },
}

// ─────────────────────────────────────────────
//  PASSWORD STRENGTH
// ─────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  score = Math.min(score, 4)

  const levels = [
    { label: 'Very weak', color: 'bg-rose-500'    },
    { label: 'Weak',      color: 'bg-orange-400'  },
    { label: 'Fair',      color: 'bg-amber-400'   },
    { label: 'Good',      color: 'bg-brand-cyan'   },
    { label: 'Strong',    color: 'bg-emerald-400'  },
  ]
  return { score, ...levels[score] }
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = getPasswordStrength(password)
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < score ? color : 'bg-[#1c1d22]'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-[11px] font-medium',
        score <= 1 ? 'text-rose-400' : score === 2 ? 'text-amber-400' : 'text-[#0664e8]'
      )}>
        {label}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
//  AUTH INPUT
// ─────────────────────────────────────────────
function AuthInput({
  label, type = 'text', value, onChange, onBlur, error, placeholder, autoComplete, autoFocus,
}: {
  label: string; type?: string; value: string
  onChange: (v: string) => void; onBlur?: () => void
  error?: string | null; placeholder?: string
  autoComplete?: string; autoFocus?: boolean
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
          className={cn('w-full px-3.5 py-2.5 text-sm text-white outline-none transition-colors duration-150', type === 'password' && 'pr-10')}
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
            onBlur?.()
          }}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: '#464853', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#464853' }}
            tabIndex={-1}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/><path d="M2 2l12 12"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><circle cx="8" cy="8" r="2"/>
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
      {loading ? 'Creating account…' : 'Continue with Google'}
    </button>
  )
}

// ─────────────────────────────────────────────
//  SIGNUP PAGE
// ─────────────────────────────────────────────
export default function SignupPage() {
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formError, setFormError]   = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [agreedToTerms, setAgreed]  = useState(false)

  const validate = useCallback((field: string, value: string) => {
    switch (field) {
      case 'name':     return validators.name(value)
      case 'email':    return validators.email(value)
      case 'password': return validators.password(value)
      case 'confirm':  return validators.confirm(value, fields.password)
      default:         return null
    }
  }, [fields.password])

  function handleChange(field: string, value: string) {
    setFields((f) => ({ ...f, [field]: value }))
    if (touched[field]) {
      setErrors((e) => ({
        ...e,
        [field]: validate(field, value),
        // Re-validate confirm when password changes
        ...(field === 'password' && touched.confirm
          ? { confirm: validators.confirm(fields.confirm, value) }
          : {}),
      }))
    }
  }

  function handleBlur(field: string) {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validate(field, fields[field as keyof typeof fields]) }))
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setFormError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setFormError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    // Validate all fields
    const allErrors = {
      name:     validators.name(fields.name),
      email:    validators.email(fields.email),
      password: validators.password(fields.password),
      confirm:  validators.confirm(fields.confirm, fields.password),
    }
    setErrors(allErrors)
    setTouched({ name: true, email: true, password: true, confirm: true })

    if (Object.values(allErrors).some(Boolean)) return
    if (!agreedToTerms) {
      setFormError('You must agree to the terms to create an account.')
      return
    }

    setLoading(true)
    try {
      // AUTH: Register with Flask backend — sends a verification email.
      // User cannot log in until they click the link in their inbox.
      await registerUser({
        name:     fields.name,
        email:    fields.email,
        password: fields.password,
      })
      // AUTH: Registration successful — prompt email verification
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setFormError(message)
    } finally {
      setLoading(false)
    }
  }

  // AUTH: Success state — show email verification prompt, not auto-login
  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 text-center animate-fade-in">
        {/* Email icon */}
        <div
          className="w-16 h-16 flex items-center justify-center"
          style={{
            borderRadius:    '50%',
            backgroundColor: 'rgba(6,100,232,0.10)',
            border:          '1px solid rgba(6,100,232,0.25)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0664e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize:   '28px',
              fontWeight: 400,
              color:      '#ffffff',
              margin:     0,
            }}
          >
            Check your email
          </h2>
          {/* AUTH: Tell user which address the verification was sent to */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '14px',
              color:      '#777a88',
              marginTop:  '8px',
              lineHeight: 1.6,
            }}
          >
            We sent a verification link to{' '}
            <span style={{ color: '#ffffff', fontWeight: 500 }}>{fields.email}</span>.
            <br />Click it to activate your account.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full flex items-center justify-center transition-colors duration-150"
          style={{
            backgroundColor: '#ffffff',
            color:           '#000000',
            border:          '1px solid #ffffff',
            borderRadius:    '2px',
            fontFamily:      'var(--font-inter)',
            fontSize:        '14px',
            fontWeight:      600,
            padding:         '11px',
            textDecoration:  'none',
          }}
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

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
          Create your account
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#777a88', margin: 0 }}>
          Free forever on Starter. No credit card required.
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

        <AuthInput
          label="Full name"
          value={fields.name}
          onChange={(v) => handleChange('name', v)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : null}
          placeholder="Arjun Kumar"
          autoComplete="name"
          autoFocus
        />

        <AuthInput
          label="Email address"
          type="email"
          value={fields.email}
          onChange={(v) => handleChange('email', v)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : null}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <AuthInput
            label="Password"
            type="password"
            value={fields.password}
            onChange={(v) => handleChange('password', v)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? errors.password : null}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={fields.password} />
        </div>

        <AuthInput
          label="Confirm password"
          type="password"
          value={fields.confirm}
          onChange={(v) => handleChange('confirm', v)}
          onBlur={() => handleBlur('confirm')}
          error={touched.confirm ? errors.confirm : null}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />

        {/* Terms agreement */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => { setAgreed(e.target.checked); setFormError(null) }}
              className="sr-only"
            />
            <div
              className="w-4 h-4 flex items-center justify-center transition-all duration-150"
              style={{
                borderRadius:    '2px',
                backgroundColor: agreedToTerms ? '#0664e8' : '#121317',
                border:          agreedToTerms ? '1px solid #0664e8' : '1px solid #2e3038',
              }}
            >
              {agreedToTerms && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5"/>
                </svg>
              )}
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88', lineHeight: 1.6 }}>
            I agree to the{' '}
            <span style={{ color: '#0664e8', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#0664e8', cursor: 'pointer' }}>Privacy Policy</span>.
            This platform is for informational purposes only — not financial advice.
          </p>
        </label>

        {/* Submit */}
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
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Login link */}
      <p
        className="text-center"
        style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#777a88' }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{ color: '#0664e8', textDecoration: 'none', fontWeight: 500 }}
          className="hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
