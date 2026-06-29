'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

// ─────────────────────────────────────────────
//  NAV LINKS — marketing site
// ─────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/stocks',    label: 'Stocks' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/pricing',   label: 'Pricing' },
] as const

// ─────────────────────────────────────────────
//  LOGO
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Link href="/" className="shrink-0">
      <span
        className="text-white font-medium text-[17px] tracking-[-0.01em] leading-none"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Sentiquant
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────────
//  NAVBAR
//  isDashboard — when true, renders full-width
//  (no max-w-7xl) and hides the mobile hamburger
//  (dashboard pages have no sidebar to toggle).
// ─────────────────────────────────────────────
export function Navbar({ isDashboard = false }: { isDashboard?: boolean }) {
  const pathname = usePathname()
  const { data: session, status } = useSession() ?? {}
  const isAuthenticated = status === 'authenticated'
  const isLoading       = status === 'loading'
  const user            = session?.user ?? null
  const { logout }      = useAuth()

  const [menuOpen,     setMenuOpen]     = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = (user?.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  // Border appears on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Click outside closes profile dropdown
  useEffect(() => {
    if (!dropdownOpen) return
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Escape key closes profile dropdown
  useEffect(() => {
    if (!dropdownOpen) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [dropdownOpen])

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        height: 'var(--header-height)',
        transition: 'background-color 200ms, border-color 200ms',
        backgroundColor: scrolled ? '#08080a' : '#000000',
        borderBottom: scrolled ? '1px solid #2e3038' : '1px solid transparent',
      }}
    >
      <div className={`h-full flex items-center justify-between gap-6 ${isDashboard ? 'px-4 sm:px-5' : 'max-w-7xl mx-auto px-4 sm:px-6'}`}>

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`relative text-sm font-medium transition-colors duration-150 ${isActive ? 'text-white' : 'text-[#9194a1] hover:text-white'}`}
                style={{ padding: '6px 12px', borderRadius: '2px' }}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: '1px', backgroundColor: '#0664e8' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: auth-aware section */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2" aria-hidden="true">
              <div className="hidden sm:block w-14 h-8 rounded-[2px] bg-[#2e3038]/60 animate-pulse" />
              <div className="w-24 h-8 rounded-[2px] bg-[#2e3038]/60 animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            <>
              {/* Dashboard link */}
              <Link href="/dashboard">
                <button
                  className="border border-[#2e3038] rounded-[2px] bg-transparent text-[#acafb9] hover:border-[#464853] hover:text-white transition-colors duration-150 cursor-pointer"
                  style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500 }}
                >
                  Dashboard
                </button>
              </Link>

              {/* Profile circle + dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-label="Open profile menu"
                  aria-expanded={dropdownOpen}
                  className="flex items-center justify-center font-mono text-xs font-semibold cursor-pointer transition-colors duration-150"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: dropdownOpen ? 'rgba(6,100,232,0.18)' : 'rgba(6,100,232,0.10)',
                    border: '1px solid rgba(6,100,232,0.30)',
                    color: '#0664e8',
                  }}
                >
                  {initials}
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '232px',
                      backgroundColor: '#08080a',
                      border: '1px solid #2e3038',
                      borderRadius: '8px',
                      padding: '12px',
                      zIndex: 50,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', lineHeight: 1.3, marginBottom: '2px' }}>
                      {user.name ?? '—'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#777a88', lineHeight: 1.4, marginBottom: '12px' }}>
                      {user.email}
                    </p>
                    <div style={{ height: '1px', backgroundColor: '#2e3038', marginBottom: '8px' }} />
                    <button
                      onClick={() => { setDropdownOpen(false); logout() }}
                      className="w-full text-left rounded transition-colors duration-150 hover:bg-[#13131a] hover:text-white"
                      style={{ padding: '7px 8px', fontSize: '13px', color: '#9194a1', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <button
                  className="border border-[#2e3038] rounded-[2px] bg-transparent text-[#acafb9] hover:border-[#464853] hover:text-white transition-colors duration-150 cursor-pointer"
                  style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500 }}
                >
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="bg-white text-black border border-white rounded-[2px] hover:bg-[#e2e3e9] hover:border-[#e2e3e9] transition-colors duration-150 cursor-pointer"
                  style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600 }}
                >
                  Get started
                </button>
              </Link>
            </>
          )}

          {/* Mobile hamburger — marketing pages only; dashboard has no sidebar to toggle */}
          {!isDashboard && (
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center border border-[#2e3038] rounded-[2px] bg-transparent text-[#9194a1] transition-colors duration-150 cursor-pointer"
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

      {/* Mobile menu — marketing pages only */}
      {!isDashboard && menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 py-3 px-4 flex flex-col gap-1"
          style={{ backgroundColor: '#08080a', borderBottom: '1px solid #2e3038' }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className="block text-sm font-medium transition-colors duration-150"
                style={{
                  padding: '10px 12px',
                  color: isActive ? '#ffffff' : '#9194a1',
                  borderLeft: isActive ? '2px solid #0664e8' : '2px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}

          <div className="h-px my-1" style={{ backgroundColor: '#2e3038' }} />

          {isLoading ? (
            <div className="flex gap-2" aria-hidden="true">
              <div className="flex-1 h-9 rounded-[2px] bg-[#2e3038]/60 animate-pulse" />
              <div className="flex-1 h-9 rounded-[2px] bg-[#2e3038]/60 animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            <>
              <Link href="/dashboard" className="block">
                <button
                  className="w-full border border-[#2e3038] rounded-[2px] bg-transparent text-[#acafb9] hover:border-[#464853] hover:text-white transition-colors duration-150 cursor-pointer"
                  style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500 }}
                >
                  Dashboard
                </button>
              </Link>
              <div style={{ height: '1px', backgroundColor: '#2e3038', margin: '8px 0 4px' }} />
              <div style={{ padding: '8px 12px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}>
                  {user.name ?? '—'}
                </p>
                <p style={{ fontSize: '12px', color: '#777a88', marginTop: '2px' }}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="text-left rounded transition-colors duration-150 hover:text-white"
                style={{ padding: '10px 12px', fontSize: '13px', color: '#9194a1', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Log out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <button
                  className="w-full border border-[#2e3038] rounded-[2px] bg-transparent text-[#acafb9] hover:border-[#464853] hover:text-white transition-colors duration-150 cursor-pointer"
                  style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500 }}
                >
                  Log in
                </button>
              </Link>
              <Link href="/signup" className="flex-1">
                <button
                  className="w-full bg-white text-black border border-white rounded-[2px] hover:bg-[#e2e3e9] hover:border-[#e2e3e9] transition-colors duration-150 cursor-pointer"
                  style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600 }}
                >
                  Get started
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

// Export Logo for reuse in footer, auth layout, etc.
export { Logo }
