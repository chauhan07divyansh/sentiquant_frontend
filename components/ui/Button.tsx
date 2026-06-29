'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  VARIANTS & SIZES
// ─────────────────────────────────────────────

const variants = {
  primary:   'btn-primary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  secondary: [
    'bg-surface-800 border border-surface-700 text-surface-200',
    'hover:bg-surface-700 hover:border-surface-600 hover:text-white',
  ].join(' '),
  link: [
    'bg-transparent border-none text-brand-cyan underline-offset-4',
    'hover:underline p-0 h-auto',
  ].join(' '),
} as const

const sizes = {
  xs: 'text-xs px-2.5 py-1.5 gap-1.5',
  sm: 'text-xs px-3 py-2 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-sm px-5 py-3 gap-2',
  xl: 'text-base px-6 py-3.5 gap-2.5',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize    = keyof typeof sizes

// ─────────────────────────────────────────────
//  SPINNER
// ─────────────────────────────────────────────
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────
//  BUTTON
// ─────────────────────────────────────────────
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:     ButtonVariant
  size?:        ButtonSize
  loading?:     boolean
  leftIcon?:    ReactNode
  rightIcon?:   ReactNode
  fullWidth?:   boolean
}

// POLISH: spawn a ripple span at the click position, remove it after animation ends
function spawnRipple(e: React.MouseEvent<HTMLButtonElement>) {
  const btn  = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const span = document.createElement('span')
  span.className = 'animate-ripple'
  span.style.cssText = [
    `left:${e.clientX - rect.left}px`,
    `top:${e.clientY - rect.top}px`,
    'background:rgba(255,255,255,0.18)',
  ].join(';')
  btn.appendChild(span)
  span.addEventListener('animationend', () => span.remove(), { once: true })
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      onClick,   // POLISH: destructured so we can wrap with ripple without double-fire
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'btn-base',
          'overflow-hidden',  // POLISH: clip ripple span to button bounds
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          // DESIGN: consistent focus ring on all buttons for keyboard navigation
          'focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950',
          className
        )}
        aria-disabled={isDisabled}
        onClick={(e) => {
          // POLISH: spawn ripple at click point, then call original handler
          if (!isDisabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            spawnRipple(e)
          }
          onClick?.(e)
        }}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}

        {children && <span className="truncate">{children}</span>}

        {!loading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
