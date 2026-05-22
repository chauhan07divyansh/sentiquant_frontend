'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils/cn'

export function GoogleSignInPrompt() {
  const { status } = useSession()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') return
    if (sessionStorage.getItem('google-prompt-dismissed')) return
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [status])

  if (status === 'authenticated' || dismissed || !visible) return null

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem('google-prompt-dismissed', '1')
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div
      className={cn(
        'fixed top-16 right-4 z-50 w-[340px]',
        'rounded-2xl border border-surface-700 bg-surface-950/98 backdrop-blur-xl shadow-2xl',
        'transition-all duration-500 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-brand-blue to-brand-cyan" />

      <div className="p-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-white leading-tight">
              Start analyzing stocks for free
            </p>
            <p className="text-xs text-surface-400 leading-relaxed">
              Get AI signals, targets & portfolio — no credit card needed
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-surface-500 hover:text-white hover:bg-surface-800 transition-all"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Value props */}
        <div className="flex flex-col gap-1.5">
          {[
            '10 free AI analyses every day',
            '240+ NSE & BSE stocks covered',
            'AI portfolio builder included',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
              <span className="text-xs text-surface-300">{item}</span>
            </div>
          ))}
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-center gap-3',
            'py-3 px-4 rounded-xl',
            'bg-white text-gray-800 font-semibold text-sm',
            'hover:bg-gray-50 active:bg-gray-100 transition-all duration-150',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'shadow-md hover:shadow-lg'
          )}
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Divider + email link */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-800" />
          <span className="text-[10px] text-surface-600">or</span>
          <div className="flex-1 h-px bg-surface-800" />
        </div>

        <a
          href="/login"
          className="text-center text-xs text-surface-500 hover:text-brand-cyan transition-colors"
        >
          Sign in with email →
        </a>
      </div>
    </div>
  )
}
