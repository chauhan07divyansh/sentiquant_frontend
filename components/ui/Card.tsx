import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  CARD ROOT
// ─────────────────────────────────────────────
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'flat' | 'highlight'
  /** Adds a coloured left border accent */
  accent?:  'teal' | 'indigo' | 'success' | 'warning' | 'danger'
  hover?:   boolean
  padding?:  'none' | 'sm' | 'md' | 'lg'
}

const accentMap = {
  teal:    'border-l-2 border-l-brand-cyan',
  indigo:  'border-l-2 border-l-brand-blue',
  success: 'border-l-2 border-l-emerald-400',
  warning: 'border-l-2 border-l-amber-400',
  danger:  'border-l-2 border-l-rose-400',
}

const variantMap = {
  default:   'card',
  glass:     'card-glass',
  // light: bg-surface-900 → white (via globals.css), border-surface-800 → slate-200
  flat:      'bg-surface-900 border border-surface-800 rounded-xl',
  // light: bg-surface-900 → white, shadow-glow-blue toned down via globals.css .btn rule
  highlight: 'bg-surface-900 border border-brand-blue/20 rounded-xl shadow-[0_0_24px_rgba(59,130,246,0.12)] light:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
}

const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      accent,
      hover   = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        variantMap[variant],
        paddingMap[padding],
        accent && accentMap[accent],
        hover && 'cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'

// ─────────────────────────────────────────────
//  CARD HEADER
// ─────────────────────────────────────────────
interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?:    ReactNode
  subtitle?: ReactNode
  action?:   ReactNode
}

function CardHeader({ title, subtitle, action, className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)} {...props}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-sm font-semibold text-white font-sans tracking-tight leading-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────
//  CARD CONTENT
// ─────────────────────────────────────────────
function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
//  CARD FOOTER
// ─────────────────────────────────────────────
function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // border-surface-800 → #e2e8f0 in light mode via globals.css rule B
        'mt-4 pt-4 border-t border-surface-800 flex items-center justify-between gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
//  CARD DIVIDER
// ─────────────────────────────────────────────
function CardDivider({ className }: { className?: string }) {
  return <hr className={cn('border-surface-800 my-4', className)} />
}

// ─────────────────────────────────────────────
//  STAT CARD — Quick KPI display
// ─────────────────────────────────────────────
interface StatCardProps {
  label:    string
  value:    ReactNode
  sub?:     ReactNode
  icon?:    ReactNode
  trend?:   'up' | 'down' | 'neutral'
  className?: string
}

function StatCard({ label, value, sub, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-surface-400 uppercase tracking-widest">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-2xl font-semibold text-white leading-none tabular-nums">
          {value}
        </span>
        {sub && (
          <span
            className={cn(
              'text-xs mb-0.5 font-mono tabular-nums',
              trend === 'up'      && 'text-emerald-400',
              trend === 'down'    && 'text-rose-400',
              trend === 'neutral' && 'text-surface-400',
              !trend              && 'text-surface-400'
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDivider,
  StatCard,
}
