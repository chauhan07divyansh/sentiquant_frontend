import Link from 'next/link'
import { Logo } from '@/components/layout/Navbar'

// ─────────────────────────────────────────────
//  AUTH LAYOUT
//  Used by: /login, /signup
//  Minimal: just Logo + centered card + back link
//  No Navbar, no Sidebar, no Footer clutter
// ─────────────────────────────────────────────
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Brand ambient glow top */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.10) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Logo />
        <Link
          href="/"
          className="text-xs text-surface-500 hover:text-surface-200 transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 2L3 6l4.5 4"/>
          </svg>
          Back to home
        </Link>
      </header>

      {/* Centered content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer note */}
      <footer className="relative z-10 text-center py-5 text-xs text-surface-700">
        For informational purposes only. Not financial advice.
      </footer>
    </div>
  )
}
