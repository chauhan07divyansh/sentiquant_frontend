'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const SolarSystemScene = dynamic(
  () => import('./SolarSystemScene').then((m) => m.SolarSystemScene),
  { ssr: false },
)

const STATE_COPY = [
  {
    label: 'The core',
    title: 'Everything orbits one intelligence.',
    body:  'Sentiquant is the center — a single AI system that reads every signal at once.',
  },
  {
    label: 'Fundamental data',
    title: 'Financial health, in orbit.',
    body:  'Revenue, earnings, balance sheets — continuously pulled into the model.',
  },
  {
    label: 'Technical + Sentiment',
    title: 'Price action and market mood.',
    body:  'Chart patterns and news sentiment, weighed together in real time.',
  },
  {
    label: 'The full system',
    title: 'One score. Four inputs. Zero guesswork.',
    body:  'Fundamental, Technical, Sentiment, and MDA reports — unified into a single AI score.',
  },
]

const TOTAL_STATES = STATE_COPY.length
const SNAP_LOCK_MS = 1500

export function SolarSystemSection() {
  const sectionRef        = useRef<HTMLDivElement>(null)
  const stateProgress     = useRef(0)
  const targetState       = useRef(0)
  const isLocked          = useRef(false)
  const lastCoverageCheck = useRef(0)
  const cachedCoverage    = useRef(0)
  // PART 1 — touch tracking refs
  const touchStartY = useRef(0)
  const touchActive = useRef(false)

  const [activeState, setActiveState] = useState(0)
  const [mounted, setMounted]         = useState(false)
  // PART 3 — mobile layout detection
  const [isMobile, setIsMobile]       = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  // Extracted so both wheel and touch handlers share the same throttled coverage check
  const getSectionCoverage = useCallback(() => {
    const now = performance.now()
    if (now - lastCoverageCheck.current < 50) return cachedCoverage.current
    lastCoverageCheck.current = now

    const section = sectionRef.current
    if (!section) return cachedCoverage.current
    const rect = section.getBoundingClientRect()
    const vh   = window.innerHeight

    const visibleTop    = Math.max(0, rect.top)
    const visibleBottom = Math.min(vh, rect.bottom)
    const visibleHeight = Math.max(0, visibleBottom - visibleTop)
    cachedCoverage.current = visibleHeight / vh
    return cachedCoverage.current
  }, [])

  const animateToState = useCallback((newState: number) => {
    isLocked.current = true
    targetState.current = newState
    setActiveState(newState)

    const start    = performance.now()
    const duration = SNAP_LOCK_MS

    function tick() {
      const elapsed = performance.now() - start
      const t = Math.min(1, elapsed / duration)
      stateProgress.current = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        stateProgress.current = 1
        isLocked.current = false
      }
    }
    requestAnimationFrame(tick)
  }, [])

  // Wheel scroll handler (desktop)
  useEffect(() => {
    if (!mounted) return

    function handleWheel(e: WheelEvent) {
      const coverage  = getSectionCoverage()
      const isEngaged = coverage >= 0.85
      if (!isEngaged) return

      const scrollingDown = e.deltaY > 0

      if (scrollingDown && targetState.current >= TOTAL_STATES - 1) {
        return
      }
      if (!scrollingDown && targetState.current <= 0) return

      e.preventDefault()
      if (isLocked.current) return

      const next = scrollingDown
        ? Math.min(TOTAL_STATES - 1, targetState.current + 1)
        : Math.max(0, targetState.current - 1)

      if (next !== targetState.current) animateToState(next)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [mounted, animateToState, getSectionCoverage])

  // PART 1 — Touch scroll handler (mobile)
  useEffect(() => {
    if (!mounted) return

    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY
      touchActive.current = true
    }

    function handleTouchMove(e: TouchEvent) {
      if (!touchActive.current) return

      const coverage  = getSectionCoverage()
      const isEngaged = coverage >= 0.85
      if (!isEngaged) return

      const currentY  = e.touches[0].clientY
      const deltaY    = touchStartY.current - currentY // positive = swipe up = scroll down

      const THRESHOLD = 40
      if (Math.abs(deltaY) < THRESHOLD) return

      const scrollingDown = deltaY > 0

      if (scrollingDown && targetState.current >= TOTAL_STATES - 1) {
        return
      }
      if (!scrollingDown && targetState.current <= 0) return

      e.preventDefault()
      if (isLocked.current) return

      const next = scrollingDown
        ? Math.min(TOTAL_STATES - 1, targetState.current + 1)
        : Math.max(0, targetState.current - 1)

      if (next !== targetState.current) {
        animateToState(next)
        touchStartY.current = currentY // reset so next swipe needs fresh threshold
      }
    }

    function handleTouchEnd() {
      touchActive.current = false
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [mounted, animateToState, getSectionCoverage])

  return (
    <section
      ref={sectionRef}
      style={{
        position:     'relative',
        height:       '100dvh',
        background:   '#000000',
        borderBottom: '1px solid #2e3038',
        overflow:     'hidden',
      }}
    >
      <div
        style={{
          position:   'absolute',
          inset:      0,
          display:    'flex',
          alignItems: 'center',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(6,100,232,0.04) 0%, #000000 70%)',
        }}
      >
        {/* 3D Canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {mounted && (
            <SolarSystemScene
              targetState={targetState}
              stateProgress={stateProgress}
            />
          )}
        </div>

        {/* Vignette */}
        <div
          style={{
            position:      'absolute',
            inset:         0,
            background:    'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, #000000 90%)',
            pointerEvents: 'none',
            zIndex:        2,
          }}
        />

        {/* Text overlay — PART 3: responsive positioning */}
        <div
          style={{
            position:   'absolute',
            top:        isMobile ? '90px' : '110px',
            left:       isMobile ? '20px' : '48px',
            right:      isMobile ? '20px' : 'auto',
            maxWidth:   isMobile ? '100%' : '420px',
            zIndex:     10,
            transition: 'opacity 0.3s ease',
          }}
        >
          <p
            style={{
              fontFamily:    'var(--font-inter), Inter, sans-serif',
              fontSize:      '11px',
              fontWeight:    600,
              color:         '#0664e8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin:        '0 0 12px 0',
            }}
          >
            {STATE_COPY[activeState].label}
          </p>
          <h3
            style={{
              fontFamily: 'var(--font-playfair), Playfair Display, serif',
              fontSize:   isMobile ? '17px' : 'clamp(22px, 3vw, 32px)',
              fontWeight: 400,
              color:      '#ffffff',
              lineHeight: isMobile ? 1.2 : 1.25,
              margin:     '0 0 12px 0',
            }}
          >
            {STATE_COPY[activeState].title}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize:   isMobile ? '12px' : '14px',
              color:      '#777a88',
              lineHeight: isMobile ? 1.5 : 1.6,
              margin:     0,
            }}
          >
            {STATE_COPY[activeState].body}
          </p>
        </div>

        {/* Progress dots — PART 3: responsive position */}
        <div
          style={{
            position: 'absolute',
            top:      isMobile ? '20px' : '48px',
            right:    isMobile ? '20px' : '48px',
            display:  'flex',
            gap:      '6px',
            zIndex:   10,
          }}
        >
          {STATE_COPY.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (!isLocked.current) animateToState(i) }}
              style={{
                width:      '24px',
                height:     '2px',
                background: i <= activeState ? '#0664e8' : '#2e3038',
                transition: 'background 0.3s ease',
                border:     'none',
                cursor:     'pointer',
                padding:    0,
              }}
              aria-label={`Go to state ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll hint on state 0 */}
        {activeState === 0 && (
          <div
            style={{
              position:      'absolute',
              bottom:        '32px',
              right:         '48px',
              zIndex:        10,
              fontFamily:    'var(--font-inter), Inter, sans-serif',
              fontSize:      '11px',
              color:         '#5e616e',
              letterSpacing: '0.05em',
            }}
          >
            Scroll to explore ↓
          </div>
        )}
      </div>
    </section>
  )
}
