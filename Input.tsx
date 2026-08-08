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

export function SolarSystemSection() {
  const sectionRef    = useRef<HTMLDivElement>(null)
  const stateProgress = useRef(1)
  const targetState   = useRef(0)

  const [activeState, setActiveState] = useState(0)
  const [mounted, setMounted]         = useState(false)
  // PART 3 — mobile layout detection
  const [isMobile, setIsMobile]       = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  // Scroll-linked (not scroll-jacked): state is derived from the section's
  // natural scroll position within its own tall track. No preventDefault,
  // no wheel/touch interception — the browser scrolls normally.
  useEffect(() => {
    if (!mounted) return

    let ticking = false

    function updateFromScroll() {
      ticking = false
      const section = sectionRef.current
      if (!section) return

      const rect   = section.getBoundingClientRect()
      const vh     = window.innerHeight
      const scrollableHeight = rect.height - vh
      const progress = scrollableHeight > 0
        ? Math.min(1, Math.max(0, (-rect.top) / scrollableHeight))
        : 0

      const continuous = progress * (TOTAL_STATES - 1)
      targetState.current = continuous

      const nearest = Math.round(continuous)
      setActiveState((prev) => (prev === nearest ? prev : nearest))
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(updateFromScroll)
    }

    updateFromScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [mounted])

  const scrollToState = useCallback((newState: number) => {
    const section = sectionRef.current
    if (!section) return
    const rect    = section.getBoundingClientRect()
    const vh      = window.innerHeight
    const scrollableHeight = rect.height - vh
    const sectionTop = window.scrollY + rect.top
    const targetY = sectionTop + (newState / (TOTAL_STATES - 1)) * scrollableHeight
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        // Tall track so scrolling through the section naturally advances
        // the states — the sticky child below is what stays pinned.
        height:       `${TOTAL_STATES * 100}dvh`,
        background:   '#000000',
        borderBottom: '1px solid #2e3038',
      }}
    >
      <div
        style={{
          position:   'sticky',
          top:        0,
          height:     '100dvh',
          overflow:   'hidden',
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
              onClick={() => scrollToState(i)}
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
