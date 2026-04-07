import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  BASE SKELETON BLOCK
// ─────────────────────────────────────────────
interface SkeletonProps {
  className?: string
  height?:    string | number
  width?:     string | number
  rounded?:   'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className, height, width, rounded = 'md' }: SkeletonProps) {
  const roundedMap = {
    sm:   'rounded',
    md:   'rounded-md',
    lg:   'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn('skeleton', roundedMap[rounded], className)}
      style={{ height, width }}
      aria-hidden="true"
      role="presentation"
    />
  )
}

// ─────────────────────────────────────────────
//  STOCK CARD SKELETON — matches StockCard layout exactly
// ─────────────────────────────────────────────
export function StockCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="relative rounded-xl border border-surface-800 bg-gradient-to-b from-surface-900 to-surface-950 overflow-hidden"
      aria-busy="true"
      aria-label="Loading stock data"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-surface-800" />

      <div className="flex flex-col gap-4 p-5 pt-6">
        {/* Header: symbol/name + score badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton width={64} height={18} />
            <Skeleton width={130} height={11} />
          </div>
          {/* Score badge */}
          <Skeleton width={48} height={48} rounded="lg" className="shrink-0" />
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-end gap-2.5">
            <Skeleton width={96} height={30} />
            <Skeleton width={52} height={14} rounded="full" />
          </div>
          <Skeleton width={68} height={20} rounded="full" />
        </div>

        {/* Score bar */}
        <Skeleton height={6} rounded="full" />

        {/* Targets grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={48} rounded="lg" />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-800/50">
          <Skeleton width={80} height={18} rounded="full" />
          <Skeleton width={44} height={10} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PORTFOLIO TABLE SKELETON
// ─────────────────────────────────────────────
export function PortfolioTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card p-0 overflow-hidden" aria-busy="true">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-800 flex gap-6">
        {[140, 90, 80, 80, 80, 80].map((w, i) => (
          <Skeleton key={i} width={w} height={12} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-5 py-4 border-b border-surface-800/50 flex gap-6 items-center"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex flex-col gap-1.5" style={{ width: 140 }}>
            <Skeleton width={64} height={13} />
            <Skeleton width={100} height={10} />
          </div>
          {[90, 80, 80, 80, 80].map((w, j) => (
            <Skeleton key={j} width={w} height={13} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  ANALYSIS SKELETON (stock detail page)
// ─────────────────────────────────────────────
export function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading analysis">
      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 flex flex-col gap-3">
            <Skeleton width={80} height={11} />
            <Skeleton width={100} height={24} />
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Trading plan */}
        <div className="card p-5 flex flex-col gap-4">
          <Skeleton width={120} height={14} />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton width={60} height={10} />
                <Skeleton height={18} />
              </div>
            ))}
          </div>
        </div>
        {/* Technicals */}
        <div className="card p-5 flex flex-col gap-3">
          <Skeleton width={140} height={14} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={12} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  STOCK LIST SKELETON (stocks page grid)
// ─────────────────────────────────────────────
export function StockGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        // PERF: stagger each card by 60ms so they cascade in rather than all popping at once
        <StockCardSkeleton key={i} delay={i * 60} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  ENHANCEMENT: DASHBOARD STAT CARDS SKELETON
//  Matches the 4-card quick-stats grid on the dashboard home page.
// ─────────────────────────────────────────────
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-surface-900/80 border border-gray-100 dark:border-surface-800"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton width={32} height={32} rounded="lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton width={80} height={22} />
            <Skeleton width={60} height={10} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
//  ENHANCEMENT: MARKET OVERVIEW SKELETON
//  Matches the 3-column MarketOverview component.
// ─────────────────────────────────────────────
export function MarketOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton width={120} height={13} />
        <div className="flex-1 h-px bg-gray-100 dark:bg-surface-800" />
        <Skeleton width={40} height={10} />
      </div>
      {/* 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-5 rounded-xl bg-white dark:bg-surface-900/60 border border-gray-200 dark:border-surface-700/60"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Skeleton width={64} height={10} />
            <Skeleton width={120} height={28} />
            <Skeleton width={80} height={20} rounded="full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  ENHANCEMENT: RECENT ACTIVITY SKELETON
//  Matches the RecentSignals / TopPerformers card rows.
// ─────────────────────────────────────────────
export function RecentActivitySkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-0 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-surface-800/50 last:border-b-0"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Skeleton width={48} height={13} />
              <Skeleton width={28} height={16} rounded="sm" />
            </div>
            <Skeleton width={110} height={10} />
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Skeleton width={56} height={12} />
            <Skeleton width={44} height={10} />
          </div>
          <Skeleton width={40} height={28} rounded="md" className="shrink-0" />
        </div>
      ))}
    </div>
  )
}
