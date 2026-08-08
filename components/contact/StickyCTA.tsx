'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export function StickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollY / docHeight : 0
      setVisible(progress > 0.28 && progress < 0.88)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'border-t px-5 py-3.5 flex items-center justify-between gap-4',
        // Light mode
        'bg-white/95 border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]',
        // Dark mode
        'dark:bg-surface-900/95 dark:border-white/10 dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]',
        // Backdrop blur for glass effect
        'backdrop-blur-sm',
        // Transition
        'transition-all duration-300 ease-out',
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <p className="text-sm font-medium text-surface-700 dark:text-surface-200">
        Analyze stocks with AI
      </p>
      <Link
        href="/stocks"
        className={cn(
          'shrink-0 text-sm font-semibold px-4 py-2 rounded-lg',
          'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
          'hover:opacity-90 hover:-translate-y-[1px] active:scale-[0.98]',
          'shadow-sm hover:shadow-md transition-all duration-200',
        )}
      >
        Try it free
      </Link>
    </div>
  )
}
