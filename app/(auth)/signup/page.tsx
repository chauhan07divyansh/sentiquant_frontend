'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter }                         from 'next/navigation'
import Link                                  from 'next/link'
import { useAuth }                           from '@/hooks/useAuth'
import { cn }                                from '@/lib/utils/cn'

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
  score: number      // 0–4
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
    { label: 'Very weak', color: 'bg-rose-500'  },
    { label: 'Weak',      color: 'bg-orange-400' },
    { label: 'Fair',      color: 'bg-amber-400'  },
    { label: 'Good',      color: 'bg-brand-cyan'  },
    { label: 'Strong',    color: 'bg-emerald-400' },
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
              i < score ? color : 'bg-surface-800'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-[11px] font-medium',
        score <= 1 ? 'text-rose-400' : score === 2 ? 'text-amber-400' : 'text-brand-cyan'
      )}>
        {label}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
//  AUTH INPUT (shared component)
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
      <label className="text-xs font-medium text-surface-300">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
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
//  SIGNUP PAGE
// ─────────────────────────────────────────────
export default function SignupPage() {
  const { login, isAuthenticated, isLoading: sessionLoading } = useAuth()
  const router = useRouter()

  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formError, setFormError]   = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [agreedToTerms, setAgreed]  = useState(false)

  // AUTH: Already-authenticated users are sent straight to the dashboard
  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

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
      // ── For MVP, auto-login with demo credentials ──
      // In production: POST to /api/auth/register, then login.
      // For now, demo account is the only valid user.
      const error = await login(fields.email, fields.password)
      if (error) {
        // Show success state — registration would succeed in real app
        setSuccess(true)
        return
      }
      // AUTH: Successful signup + auto-login → send to dashboard
      router.replace('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) return null

  // ── Success state ──
  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 border border-brand-cyan/25 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div>
          {/* FIXED: text-white on light background — use text-primary pattern */}
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">Account created!</h2>
          <p className="text-sm text-surface-400 mt-1.5">
            Welcome to Sentiquant, {fields.name.split(' ')[0]}.
          </p>
        </div>
        <Link
          href="/login"
          className="w-full flex items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 transition-all duration-150"
        >
          Sign in to your account
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Heading */}
      <div className="text-center flex flex-col gap-1.5">
        {/* CONTENT: "edge" resonates with semi-technical traders; specific value prop in subtitle */}
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Your edge starts here
        </h1>
        <p className="text-sm text-surface-400">
          Free AI analysis on 250+ NSE &amp; BSE stocks. No credit card needed.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {formError && (
          <div role="alert" className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-400/8 border border-rose-400/20 text-xs text-rose-300 leading-relaxed">
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
            <div className={cn(
              'w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center',
              agreedToTerms
                ? 'bg-gradient-to-r from-brand-blue to-brand-cyan border-brand-blue'
                : 'bg-surface-900 border-surface-600 group-hover:border-surface-400'
            )}>
              {agreedToTerms && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5"/>
                </svg>
              )}
            </div>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            I agree to the{' '}
            <span className="text-brand-cyan hover:text-brand-blue cursor-pointer transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="text-brand-cyan hover:text-brand-blue cursor-pointer transition-colors">Privacy Policy</span>.
            This platform is for informational purposes only — not financial advice.
          </p>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-center gap-2 mt-1',
            'py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
            'bg-gradient-to-r from-brand-blue to-brand-cyan text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950',
          )}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating account…
            </>
          ) : (
            'Create free account'
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-surface-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-brand-cyan hover:text-brand-blue transition-colors underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
