'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface MetricItem {
  name:        string
  description: string
}

interface Category {
  cardLabel:     string
  categoryLabel: string
  displayLabel:  string
  descriptor:    string
  categoryColor: string
  metrics:       MetricItem[]
}

const CATEGORIES: Category[] = [
  {
    categoryLabel: 'Technicals',
    cardLabel:     'TECHNICAL',
    displayLabel:  'Technical',
    descriptor:    'RSI, MACD, Bollinger Bands & price levels',
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
    cardLabel:     'FUNDAMENTAL',
    displayLabel:  'Fundamental',
    descriptor:    'Revenue, earnings, P/E & balance sheet',
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
    cardLabel:     'NEWS SENTIMENT',
    displayLabel:  'News Sentiment',
    descriptor:    'Real-time article tone & volume scoring',
    categoryColor: '#10b981',
    metrics: [
      { name: 'News Sentiment', description: 'Scans recent news coverage and scores it as positive, negative, or neutral in real time.' },
    ],
  },
  {
    categoryLabel: 'MDA Sentiment Analysis',
    cardLabel:     'MDA SENTIMENT',
    displayLabel:  'MDA Sentiment',
    descriptor:    'Annual report management commentary',
    categoryColor: '#2a5da8',
    metrics: [
      { name: 'MDA Sentiment', description: "Reads a company's own Management Discussion & Analysis filing and scores its tone." },
    ],
  },
]

const CARD_BGS = [
  'linear-gradient(135deg, #0d1117 0%, #091428 100%)',
  'linear-gradient(225deg, #0d1117 0%, #120d1f 100%)',
  'linear-gradient(315deg, #0d1117 0%, #091a12 100%)',
  'linear-gradient(45deg,  #0d1117 0%, #1a1009 100%)',
]

const TECH_PILLS = ['RSI', 'MACD', 'Bollinger', 'Support/Resistance']

