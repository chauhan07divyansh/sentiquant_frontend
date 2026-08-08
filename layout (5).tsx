import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

// ─────────────────────────────────────────────
//  EMPTY STATE
//  Reusable zero-data placeholder with icon,
//  title, description, and optional action.
//  Used on stocks page (no search results),
//  portfolio page (no holdings), etc.
// ─────────────────────────────────────────────

// ENHANCEMENT: SVG illustration variants — rendered above the icon/title for richer empty states
const ILLUSTRATIONS = {
  stocks: (
    <svg viewBox="0 0 160 80" fill="none" className="w-40 h-20 opacity-30" aria-hidden="true">
      <polyline
        points="10,65 35,45 60,52 85,30 110,40 135,12 155,22"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-brand-cyan"
      />
      {[10,35,60,85,110,135,155].map((x, i) => {
        const y = [65,45,52,30,40,12,22][i]
        return <circle key={x} cx={x} cy={y} r="3.5" fill="currentColor" className="text-brand-blue" />
      })}
      <line x1="10" y1="72" x2="155" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" className="text-surface-700" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-30" aria-hidden="true">
      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="3" strokeDasharray="52 10 20 10" className="text-brand-cyan" />
      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="3" strokeDasharray="0 62 30 10" className="text-brand-blue" />
      <circle cx="40" cy="40" r="18" fill="currentColor" className="text-surface-900 dark:text-surface-950" />
      <text x="40" y="45" textAnchor="middle" fontSize="10" fill="currentColor" className="text-surface-600 font-mono">0%</text>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-30" aria-hidden="true">
      <circle cx="34" cy="34" r="20" stroke="currentColor" strokeWidth="3" className="text-surface-600" />
      <line x1="48" y1="48" x2="64" y2="64" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-surface-600" />
      <line x1="27" y1="34" x2="41" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-surface-700" />
      <line x1="34" y1="27" x2="34" y2="41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-surface-700" />
    </svg>
  ),
} as const

export type EmptyIllustration = keyof typeof ILLUSTRATIONS

interface EmptyStateProps {
  /** SVG/icon node rendered inside a styled container */
  icon?:          ReactNode
  title:          string
  description?:   string
  /** CTA or link — rendered as-is below the copy */
  action?:        ReactNode
  className?:     string
  // ENHANCEMENT: optional decorative illustration above the icon/title
  illustration?:  EmptyIllustration
}

export function EmptyState({ icon, title, description, action, className, illustration }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-5 py-24 text-center', className)}>
      {/* ENHANCEMENT: illustration rendered before icon when both are present */}
      {illustration && ILLUSTRATIONS[illustration]}

      {icon && (
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center',
            // bg-surface-800/60 → #f1f5f9 in light (via globals.css rule D)
            // border-surface-700 → #cbd5e1 in light (via globals.css rule B)
            'bg-surface-800/60 border border-surface-700 text-surface-500',
            // dark: subtle white inner glow · light: faint downward shadow for depth
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] light:shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-w-xs">
        <p className="text-sm font-semibold text-surface-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-xs text-surface-500 leading-relaxed">{description}</p>
        )}
      </div>

      {action && action}
    </div>
  )
}
