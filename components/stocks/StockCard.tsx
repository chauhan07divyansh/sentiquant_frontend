'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

// TWO-TIER: Lightweight stock items for the list page.
// No analysis data — just symbol + name. The detail page (/stocks/[symbol])
// fetches full AI analysis from Flask backend on demand.

// ─────────────────────────────────────────────
//  SHARED PROP TYPE
// ─────────────────────────────────────────────
interface StockListItemProps {
  symbol:   string
  name:     string
  sector?:  string
  className?: string
}

// ─────────────────────────────────────────────
//  STOCK LIST CARD — grid view
//  TWO-TIER: Takes only { symbol, name }. Zero API calls here.
//  Click → /stocks/[symbol] which triggers the Flask backend.
// ─────────────────────────────────────────────
export const StockListCard = memo(function StockListCard({ symbol, name, sector, className }: StockListItemProps) {
  // POLISH: 3D tilt — DOM-direct mutation, no state, desktop-only.
  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(max-width: 1023px)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top)  / rect.height
    const tiltX = (y - 0.5) *  6
    const tiltY = (0.5 - x) *  6
    el.style.transition = 'none'
    el.style.transform  = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`
  }, [])

  const handleTiltLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.style.transition = ''
    el.style.transform  = ''
  }, [])

  return (
    // PERF: prefetch={false} — 50 cards visible; eager prefetch fires 50 route
    //       prefetches simultaneously. Opt out to save bandwidth.
    <Link
      href={`/stocks/${symbol}`}
      prefetch={false}
      className="block group"
      aria-label={`View ${symbol} AI analysis`}
    >
      <div
        onMouseMove={handleTiltMove}
        onMouseLeave={handleTiltLeave}
        className={cn(
          'relative rounded-xl',
          'bg-white dark:bg-surface-900',
          'border border-gray-200 dark:border-surface-800',
          'shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)]',
          'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          // POLISH: GPU hint so tilt stays 60fps
          'will-change-transform',
          'group-hover:-translate-y-[4px] group-hover:shadow-lg dark:group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]',
          'hover:shadow-[0_0_24px_rgba(59,130,246,0.12)] hover:border-brand-blue/20',
          className
        )}
      >
        {/* TWO-TIER: Fixed gradient accent — no score-based coloring needed */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-brand-blue to-brand-cyan" />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex flex-col gap-5 p-5 pt-6">

          {/* ── Header: symbol + name + chevron ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-display font-bold text-2xl text-surface-900 dark:text-white leading-none tracking-tight">
                {symbol}
              </span>
              <span className="text-xs text-surface-500 truncate leading-tight">{name}</span>
              {sector && (
                <span className="text-[10px] font-medium text-surface-500 bg-surface-100 dark:bg-surface-800/60 border border-gray-200 dark:border-surface-700/50 px-1.5 py-0.5 rounded-md self-start leading-none mt-0.5 truncate max-w-full">
                  {sector}
                </span>
              )}
            </div>
            {/* Chevron — animates on hover to signal navigation */}
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round"
              className="text-surface-600 shrink-0 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all duration-150 mt-1"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </div>

          {/* ── Footer: CTA hint + exchange tag ── */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-surface-800">
            <span className="text-xs text-brand-cyan/70 group-hover:text-brand-cyan transition-colors duration-150 font-medium">
              View AI analysis
            </span>
            <span className="text-[10px] font-mono text-surface-500 dark:text-surface-600 uppercase tracking-wider">
              NSE
            </span>
          </div>

        </div>
      </div>
    </Link>
  )
})

// ─────────────────────────────────────────────
//  STOCK LIST ROW — compact list view
//  TWO-TIER: Takes only { symbol, name }. Zero API calls here.
// ─────────────────────────────────────────────
export const StockListRow = memo(function StockListRow({ symbol, name, sector }: StockListItemProps) {
  return (
    <Link
      href={`/stocks/${symbol}`}
      prefetch={false}
      className="relative flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800/50 last:border-b-0 group hover:bg-gray-50 dark:hover:bg-surface-800/30 transition-all duration-150"
      aria-label={`View ${symbol} AI analysis`}
    >
      {/* Left accent line on hover */}
      <div className="absolute left-0 inset-y-0 w-0.5 bg-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-r" />

      {/* Symbol + company name */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="font-display font-bold text-sm text-surface-900 dark:text-white tracking-tight">
          {symbol}
        </span>
        <span className="text-xs text-surface-500 truncate">{name}</span>
      </div>

      {/* Sector + exchange */}
      {sector && (
        <span className="text-[10px] text-surface-500 hidden md:block whitespace-nowrap shrink-0 max-w-[140px] truncate">
          {sector}
        </span>
      )}
      <span className="text-[10px] font-mono text-surface-500 uppercase tracking-wider hidden sm:block shrink-0">
        NSE
      </span>

      {/* Chevron — animates on hover */}
      <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round"
        className="text-surface-700 shrink-0 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all duration-150"
      >
        <path d="M4.5 2l4 4-4 4" />
      </svg>
    </Link>
  )
})
