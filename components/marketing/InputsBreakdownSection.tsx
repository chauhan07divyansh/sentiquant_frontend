'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface MetricItem {
  name: string
  description: string
}

interface CategoryState {
  categoryLabel: string
  categoryColor: string
  metrics: MetricItem[]
}

const CATEGORIES: CategoryState[] = [
  {
    categoryLabel: 'Technicals',
    categoryColor: '#0664e8',
    metrics: [
      { name: 'RSI',             description: 'Measures whether a stock is overbought or oversold based on recent price moves.' },
      { name: 'MACD',            description: 'Tracks the relationship between two moving averages to signal trend shifts.' },
      { name: 'Volatility',      description: "Measures how sharply a stock's price swings over time." },
      { name: 'Momentum',        description: 'Gauges the speed and strength of a recent price move.' },
      { name: 'Regime Analysis', description: 'Identifies whether the market is trending, ranging, or reversing.' },
    ],
  },
  {
    categoryLabel: 'Fundamentals',
    categoryColor: '#5b9eef',
    metrics: [
      { name: 'Revenue',   description: 'Total sales a company generates before any costs are deducted.' },
      { name: 'Profit',    description: "What's left after all expenses are subtracted from revenue." },
      { name: 'P/B',       description: "Compares a stock's market price to its accounting book value." },
      { name: 'P/E',       description: "Compares a stock's price to its earnings per share." },
      { name: 'D/E',       description: 'Measures how much debt a company carries relative to its equity.' },
      { name: 'ROE',       description: 'Shows how efficiently a company turns equity into profit.' },
      { name: 'PEG Ratio', description: 'Adjusts the P/E ratio for expected earnings growth.' },
    ],
  },
  {
    categoryLabel: 'News Sentiment Analysis',
    categoryColor: '#10b981',
    metrics: [
      { name: 'News Sentiment', description: 'Scans recent news coverage and scores it as positive, negative, or neutral in real time.' },
    ],
  },
  {
    categoryLabel: 'MDA Sentiment Analysis',
    categoryColor: '#2a5da8',
    metrics: [
      { name: 'MDA Sentiment', description: "Reads a company's own Management Discussion & Analysis filing and scores its tone." },
    ],
  },
]

const TOTAL_STATES = CATEGORIES.length + 1
const SNAP_LOCK_MS = 1400