export function InputsBreakdownSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [openIndex, setOpenIndex]       = useState<number | null>(null)
  const [closing, setClosing]           = useState(false)
  const closeTimeout                    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mobile carousel state
  const [activeCard, setActiveCard] = useState(0)
  const mobileCardRefs              = useRef<(HTMLButtonElement | null)[]>([])
  const scrollContainerRef          = useRef<HTMLDivElement>(null)

  const closeModal = useCallback(() => {
    setClosing(true)
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    closeTimeout.current = setTimeout(() => {
      setOpenIndex(null)
      setClosing(false)
      document.body.style.overflow = ''
    }, 200)
  }, [])

  function openModal(index: number) {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
      closeTimeout.current = null
    }
    setOpenIndex(index)
    setClosing(false)
    document.body.style.overflow = 'hidden'
  }

  useEffect(() => {
    if (openIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openIndex, closeModal])

  // IntersectionObserver for mobile carousel dot indicator
  useEffect(() => {
    const cards     = mobileCardRefs.current.filter(Boolean) as HTMLButtonElement[]
    const container = scrollContainerRef.current
    if (cards.length === 0 || !container) return

    const ratios = new Array(cards.length).fill(0)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = cards.indexOf(entry.target as HTMLButtonElement)
          if (idx >= 0) ratios[idx] = entry.intersectionRatio
        })
        const maxRatio = Math.max(...ratios)
        if (maxRatio > 0) setActiveCard(ratios.indexOf(maxRatio))
      },
      {
        root:      container,
        threshold: Array.from({ length: 11 }, (_, i) => i / 10),
      }
    )

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section style={{
        background:   '#000000',
        borderBottom: '1px solid #2e3038',
        padding:      'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 80px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <p style={{
            fontFamily:    'var(--font-inter), Inter, sans-serif',
            fontSize:      '12px',
            fontWeight:    600,
            color:         '#0664e8',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom:  '16px',
          }}>
            All inputs, one score
          </p>

          {/* Headline */}
          <h2 style={{
            fontFamily:   'var(--font-playfair), Playfair Display, serif',
            fontSize:     'clamp(48px, 6vw, 80px)',
            fontWeight:   400,
            color:        '#ffffff',
            marginBottom: 'clamp(48px, 6vw, 80px)',
            lineHeight:   1.1,
          }}>
            Everything, together.
          </h2>

          {/* ── MOBILE: horizontal scroll carousel (hidden at md+) ── */}
          <div
            className="md:hidden"
            style={{
              marginLeft:  'calc(-1 * clamp(24px, 5vw, 80px))',
              marginRight: 'calc(-1 * clamp(24px, 5vw, 80px))',
            }}
          >
            <style>{`.ib-scroll::-webkit-scrollbar { display: none }`}</style>
            <div
              ref={scrollContainerRef}
              className="ib-scroll"
              style={{
                display:                 'flex',
                flexDirection:           'row',
                overflowX:               'auto',
                gap:                     '12px',
                padding:                 '0 20px 16px 20px',
                scrollSnapType:          'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth:          'none',
              }}
            >
              {CATEGORIES.map((cat, i) => {
                const cardNum = String(i + 1).padStart(2, '0')
                return (
                  <button
                    key={cat.cardLabel}
                    ref={(el) => { mobileCardRefs.current[i] = el }}
                    onClick={() => openModal(i)}
                    aria-label={`Learn about ${cat.categoryLabel}`}
                    style={{
                      scrollSnapAlign: 'start',
                      flexShrink:      0,
                      width:           '260px',
                      height:          '200px',
                      borderRadius:    '16px',
                      background:      CARD_BGS[i],
                      border:          '1px solid rgba(255,255,255,0.07)',
                      cursor:          'pointer',
                      overflow:        'hidden',
                      position:        'relative',
                      display:         'flex',
                      flexDirection:   'column',
                      alignItems:      'flex-start',
                      padding:         '20px',
                      textAlign:       'left',
                      fontFamily:      'inherit',
                    }}
                  >
                    {/* Decorative number */}
                    <span aria-hidden="true" style={{
                      position:      'absolute',
                      bottom:        '-10px',
                      right:         '12px',
                      fontFamily:    'var(--font-inter), Inter, sans-serif',
                      fontSize:      '80px',
                      fontWeight:    900,
                      color:         'rgba(255,255,255,0.03)',
                      userSelect:    'none',
                      pointerEvents: 'none',
                      lineHeight:    1,
                    }}>
                      {i + 1}
                    </span>

                    {/* Icon + number badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CategoryIcon index={i} />
                      <span style={{
                        fontFamily:   'var(--font-inter), Inter, sans-serif',
                        fontSize:     '11px',
                        fontWeight:   700,
                        color:        '#0664e8',
                        background:   'rgba(6,100,232,0.15)',
                        borderRadius: '9999px',
                        padding:      '2px 8px',
                      }}>
                        {cardNum}
                      </span>
                    </div>

                    {/* Name */}
                    <span style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize:   '16px',
                      fontWeight: 700,
                      color:      '#ffffff',
                      marginTop:  '14px',
                      lineHeight: 1.2,
                      display:    'block',
                    }}>
                      {cat.displayLabel}
                    </span>

                    {/* Descriptor */}
                    <span style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize:   '12px',
                      color:      '#777a88',
                      marginTop:  '4px',
                      lineHeight: 1.4,
                      display:    'block',
                    }}>
                      {cat.descriptor}
                    </span>

                    {/* Learn more */}
                    <span style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize:   '12px',
                      fontWeight: 500,
                      color:      '#0664e8',
                      marginTop:  'auto',
                      paddingTop: '12px',
                      display:    'block',
                    }}>
                      Learn more →
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Dot indicators */}
            <div style={{
              display:        'flex',
              justifyContent: 'center',
              gap:            '6px',
              paddingTop:     '4px',
              paddingBottom:  '4px',
            }}>
              {CATEGORIES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width:        activeCard === i ? '20px' : '6px',
                    height:       '6px',
                    borderRadius: '9999px',
                    background:   activeCard === i ? '#0664e8' : 'rgba(255,255,255,0.2)',
                    transition:   'width 300ms ease, background 300ms ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── DESKTOP: asymmetric bento grid (hidden on mobile) ── */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 w-full">
            {CATEGORIES.map((cat, i) => {
              const isHero  = i === 0
              const isWide  = i === 3
              const hovered = hoveredIndex === i
              const cardNum = String(i + 1).padStart(2, '0')

              const minHClass = isHero
                ? 'md:min-h-[420px]'
                : isWide
                  ? 'md:min-h-[140px]'
                  : 'md:min-h-[200px]'

              return (
                <button
                  key={cat.cardLabel}
                  onClick={() => openModal(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-label={`Learn about ${cat.categoryLabel}`}
                  className={`${minHClass}${isHero ? ' md:row-span-2' : ''}${isWide ? ' md:col-span-2' : ''}`}
                  style={{
                    display:       'flex',
                    flexDirection: isWide ? 'row' : 'column',
                    alignItems:    isWide ? 'center' : 'flex-start',
                    gap:           isWide ? '32px' : undefined,
                    padding:       '32px',
                    borderRadius:  '16px',
                    background:    CARD_BGS[i],
                    border:        `1px solid ${hovered ? 'rgba(6,100,232,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    cursor:        'pointer',
                    overflow:      'hidden',
                    position:      'relative',
                    transition:    'border-color 200ms ease, transform 200ms ease',
                    transform:     hovered ? 'translateY(-2px)' : 'translateY(0)',
                    textAlign:     'left',
                    fontFamily:    'inherit',
                    width:         '100%',
                  }}
                >
                  {/* Hero card glow */}
                  {isHero && (
                    <div aria-hidden="true" style={{
                      position:      'absolute',
                      top:           0,
                      right:         0,
                      width:         '200px',
                      height:        '200px',
                      background:    'radial-gradient(circle, rgba(6,100,232,0.08) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }} />
                  )}

                  {/* Decorative large number */}
                  <span aria-hidden="true" style={{
                    position:      'absolute',
                    bottom:        '-10px',
                    right:         '16px',
                    fontFamily:    'var(--font-inter), Inter, sans-serif',
                    fontSize:      isWide ? '80px' : '120px',
                    fontWeight:    900,
                    color:         'rgba(255,255,255,0.03)',
                    userSelect:    'none',
                    pointerEvents: 'none',
                    lineHeight:    1,
                  }}>
                    {i + 1}
                  </span>

                  {/* Card 4 — horizontal layout */}
                  {isWide ? (
                    <>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <CategoryIcon index={i} />
                          <span style={{
                            fontFamily:   'var(--font-inter), Inter, sans-serif',
                            fontSize:     '11px',
                            fontWeight:   700,
                            color:        '#0664e8',
                            background:   'rgba(6,100,232,0.15)',
                            borderRadius: '9999px',
                            padding:      '2px 8px',
                          }}>
                            {cardNum}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontSize:   '20px',
                          fontWeight: 700,
                          color:      '#ffffff',
                          lineHeight: 1.2,
                        }}>
                          {cat.displayLabel}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontSize:   '13px',
                          color:      '#777a88',
                          lineHeight: 1.5,
                          maxWidth:   '280px',
                        }}>
                          {cat.descriptor}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize:   '14px',
                        fontWeight: 500,
                        color:      '#0664e8',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        Learn more →
                      </span>
                    </>
                  ) : (
                    /* Cards 1–3 — vertical layout */
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CategoryIcon index={i} />
                        <span style={{
                          fontFamily:   'var(--font-inter), Inter, sans-serif',
                          fontSize:     '11px',
                          fontWeight:   700,
                          color:        '#0664e8',
                          background:   'rgba(6,100,232,0.15)',
                          borderRadius: '9999px',
                          padding:      '2px 8px',
                        }}>
                          {cardNum}
                        </span>
                      </div>

                      <span style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize:   isHero ? '28px' : '20px',
                        fontWeight: 700,
                        color:      '#ffffff',
                        marginTop:  '20px',
                        lineHeight: 1.2,
                        display:    'block',
                      }}>
                        {cat.displayLabel}
                      </span>

                      <span style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize:   '13px',
                        color:      '#777a88',
                        marginTop:  '6px',
                        lineHeight: 1.5,
                        display:    'block',
                        maxWidth:   isHero ? undefined : '280px',
                      }}>
                        {cat.descriptor}
                      </span>

                      {isHero && (
                        <div style={{
                          display:   'flex',
                          flexWrap:  'wrap',
                          gap:       '8px',
                          marginTop: '20px',
                        }}>
                          {TECH_PILLS.map(tag => (
                            <span key={tag} style={{
                              fontFamily:   'var(--font-inter), Inter, sans-serif',
                              fontSize:     '11px',
                              display:      'inline-flex',
                              alignItems:   'center',
                              padding:      '4px 10px',
                              borderRadius: '9999px',
                              border:       '1px solid rgba(6,100,232,0.2)',
                              background:   'rgba(6,100,232,0.1)',
                              color:        '#0664e8',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <span style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize:   '12px',
                        fontWeight: 500,
                        color:      '#0664e8',
                        marginTop:  'auto',
                        paddingTop: '16px',
                        display:    'block',
                      }}>
                        Learn more →
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {openIndex !== null && (
        <Modal
          category={CATEGORIES[openIndex]}
          closing={closing}
          onClose={closeModal}
        />
      )}
    </>
  )
}

function CategoryIcon({ index }: { index: number }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#0664e8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {index === 0 && <polyline points="2,14 6,8 10,11 14,4" />}
      {index === 1 && (
        <>
          <rect x="2"   y="9" width="3" height="5" />
          <rect x="6.5" y="6" width="3" height="8" />
          <rect x="11"  y="3" width="3" height="11" />
        </>
      )}
      {index === 2 && (
        <path d="M2 2h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-3 3v-3H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      )}
      {index === 3 && (
        <>
          <rect x="3" y="1" width="10" height="14" rx="1" />
          <line x1="6" y1="5"  x2="10" y2="5"  />
          <line x1="6" y1="8"  x2="10" y2="8"  />
          <line x1="6" y1="11" x2="9"  y2="11" />
        </>
      )}
    </svg>
  )
}

function Modal({
  category,
  closing,
  onClose,
}: {
  category: Category
  closing:  boolean
  onClose:  () => void
}) {
  const [visible, setVisible]             = useState(false)
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const shown = visible && !closing

  return (
    <div
      onClick={onClose}
      style={{
        position:             'fixed',
        inset:                0,
        zIndex:               1000,
        background:           'rgba(0, 0, 0, 0.6)',
        backdropFilter:       shown ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: shown ? 'blur(8px)' : 'blur(0px)',
        opacity:              shown ? 1 : 0,
        transition:           closing
          ? 'opacity 200ms ease, backdrop-filter 200ms ease, -webkit-backdrop-filter 200ms ease'
          : 'opacity 250ms ease, backdrop-filter 250ms ease, -webkit-backdrop-filter 250ms ease',
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'center',
        padding:              '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        'min(620px, 92vw)',
          background:   'linear-gradient(145deg, #0f1117 0%, #0a0c12 100%)',
          border:       '1px solid rgba(6, 100, 232, 0.2)',
          borderRadius: '20px',
          boxShadow:    '0 32px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(6,100,232,0.08)',
          padding:      '48px',
          position:     'relative',
          transform:    shown ? 'scale(1)' : (closing ? 'scale(0.95)' : 'scale(0.92)'),
          opacity:      shown ? 1 : 0,
          transition:   closing
            ? 'transform 200ms ease-in, opacity 200ms ease-in'
            : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
          maxHeight:    '85vh',
          overflowY:    'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          onMouseEnter={(e) => {
            e.currentTarget.style.background  = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background  = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          }}
          style={{
            position:       'absolute',
            top:            '20px',
            right:          '20px',
            width:          '36px',
            height:         '36px',
            borderRadius:   '9999px',
            border:         '1px solid rgba(255,255,255,0.12)',
            background:     'rgba(255,255,255,0.06)',
            color:          '#ffffff',
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '16px',
            lineHeight:     '1',
            padding:        '0',
            transition:     'background 150ms ease, border-color 150ms ease',
          }}
        >
          ×
        </button>

        {/* Accent bar */}
        <div style={{
          width:        '48px',
          height:       '3px',
          background:   '#0664e8',
          borderRadius: '2px',
          marginBottom: '24px',
        }} />

        {/* Eyebrow */}
        <p style={{
          fontFamily:    'var(--font-inter), Inter, sans-serif',
          fontSize:      '11px',
          fontWeight:    700,
          color:         '#0664e8',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom:  '8px',
        }}>
          {category.cardLabel}
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily:   'var(--font-playfair), Playfair Display, serif',
          fontSize:     '36px',
          fontWeight:   400,
          color:        '#ffffff',
          marginBottom: '8px',
          lineHeight:   1.15,
        }}>
          {category.categoryLabel}
        </h2>

        {/* Descriptor summary */}
        <p style={{
          fontFamily:   'var(--font-inter), Inter, sans-serif',
          fontSize:     '15px',
          fontWeight:   400,
          color:        '#777a88',
          marginBottom: '32px',
          lineHeight:   1.5,
        }}>
          {category.descriptor}
        </p>

        {/* Divider */}
        <div style={{
          height:       '1px',
          background:   'rgba(255,255,255,0.06)',
          marginBottom: '24px',
        }} />

        {/* Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {category.metrics.map((metric, i) => (
            <div
              key={metric.name}
              onMouseEnter={() => setHoveredMetric(i)}
              onMouseLeave={() => setHoveredMetric(null)}
              style={{
                display:      'flex',
                gap:          '24px',
                padding:      hoveredMetric === i ? '14px 48px' : '14px 0',
                margin:       hoveredMetric === i ? '0 -48px' : '0',
                borderBottom: i < category.metrics.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
                background:   hoveredMetric === i ? 'rgba(6,100,232,0.04)' : 'transparent',
                transition:   'background 150ms ease',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize:   '14px',
                fontWeight: 600,
                color:      '#ffffff',
                minWidth:   '140px',
                flexShrink: 0,
              }}>
                {metric.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize:   '14px',
                fontWeight: 400,
                color:      '#9194a1',
                lineHeight: 1.55,
              }}>
                {metric.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
