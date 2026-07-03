'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'

interface GuestGateModalProps {
  onClose?: () => void
}

export function GuestGateModal({ onClose }: GuestGateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.[0]?.focus()
    return () => {
      previousFocusRef.current?.focus()
    }
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && onClose) {
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable || focusable.length === 0) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-gate-heading"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#121317',
          border: '1px solid #2e3038',
          borderRadius: '10px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          position: 'relative',
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#5e616e',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5e616e' }}
          >
            ×
          </button>
        )}
        <h2
          id="guest-gate-heading"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '24px',
            fontWeight: 400,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '12px',
          }}
        >
          Sign up to view more stocks
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
            color: '#acafb9',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          You&apos;ve used your free stock view. Create a free account to analyse up to 10 stocks.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/signup"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #ffffff',
              borderRadius: '2px',
              padding: '11px 24px',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create free account
          </Link>
          <Link
            href="/login"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              color: '#acafb9',
              border: '1px solid #2e3038',
              borderRadius: '2px',
              padding: '11px 24px',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
