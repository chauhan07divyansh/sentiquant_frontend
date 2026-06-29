'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Navbar'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore, useUIStore } from '@/store'

// ─────────────────────────────────────────────
//  BREADCRUMB
// ─────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  stocks:    'Stocks',
  portfolio: 'Portfolio',
  blogs:     'Blogs',
  about:     'About',
  contact:   'Contact',
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-surface-500">
      <Link href="/" className="hover:text-surface-300 transition-colors">Home</Link>
      {segments.map((seg, i) => {
        const href  = '/' + segments.slice(0, i + 1).join('/')
        const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
        const isLast = i === segments.length - 1
        return (
          <span key={href} className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
              <path d="M3.5 2l3 3-3 3"/>
            </svg>
            {/* FIXED: breadcrumb current-page label invisible in light mode */}
            {isLast ? (
              <span className="text-surface-900 dark:text-white font-medium" aria-current="page">{label}</span>
            ) : (
              <Link href={href} className="hover:text-surface-300 transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

// ─────────────────────────────────────────────
//  DASHBOARD HEADER
// ─────────────────────────────────────────────
export function DashboardHeader() {
  const { user }                              = useAuthStore()
  const { toggleSidebar, openMobileSidebar } = useUIStore() // FIXED: import openMobileSidebar for mobile drawer

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-5 border-b border-surface-800 bg-surface-950/90 backdrop-blur-md shrink-0"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Left: sidebar toggle + logo + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Sidebar collapse toggle (mobile or always) */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              openMobileSidebar() // FIXED: mobile tap opens full drawer instead of expanding icon rail
            } else {
              toggleSidebar() // existing desktop collapse behavior unchanged
            }
          }}
          aria-label="Toggle sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-500 hover:text-white hover:bg-surface-800 transition-all duration-150"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M2 4h11M2 7.5h11M2 11h11"/>
          </svg>
        </button>

        <Logo size="sm" />
        <div className="h-4 w-px bg-surface-800 hidden sm:block" aria-hidden="true" />
        <Breadcrumb />
      </div>

      {/* Right: theme + user avatar */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2 pl-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center bg-brand-blue/12 border border-brand-cyan/25 text-brand-cyan font-mono text-xs font-semibold shrink-0 cursor-default"
              title={user.name}
              aria-label={`Logged in as ${user.name}`}
            >
              {initials}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
