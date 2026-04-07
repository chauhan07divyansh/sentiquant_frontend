'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/store'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────
//  NAV LINKS — marketing site
// ─────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/stocks',   label: 'Stocks' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/pricing',  label: 'Pricing' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

// ─────────────────────────────────────────────
//  LOGO
// ─────────────────────────────────────────────
function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      {/* Icon mark */}
      <div className="relative w-7 h-7 shrink-0">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="28" height="28" rx="7" fill="#3B82F6" fillOpacity="0.12" />
          <path d="M6 18 L10 13 L14 15.5 L19 9 L22 11" stroke="url(#logoGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="11" r="2" fill="#06B6D4" />
          <path d="M6 21 L22 21" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>
      {/* Wordmark */}
      <span
        className={cn(
          'font-display font-bold tracking-tight leading-none',
          'text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-cyan',
          sizeMap[size]
        )}
      >
        Sentiquant
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────────
//  THEME TOGGLE
// ─────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore()
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
        'border border-surface-700 text-surface-400',
        'hover:border-surface-500 hover:text-white hover:bg-surface-800'
      )}
    >
      {theme === 'dark' ? (
        /* Sun icon */
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="7.5" cy="7.5" r="3" />
          <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.1 3.1l1.1 1.1M10.8 10.8l1.1 1.1M10.8 3.1l-1.1 1.1M4.2 10.8l-1.1 1.1" />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12.5 9A6 6 0 015 1.5a6 6 0 000 11 6 6 0 007.5-3.5z" />
        </svg>
      )}
    </button>
  )
}

// ─────────────────────────────────────────────
//  NAVBAR
//  isDashboard — when true, renders in dashboard
//  mode: sidebar toggle replaces mobile hamburger,
//  user avatar replaces auth buttons, full-width
//  container (no max-w-7xl), same nav links.
// ─────────────────────────────────────────────
export function Navbar({ isDashboard = false }: { isDashboard?: boolean }) { // IMPROVED: isDashboard prop unifies header across marketing + dashboard routes
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore() // IMPROVED: pull user for dashboard avatar
  const { toggleSidebar, openMobileSidebar } = useUIStore() // IMPROVED: sidebar controls used in dashboard mode
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // IMPROVED: user initials for dashboard avatar — same logic as DashboardHeader
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // Add border on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        scrolled
          // DESIGN: backdrop-blur-xl (was md) — stronger blur reads better over busy chart content
          ? 'bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/80'
          : 'bg-transparent border-b border-transparent'
      )}
      style={{ height: 'var(--header-height)' }}
    >
      {/* FIXED: dashboard mode drops max-w-7xl so header spans full width above sidebar */}
      <div className={cn(
        'h-full flex items-center justify-between gap-6',
        isDashboard
          ? 'px-4 sm:px-5'
          : 'max-w-7xl mx-auto px-4 sm:px-6'
      )}>

        {/* Left: sidebar toggle (dashboard only) + Logo */}
        <div className="flex items-center gap-3">
          {/* IMPROVED: sidebar hamburger in dashboard mode — same toggle logic as old DashboardHeader */}
          {isDashboard && (
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  openMobileSidebar() // FIXED: mobile tap opens full drawer
                } else {
                  toggleSidebar() // FIXED: desktop collapses to icon rail
                }
              }}
              aria-label="Toggle sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-500 hover:text-white hover:bg-surface-800 transition-all duration-150"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 4h11M2 7.5h11M2 11h11"/>
              </svg>
            </button>
          )}
          <Logo />
        </div>

        {/* Desktop nav — shown on both marketing and dashboard for visual continuity */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    // DESIGN: brand-cyan active link with underline indicator — clearer than bg-only highlight
                    ? 'relative text-brand-cyan bg-brand-cyan/8 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-brand-cyan/50 after:rounded-full'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: theme toggle + auth buttons (marketing) or user avatar (dashboard) */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* IMPROVED: dashboard mode shows user avatar; marketing mode shows auth buttons */}
          {isDashboard ? (
            user && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center bg-brand-blue/12 border border-brand-cyan/25 text-brand-cyan font-mono text-xs font-semibold shrink-0 cursor-default"
                title={user.name}
                aria-label={`Logged in as ${user.name}`}
              >
                {initials}
              </div>
            )
          ) : (
            isAuthenticated ? (
              <Link href="/portfolio">
                <Button size="sm" variant="ghost">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button size="sm" variant="ghost">Log in</Button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 transition-all duration-200">
                    Get started
                  </button>
                </Link>
              </>
            )
          )}

          {/* FIXED: mobile hamburger only on marketing — dashboard uses sidebar toggle on the left */}
          {!isDashboard && (
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-surface-700 text-surface-400 hover:text-white transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 4h10M2 7h10M2 10h10" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu — marketing only; dashboard navigation is handled by sidebar */}
      {!isDashboard && menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface-950/95 backdrop-blur-md border-b border-surface-800 py-3 px-4 flex flex-col gap-1 animate-fade-in">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-cyan bg-brand-cyan/8'
                    : 'text-surface-300 hover:text-white hover:bg-surface-800'
                )}
              >
                {label}
              </Link>
            )
          })}
          <div className="h-px bg-surface-800 my-1" />
          {isAuthenticated ? (
            <Link href="/portfolio">
              <Button fullWidth variant="ghost" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <Button fullWidth variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button fullWidth size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

// Export Logo for reuse in sidebar
export { Logo }
