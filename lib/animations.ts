// ANIMATION: Scroll-triggered animation utilities for Sentiquant.
// Only import these hooks inside 'use client' components.

import { useCallback, useEffect, useRef, useState } from 'react'

// ── useInView ─────────────────────────────────────────────────────────────────
// Fires once when the referenced element first enters the viewport.
// Unobserves after trigger to avoid unnecessary IntersectionObserver callbacks.
export function useInView<T extends Element = HTMLDivElement>(
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px'
): { ref: React.RefObject<T>; inView: boolean } {
  const ref     = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el) // ANIMATION: stop observing after first trigger — perf
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin]) // inView intentionally omitted — set up once only

  return { ref, inView }
}

// ── useCountUp ────────────────────────────────────────────────────────────────
// Animates a number from 0 → target over `duration` ms.
// Call run() to start; idempotent — only counts up once per mount.
export function useCountUp(
  target: number,
  duration = 1800
): { count: number; run: () => void } {
  const [count, setCount]  = useState(0)
  const hasRun = useRef(false)
  const rafId  = useRef<number | null>(null)

  const run = useCallback(() => {
    if (hasRun.current) return // ANIMATION: guard — runs exactly once
    hasRun.current = true

    const startAt = Date.now()
    const tick    = () => {
      const elapsed  = Date.now() - startAt
      const progress = Math.min(elapsed / duration, 1)
      // ANIMATION: ease-out cubic — fast start, soft landing
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick)
      }
    }
    rafId.current = requestAnimationFrame(tick)
  }, [target, duration])

  // Cleanup RAF on unmount
  useEffect(
    () => () => { if (rafId.current !== null) cancelAnimationFrame(rafId.current) },
    []
  )

  return { count, run }
}
