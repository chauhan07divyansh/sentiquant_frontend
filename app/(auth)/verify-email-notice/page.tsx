import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export default function VerifyEmailNoticePage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center animate-fade-in">

      {/* ── Icon ── */}
      <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>

      {/* ── Copy ── */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          Verify your email
        </h1>
        <p className="text-sm text-surface-400 leading-relaxed max-w-xs mx-auto">
          We sent a verification link to your email. Please check your inbox and click the link to activate your account.
        </p>
      </div>

      {/* ── Tips ── */}
      <div className="w-full rounded-xl bg-surface-900/60 border border-surface-800 px-5 py-4 text-left">
        <p className="text-xs font-semibold text-surface-300 mb-2">Didn&apos;t receive it?</p>
        <ul className="text-xs text-surface-500 space-y-1.5 leading-relaxed">
          <li>• Check your spam / junk folder</li>
          <li>• Make sure you entered the correct email address</li>
          <li>• Wait a few minutes — delivery can take up to 5 minutes</li>
        </ul>
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-col gap-3 w-full">
        <Link
          href="/login"
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-2.5 rounded-lg font-semibold text-sm transition-all duration-150',
            'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
            'hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.30)]',
          )}
        >
          Back to Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm text-surface-500 hover:text-surface-200 transition-colors"
        >
          Sign up with a different email →
        </Link>
      </div>
    </div>
  )
}
