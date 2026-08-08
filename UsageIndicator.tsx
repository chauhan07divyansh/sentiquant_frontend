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
  const [apiError, setApiError] = useState('')

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
    setApiError('')
    setState('loading')
    setApiError('')

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, subject, message }),
      })

      if (res.ok) {
        setState('success')
        return
      }

      const data = await res.json().catch(() => ({}))
      const msg =
        (data as { error?: string }).error === 'service_unavailable'
          ? 'Contact form is temporarily unavailable. Please email us directly at hello@sentiquant.com'
          : ((data as { error?: string }).error ?? 'Failed to send your message. Please try again.')
      setApiError(msg)
      setState('error')
    } catch {
      setApiError('Network error. Please check your connection or email hello@sentiquant.com directly.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'rgba(6,100,232,0.06)',
          border:          '1px solid rgba(6,100,232,0.20)',
          borderRadius:    '10px',
          padding:         '24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   '15px',
            color:      '#ffffff',
            fontWeight: 500,
            margin:     '0 0 8px 0',
          }}
        >
          Message sent.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   '13px',
            color:      '#777a88',
            margin:     '0 0 16px 0',
            lineHeight: 1.6,
          }}
        >
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setName(''); setEmail(''); setSubject(''); setMessage(''); setState('idle') }}
          style={{
            fontFamily:  'var(--font-inter)',
            fontSize:    '13px',
            color:       '#0664e8',
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            padding:     0,
          }}
        >
          Send another message →
        </button>
      </div>
    )
  }

  const fieldClass = (field: string) => cn(
    'cfield w-full',
    errors[field] && 'has-error'
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* Field CSS — handles focus/error/placeholder via pseudo-classes */}
      <style>{`
        .cfield {
          background-color: #121317;
          border: 1px solid #2e3038;
          border-radius: 2px;
          color: #ffffff;
          padding: 10px 14px;
          font-family: var(--font-inter);
          font-size: 14px;
          outline: none;
          transition: border-color 150ms ease;
          width: 100%;
          box-sizing: border-box;
        }
        .cfield::placeholder { color: #464853; }
        .cfield:focus { border-color: #0664e8; }
        .cfield.has-error { border-color: #f43f5e; }
        .cfield.has-error:focus { border-color: #f43f5e; }
        .cfield option { background-color: #121317; color: #ffffff; }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label
            htmlFor="contact-name"
            style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: '#777a88' }}
          >
            Full name
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Arjun Kumar"
            className={fieldClass('name')}
          />
          {errors.name && (
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#f43f5e', margin: 0 }}>
              {errors.name}
            </p>
          )}
        </div>
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label
            htmlFor="contact-email"
            style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: '#777a88' }}
          >
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass('email')}
          />
          {errors.email && (
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#f43f5e', margin: 0 }}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: '6px' }}>
        <label
          htmlFor="contact-subject"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: '#777a88' }}
        >
          Subject
        </label>
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
        {errors.subject && (
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#f43f5e', margin: 0 }}>
            {errors.subject}
          </p>
        )}
      </div>

      <div className="flex flex-col" style={{ gap: '6px' }}>
        <label
          htmlFor="contact-message"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: '#777a88' }}
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Describe your question or feedback in detail…"
          className={cn(fieldClass('message'), 'resize-y')}
          style={{ minHeight: '120px' }}
        />
        <div className="flex items-center justify-between">
          {errors.message
            ? (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#f43f5e', margin: 0 }}>
                {errors.message}
              </p>
            )
            : <span />
          }
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '11px',
              marginLeft: 'auto',
              color:      message.length < 20 ? '#5e616e' : '#0664e8',
            }}
          >
            {message.length} / 20 min
          </span>
        </div>
      </div>

      {state === 'error' && apiError && (
        <div
          className="flex items-start gap-2"
          style={{
            backgroundColor: 'rgba(244,63,94,0.06)',
            border:          '1px solid rgba(244,63,94,0.20)',
            borderRadius:    '2px',
            padding:         '12px 16px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5">
            <circle cx="7" cy="7" r="5.5"/><path d="M7 4.5v3M7 9.5v.5"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#f43f5e', lineHeight: 1.5 }}>
            {apiError}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#ffffff',
          color:           '#000000',
          border:          '1px solid #ffffff',
          borderRadius:    '2px',
          padding:         '11px 24px',
          fontFamily:      'var(--font-inter)',
          fontSize:        '14px',
          fontWeight:      600,
          cursor:          'pointer',
        }}
        onMouseEnter={(e) => { if (state !== 'loading') { e.currentTarget.style.backgroundColor = '#e2e3e9'; e.currentTarget.style.borderColor = '#e2e3e9' } }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#ffffff' }}
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
