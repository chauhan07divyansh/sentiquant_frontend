'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react' // IMPROVED: needed for route-change close effect
import { cn } from '@/lib/utils/cn'
import { useUIStore, useAuthStore } from '@/store'
import { ThemeToggle } from './ThemeToggle'

// ─────────────────────────────────────────────
//  SIDEBAR NAV ITEMS
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1.2"/>
        <rect x="9" y="1" width="6" height="6" rx="1.2"/>
        <rect x="1" y="9" width="6" height="6" rx="1.2"/>
        <rect x="9" y="9" width="6" height="6" rx="1.2"/>
      </svg>
    ),
  },
  {
    label: 'Stocks',
    href: '/stocks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 11L5.5 7.5L8.5 9.5L13 5"/>
        <circle cx="13" cy="5" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M2 13.5H14"/>
      </svg>
    ),
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="12" height="9" rx="2"/>
        <path d="M5 5V4a3 3 0 016 0v1"/>
        <path d="M2 8.5h12"/>
      </svg>
    ),
  },
  {
    label: 'Blogs',
    href: '/blogs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 3h11M2.5 6.5h8M2.5 10h6M2.5 13h9"/>
      </svg>
    ),
  },
  {
    label: 'About',
    href: '/about',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6"/>
        <path d="M8 7v5M8 5.5v.5"/>
      </svg>
    ),
  },
] as const

// ─────────────────────────────────────────────
//  NAV ITEM
// ─────────────────────────────────────────────
function NavItem({
  href,
  icon,
  label,
  isActive,
  collapsed,
}: {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'sidebar-link relative group',
        isActive && 'active',
        collapsed && 'justify-center px-0'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={cn('shrink-0', isActive ? 'text-brand-cyan' : 'text-surface-500 group-hover:text-surface-200')}>
        {icon}
      </span>

      {!collapsed && (
        <span className="truncate">{label}</span>
      )}

      {/* Tooltip in collapsed mode */}
      {collapsed && (
        <span className="
          pointer-events-none absolute left-full ml-2.5 z-50
          px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap
          bg-surface-800 border border-surface-700 text-white
          opacity-0 translate-x-[-4px]
          group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-150
        ">
          {label}
        </span>
      )}
    </Link>
  )
}

// ─────────────────────────────────────────────
//  USER PROFILE (bottom of sidebar)
// ─────────────────────────────────────────────
function UserProfile({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuthStore()
  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={cn(
      'flex items-center gap-3 px-2 py-3 rounded-lg',
      'border-t border-surface-800 mt-auto',
      collapsed && 'justify-center px-0'
    )}>
      {/* Avatar */}
      <div className="
        w-8 h-8 rounded-full shrink-0 flex items-center justify-center
        bg-brand-blue/12 border border-brand-cyan/25 text-brand-cyan
        font-mono text-xs font-semibold
      ">
        {initials}
      </div>

      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            {/* FIXED: sidebar username text-white invisible on light sidebar background */}
            <p className="text-xs font-semibold text-surface-900 dark:text-white truncate leading-none">{user.name}</p>
            <p className="text-[10px] text-surface-500 truncate mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="shrink-0 text-surface-600 hover:text-rose-400 transition-colors p-1 rounded"
            aria-label="Log out"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9.5 10L12 7l-2.5-3M12 7H5"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  COLLAPSE TOGGLE BUTTON
// ─────────────────────────────────────────────
function CollapseButton({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium',
        // hover:text-surface-300 → slate-600 in light (via globals.css)
        // hover:bg-surface-800/50 → #f1f5f9 in light (via globals.css rule D)
        'text-surface-600 hover:text-surface-300 hover:bg-surface-800/50 transition-all duration-150',
        collapsed && 'justify-center px-0'
      )}
    >
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        className={cn('transition-transform duration-200 shrink-0', collapsed && 'rotate-180')}
      >
        <path d="M9 2L4 7l5 5"/>
      </svg>
      {!collapsed && <span>Collapse</span>}
    </button>
  )
}

// ─────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────
export function Sidebar() {
  const pathname   = usePathname()
  const { sidebarOpen, toggleSidebar, isMobileOpen, closeMobileSidebar } = useUIStore() // IMPROVED: added isMobileOpen, closeMobileSidebar for mobile drawer
  const collapsed  = !sidebarOpen

  useEffect(() => {
    closeMobileSidebar() // IMPROVED: auto-close mobile sidebar on navigation
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* IMPROVED: mobile overlay — tapping outside closes the sidebar drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'flex flex-col gap-1 shrink-0',
          'bg-surface-950 border-r border-surface-800',
          // DESIGN: 300ms (was 200ms) — smoother collapse feels less jarring
          'transition-all duration-300 ease-out',
          'h-[calc(100dvh-var(--header-height))] sticky top-[var(--header-height)]',
          'overflow-hidden',
          // FIXED: sidebar now slides in as a full-height drawer on mobile instead of always occupying 60px
          'fixed lg:relative z-40 lg:z-auto transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full', // FIXED: hidden off-screen when closed on mobile
          'lg:translate-x-0', // FIXED: always visible on desktop regardless of mobile state
          collapsed
            ? 'w-[var(--sidebar-collapsed-width)] px-2 py-3'
            : 'w-[var(--sidebar-width)] px-3 py-3'
        )}
        aria-label="Dashboard navigation"
      >
        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {/* Section label */}
          {!collapsed && (
            <p className="text-[10px] font-semibold text-surface-600 uppercase tracking-widest px-2 mb-1.5 mt-1">
              Navigation
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              ((item.href as string) !== '/' && pathname.startsWith(item.href))

            return (
              <NavItem
                key={item.href}
                {...item}
                isActive={isActive}
                collapsed={collapsed}
              />
            )
          })}

          {/* Divider */}
          <div className="h-px bg-surface-800 my-2" />

          {/* External links */}
          {!collapsed && (
            <p className="text-[10px] font-semibold text-surface-600 uppercase tracking-widest px-2 mb-1.5">
              More
            </p>
          )}

          <Link
            href="/contact"
            className={cn('sidebar-link group', collapsed && 'justify-center px-0')}
            title={collapsed ? 'Contact' : undefined}
          >
            <span className="text-surface-500 group-hover:text-surface-200 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 10.667A1.333 1.333 0 0112.667 12H4L1.333 14.667V3.333A1.333 1.333 0 012.667 2h10A1.333 1.333 0 0114 3.333v7.334z"/>
              </svg>
            </span>
            {!collapsed && <span>Contact</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-2.5 z-50 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap bg-surface-800 border border-surface-700 text-white opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                Contact
              </span>
            )}
          </Link>
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col gap-1">
          <ThemeToggle collapsed={collapsed} />
          <CollapseButton collapsed={collapsed} onToggle={toggleSidebar} />
          <UserProfile collapsed={collapsed} />
        </div>
      </aside>
    </>
  )
}
