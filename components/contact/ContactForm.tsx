'use client'

// FIXED: extracted from app/(marketing)/contact/page.tsx so that page can be
// a server component and its export const metadata is no longer silently ignored

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<FormState>('idle')

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required.'
    if (!email.trim()) e.email = 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email.'
    if (!subject.trim()) e.subject = 'Please provide a subject.'
    if (message.trim().length < 20) e.message = 'Message must be at least 20 characters.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setState('loading')

    // Simulate network delay — replace with real fetch to contact API
    await new Promise((r) => setTimeout(r, 1200))
    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-14 animate-fade-in">
        {/* Icon with glow halo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full bg-brand-cyan/10 blur-xl" />
          <div className="relative w-16 h-16 rounded-full bg-brand-blue/10 border border-brand-cyan/30 flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.15)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-semibold text-surface-900 dark:text-white">
            Message sent successfully
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs mx-auto leading-relaxed">
            We&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <button
          onClick={() => { setName(''); setEmail(''); setSubject(''); setMessage(''); setState('idle') }}
          className="text-xs font-medium text-brand-cyan hover:text-brand-blue px-3 py-1.5 rounded-md hover:bg-brand-blue/5 transition-all duration-200"
        >
          Send another message
        </button>
      </div>
    )
  }

  const fieldClass = (field: string) => cn(
    'w-full rounded-lg px-4 py-3 text-sm font-sans transition-all duration-150 outline-none',

    // LIGHT MODE (important)
    'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400',

    // DARK MODE
    'dark:bg-surface-900/50 dark:border-surface-700/80 dark:text-white dark:placeholder:text-surface-600',

    // FOCUS
    'focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue',

    errors[field]
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
      : ''
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          {/* UX: htmlFor links label to input for screen readers and click-to-focus */}
          <label htmlFor="contact-name" className="text-xs font-medium text-surface-600 dark:text-surface-400">Full name</label>
          <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Arjun Kumar" className={fieldClass('name')} />
          {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-xs font-medium text-surface-600 dark:text-surface-400">Email address</label>
          <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={fieldClass('email')} />
          {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-subject" className="text-xs font-medium text-surface-600 dark:text-surface-400">Subject</label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={cn(fieldClass('subject'), 'appearance-none cursor-pointer')}
        >
          <option value="">Select a topic…</option>
          <option value="general">General inquiry</option>
          <option value="bug">Bug report</option>
          <option value="feature">Feature request</option>
          <option value="data">Data / analysis question</option>
          <option value="partnership">Partnership</option>
          <option value="other">Other</option>
        </select>
        {errors.subject && <p className="text-xs text-rose-400">{errors.subject}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-xs font-medium text-surface-600 dark:text-surface-400">Message</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Describe your question or feedback in detail…"
          className={cn(fieldClass('message'), 'resize-y min-h-[120px]')}
        />
        <div className="flex items-center justify-between">
          {errors.message
            ? <p className="text-xs text-rose-400">{errors.message}</p>
            : <span />
          }
          <span className={cn(
            'text-[10px] ml-auto',
            message.length < 20 ? 'text-surface-600' : 'text-brand-cyan'
          )}>
            {message.length} / 20 min
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={state === 'loading'}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold',

          // gradient
          'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',

          // interaction
          'hover:opacity-90 hover:-translate-y-[1px] active:scale-[0.98]',
          'shadow-sm hover:shadow-md transition-all duration-200',

          'disabled:opacity-60 disabled:cursor-not-allowed'
        )}
      >
        {state === 'loading' ? (
          <>
            <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
            Sending…
          </>
        ) : 'Send message'}
      </button>
    </form>
  )
}
