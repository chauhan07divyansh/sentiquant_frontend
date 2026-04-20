'use client'

import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/store'

interface ThemeToggleProps {
  collapsed?: boolean   // sidebar mode — show label or not
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useUIStore()
  const isDark = theme === 'dark'

  // ── Sidebar mode (with optional label) ──
  if (!collapsed) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium',
          'text-surface-500 hover:text-surface-200 hover:bg-surface-800/50',
          'transition-all duration-150'
        )}
      >
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="shrink-0">
            <circle cx="7.5" cy="7.5" r="3"/>
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.1 3.1l1.1 1.1M10.8 10.8l1.1 1.1M10.8 3.1l-1.1 1.1M4.2 10.8l-1.1 1.1"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="shrink-0">
            <path d="M12.5 9A6 6 0 015 1.5a6 6 0 000 11 6 6 0 007.5-3.5z"/>
          </svg>
        )}
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    )
  }

  // ── Collapsed sidebar / navbar mode (icon only) ──
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg',
        'border border-surface-700 text-surface-400',
        'hover:border-surface-500 hover:text-white hover:bg-surface-800',
        'transition-all duration-150'
      )}
    >
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="7.5" cy="7.5" r="3"/>
          <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.1 3.1l1.1 1.1M10.8 10.8l1.1 1.1M10.8 3.1l-1.1 1.1M4.2 10.8l-1.1 1.1"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12.5 9A6 6 0 015 1.5a6 6 0 000 11 6 6 0 007.5-3.5z"/>
        </svg>
      )}
    </button>
  )
}
