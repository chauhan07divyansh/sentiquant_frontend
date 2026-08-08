'use client'

import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  FIELD WRAPPER
// ─────────────────────────────────────────────
interface FieldProps {
  label?:    string
  error?:    string
  hint?:     string
  required?: boolean
  children:  ReactNode
  className?: string
}

export function Field({ label, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        // text-surface-300 → #475569 (slate-600) in light mode via globals.css
        <label className="text-xs font-medium text-surface-300 leading-none">
          {label}
          {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-rose-400 leading-none flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5h1v4h-1v-4zm0 5h1v1h-1v-1z"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-surface-500 leading-none">{hint}</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  TEXT / NUMBER INPUT
// ─────────────────────────────────────────────
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string
  error?:     string
  hint?:      string
  leftAddon?: ReactNode   // e.g. "₹" or a search icon
  rightAddon?: ReactNode  // e.g. "INR" or a clear button
  fieldClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, fieldClassName, required, ...props }, ref) => (
    <Field label={label} error={error} hint={hint} required={required} className={fieldClassName}>
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 flex items-center text-surface-400 text-sm pointer-events-none select-none">
            {leftAddon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'input-base font-mono tabular-nums',
            leftAddon  && 'pl-8',
            rightAddon && 'pr-12',
            error      && 'input-error',
            className
          )}
          required={required}
          {...props}
        />
        {rightAddon && (
          <div className="absolute right-3 flex items-center text-surface-400 text-xs pointer-events-none select-none">
            {rightAddon}
          </div>
        )}
      </div>
    </Field>
  )
)
Input.displayName = 'Input'

// ─────────────────────────────────────────────
//  SELECT
// ─────────────────────────────────────────────
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string
  error?:       string
  hint?:        string
  placeholder?: string
  fieldClassName?: string
  options:      Array<{ value: string | number; label: string; disabled?: boolean }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, options, className, fieldClassName, required, ...props }, ref) => (
    <Field label={label} error={error} hint={hint} required={required} className={fieldClassName}>
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'input-base appearance-none cursor-pointer pr-9',
            error && 'input-error',
            className
          )}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </div>
      </div>
    </Field>
  )
)
Select.displayName = 'Select'

// ─────────────────────────────────────────────
//  TEXTAREA
// ─────────────────────────────────────────────
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:       string
  error?:       string
  hint?:        string
  fieldClassName?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, fieldClassName, required, ...props }, ref) => (
    <Field label={label} error={error} hint={hint} required={required} className={fieldClassName}>
      <textarea
        ref={ref}
        className={cn(
          'input-base resize-y min-h-[80px] font-sans',
          error && 'input-error',
          className
        )}
        required={required}
        {...props}
      />
    </Field>
  )
)
Textarea.displayName = 'Textarea'

// ─────────────────────────────────────────────
//  BUDGET INPUT — INR-specific convenience wrapper
// ─────────────────────────────────────────────
export interface BudgetInputProps extends Omit<InputProps, 'type' | 'leftAddon' | 'rightAddon'> {
  min?: number
  max?: number
}

export function BudgetInput({ min = 10000, max = 10000000, ...props }: BudgetInputProps) {
  return (
    <Input
      type="number"
      leftAddon="₹"
      rightAddon="INR"
      inputMode="numeric"
      min={min}
      max={max}
      step={1000}
      placeholder="e.g. 500000"
      hint={`Min ₹10,000 · Max ₹1,00,00,000`}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
//  SEARCH INPUT — for stock symbol search
// ─────────────────────────────────────────────
export function SearchInput({ className, ...props }: InputProps) {
  return (
    <Input
      type="search"
      leftAddon={
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="4.5"/>
          <path d="M9.5 9.5l2.5 2.5"/>
        </svg>
      }
      placeholder="Search symbol e.g. TCS, INFY…"
      className={cn('font-sans', className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────
//  RISK SELECTOR — styled button group, not a select
// ─────────────────────────────────────────────
import type { RiskAppetite } from '@/types/stock.types'

const riskOptions: Array<{ value: RiskAppetite; label: string; description: string; color: string; activeColor: string }> = [
  {
    value: 'LOW',
    label: 'Low',
    description: 'Capital preservation',
    color: 'border-gray-200 dark:border-surface-700 text-gray-500 dark:text-surface-400 hover:border-emerald-400/40 hover:text-emerald-600 dark:hover:text-emerald-400',
    activeColor: 'border-emerald-400/50 bg-emerald-400/8 text-emerald-600 dark:text-emerald-400',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Balanced returns',
    color: 'border-gray-200 dark:border-surface-700 text-gray-500 dark:text-surface-400 hover:border-amber-400/40 hover:text-amber-600 dark:hover:text-amber-400',
    activeColor: 'border-amber-400/50 bg-amber-400/8 text-amber-600 dark:text-amber-400',
  },
  {
    value: 'HIGH',
    label: 'High',
    description: 'Aggressive growth',
    color: 'border-gray-200 dark:border-surface-700 text-gray-500 dark:text-surface-400 hover:border-rose-400/40 hover:text-rose-600 dark:hover:text-rose-400',
    activeColor: 'border-rose-400/50 bg-rose-400/8 text-rose-600 dark:text-rose-400',
  },
]

interface RiskSelectorProps {
  value?:    RiskAppetite
  onChange?: (risk: RiskAppetite) => void
  error?:    string
  label?:    string
}

export function RiskSelector({ value, onChange, error, label = 'Risk appetite' }: RiskSelectorProps) {
  return (
    <Field label={label} error={error}>
      <div className="grid grid-cols-3 gap-2">
        {riskOptions.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange?.(opt.value)}
              className={cn(
                'flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border text-left',
                'transition-all duration-150 cursor-pointer',
                isActive ? opt.activeColor : opt.color
              )}
            >
              <span className="text-xs font-semibold font-sans">{opt.label}</span>
              <span className="text-[10px] opacity-70 font-sans leading-tight">{opt.description}</span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}

export { Input, Select, Textarea }