export function InputsBreakdownSection() {
  const sectionRef      = useRef<HTMLDivElement>(null)
  const targetState     = useRef(0)
  const isLocked            = useRef(false)
  const hasShownFirstState  = useRef(false)
  const hasAnimatedIn       = useRef(false)

  const [activeState, setActiveState]     = useState(0)
  const [stateProgress, setStateProgress] = useState(0)
  const [isMobile, setIsMobile]           = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedIn.current) {
            hasAnimatedIn.current = true
            isLocked.current = true
            const start = performance.now()
            const tick = () => {
              const elapsed = performance.now() - start
              const t = Math.min(1, elapsed / SNAP_LOCK_MS)
              const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
              setStateProgress(eased)
              if (t < 1) {
                requestAnimationFrame(tick)
              } else {
                isLocked.current = false
              }
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const animateToState = useCallback((newState: number) => {
    isLocked.current = true
    targetState.current = newState
    setActiveState(newState)
    setStateProgress(0)

    const start = performance.now()
    let animationId = 0

    function tick() {
      const elapsed = performance.now() - start
      const t       = Math.min(1, elapsed / SNAP_LOCK_MS)
      const eased   = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
      setStateProgress(eased)
      if (t < 1) {
        animationId = requestAnimationFrame(tick)
      } else {
        isLocked.current = false
      }
    }
    animationId = requestAnimationFrame(tick)

    // Safety valve: force-release if rAF is throttled (e.g. backgrounded tab)
    setTimeout(() => {
      cancelAnimationFrame(animationId)
      isLocked.current = false
    }, SNAP_LOCK_MS * 2)
  }, [])

  useEffect(() => {
    function getSectionCoverage() {
      const section = sectionRef.current
      if (!section) return 0
      const rect          = section.getBoundingClientRect()
      const vh            = window.innerHeight
      const visibleTop    = Math.max(0, rect.top)
      const visibleBottom = Math.min(vh, rect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)
      return visibleHeight / vh
    }

    function handleWheel(e: WheelEvent) {
      const coverage  = getSectionCoverage()
      const isEngaged = coverage >= 0.85
      if (!isEngaged) {
        if (targetState.current === 0) {
          hasShownFirstState.current = false
        }
        return
      }

      const scrollingDown = e.deltaY > 0

      // Release conditions — the only paths that let native scroll through
      if (scrollingDown && targetState.current >= TOTAL_STATES - 1) {
        return
      }
      if (!scrollingDown && targetState.current <= 0 && hasShownFirstState.current) {
        return
      }

      // Section is engaged and not releasing — capture unconditionally
      e.preventDefault()

      if (targetState.current === 0 && scrollingDown && !hasShownFirstState.current) {
        hasShownFirstState.current = true
        return
      }

      if (isLocked.current) return

      isLocked.current = true

      const next = scrollingDown
        ? Math.min(TOTAL_STATES - 1, targetState.current + 1)
        : Math.max(0, targetState.current - 1)

      if (next !== targetState.current) {
        animateToState(next)
      } else {
        isLocked.current = false
      }
    }

    let touchStart  = 0
    let touchActive = false

    function handleTouchStart(e: TouchEvent) {
      touchStart  = e.touches[0].clientY
      touchActive = true
    }

    function handleTouchMove(e: TouchEvent) {
      if (!touchActive) return
      const coverage = getSectionCoverage()
      if (coverage < 0.85) {
        if (targetState.current === 0) {
          hasShownFirstState.current = false
        }
        return
      }

      const currentY  = e.touches[0].clientY
      const deltaY    = touchStart - currentY
      const THRESHOLD = 40
      if (Math.abs(deltaY) < THRESHOLD) return

      const scrollingDown = deltaY > 0

      // Release conditions
      if (scrollingDown && targetState.current >= TOTAL_STATES - 1) {
        return
      }
      if (!scrollingDown && targetState.current <= 0 && hasShownFirstState.current) {
        return
      }

      // Capture unconditionally
      e.preventDefault()

      if (targetState.current === 0 && scrollingDown && !hasShownFirstState.current) {
        hasShownFirstState.current = true
        touchStart = currentY
        return
      }

      if (isLocked.current) return

      isLocked.current = true

      const next = scrollingDown
        ? Math.min(TOTAL_STATES - 1, targetState.current + 1)
        : Math.max(0, targetState.current - 1)

      if (next !== targetState.current) {
        animateToState(next)
        touchStart = currentY
      } else {
        isLocked.current = false
      }
    }

    function handleTouchEnd() {
      touchActive = false
    }

    window.addEventListener('wheel',      handleWheel,      { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true  })
    window.addEventListener('touchmove',  handleTouchMove,  { passive: false })
    window.addEventListener('touchend',   handleTouchEnd,   { passive: true  })

    return () => {
      window.removeEventListener('wheel',      handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove',  handleTouchMove)
      window.removeEventListener('touchend',   handleTouchEnd)
    }
  }, [animateToState])

  const isFinalState = activeState === TOTAL_STATES - 1

  return (
    <section
      ref={sectionRef}
      style={{
        position:       'relative',
        height:         '100dvh',
        background:     '#000000',
        borderBottom:   '1px solid #2e3038',
        overflow:       'hidden',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        maxWidth: '900px',
        width:    '100%',
        padding:  isMobile ? '0 20px' : '0 48px',
        position: 'relative',
      }}>
        {!isFinalState && (
          <CategoryView
            category={CATEGORIES[activeState]}
            progress={stateProgress}
            isMobile={isMobile}
          />
        )}
        {isFinalState && (
          <CombinedView
            progress={stateProgress}
            isMobile={isMobile}
            onCategoryClick={(index: number) => {
              animateToState(index)
            }}
          />
        )}
      </div>

      {/* Progress dots */}
      <div style={{
        position: 'absolute',
        top:      isMobile ? '20px' : '48px',
        right:    isMobile ? '20px' : '48px',
        display:  'flex',
        gap:      '6px',
        zIndex:   10,
      }}>
        {Array.from({ length: TOTAL_STATES }).map((_, i) => (
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

      {activeState === 0 && (
        <div style={{
          position:      'absolute',
          bottom:        isMobile ? '20px' : '32px',
          right:         isMobile ? '20px' : '48px',
          fontFamily:    'var(--font-inter), Inter, sans-serif',
          fontSize:      '11px',
          color:         '#5e616e',
          letterSpacing: '0.05em',
        }}>
          Scroll to explore ↓
        </div>
      )}
    </section>
  )
}

function CategoryView({
  category,
  progress,
  isMobile,
}: {
  category: CategoryState
  progress: number
  isMobile: boolean
}) {
  return (
    <div>
      {/* Pill label */}
      <div style={{
        display:      'inline-flex',
        alignItems:   'center',
        border:       `1px solid ${category.categoryColor}4D`,
        borderRadius: '9999px',
        padding:      '4px 14px',
        marginBottom: '20px',
        opacity:      Math.min(1, progress * 2),
      }}>
        <span style={{
          fontFamily:    'var(--font-inter), Inter, sans-serif',
          fontSize:      '11px',
          fontWeight:    600,
          color:         category.categoryColor,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {category.categoryLabel}
        </span>
      </div>

      <h3 style={{
        fontFamily:   'var(--font-playfair), Playfair Display, serif',
        fontSize:     isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(36px, 5vw, 56px)',
        fontWeight:   400,
        color:        '#ffffff',
        marginBottom: isMobile ? '28px' : '40px',
        opacity:      Math.min(1, progress * 2),
      }}>
        {category.categoryLabel}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {category.metrics.map((metric, i) => {
          const itemDelay    = i / category.metrics.length
          const itemProgress = Math.max(0, Math.min(1, (progress - itemDelay * 0.6) / 0.4))
          return (
            <div
              key={metric.name}
              style={{
                display:       'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems:    isMobile ? 'flex-start' : 'baseline',
                gap:           isMobile ? '4px' : '20px',
                padding:       isMobile ? '12px 0' : '16px 0',
                borderBottom:  i < category.metrics.length - 1 ? '1px solid #1c1d22' : 'none',
                opacity:       itemProgress,
                transform:     `translateX(${(1 - itemProgress) * -16}px)`,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize:   '15px',
                fontWeight: 600,
                color:      '#ffffff',
                minWidth:   isMobile ? 'auto' : '160px',
                flexShrink: 0,
              }}>
                {metric.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize:   '14px',
                color:      '#777a88',
                lineHeight: 1.55,
              }}>
                {metric.description}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CombinedView({
  progress,
  isMobile,
  onCategoryClick,
}: {
  progress: number
  isMobile: boolean
  onCategoryClick: (index: number) => void
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily:    'var(--font-inter), Inter, sans-serif',
        fontSize:      '11px',
        fontWeight:    600,
        color:         '#0664e8',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom:  '8px',
        opacity:       Math.min(1, progress * 2),
      }}>
        All inputs, one score
      </p>
      <h3 style={{
        fontFamily:   'var(--font-playfair), Playfair Display, serif',
        fontSize:     isMobile ? 'clamp(26px, 8vw, 36px)' : 'clamp(36px, 5vw, 56px)',
        fontWeight:   400,
        color:        '#ffffff',
        marginBottom: isMobile ? '32px' : '48px',
        opacity:      Math.min(1, progress * 2),
      }}>
        Everything, together.
      </h3>

      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap:                 '12px',
        maxWidth:            '780px',
        margin:              '0 auto',
      }}>
        {CATEGORIES.map((cat, i) => {
          const itemDelay    = i / CATEGORIES.length
          const itemProgress = Math.max(0, Math.min(1, (progress - itemDelay * 0.5) / 0.5))
          return (
            <button
              key={cat.categoryLabel}
              onClick={() => onCategoryClick(i)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${cat.categoryColor}80`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${cat.categoryColor}33`
              }}
              aria-label={`View ${cat.categoryLabel} details`}
              style={{
                background:   '#0a0a0a',
                border:       `1px solid ${cat.categoryColor}33`,
                borderRadius: '10px',
                padding:      '20px 14px',
                opacity:      itemProgress,
                transform:    `translateY(${(1 - itemProgress) * 16}px)`,
                cursor:       'pointer',
                transition:   'border-color 0.2s ease, transform 0.2s ease',
                textAlign:    'center',
                width:        '100%',
                fontFamily:   'inherit',
              }}
            >
              <div style={{
                width:        '8px',
                height:       '8px',
                borderRadius: '9999px',
                background:   cat.categoryColor,
                margin:       '0 auto 12px',
              }} />
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize:   '12px',
                fontWeight: 600,
                color:      '#ffffff',
              }}>
                {cat.categoryLabel}
              </p>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize:   '11px',
                color:      '#5e616e',
                marginTop:  '4px',
              }}>
                {cat.metrics.length} signal{cat.metrics.length > 1 ? 's' : ''}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
