'use client'

import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const SECTION_STYLES = `
  @keyframes ai-sig-pulse {
    0%   { transform: scale(1);   opacity: 0.65; }
    100% { transform: scale(2.6); opacity: 0;    }
  }
  .ai-sig-pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 1px solid rgba(6,100,232,0.4);
    animation: ai-sig-pulse 2.4s ease-out infinite;
    pointer-events: none;
  }
  .ai-sig-pulse-ring-2 {
    animation-delay: 1.2s;
  }
  @media (prefers-reduced-motion: reduce) {
    .ai-sig-pulse-ring { animation: none; opacity: 0; }
    .ai-sig-dot        { display: none !important; }
  }
`

// ─────────────────────────────────────────────
//  ICONS
// ─────────────────────────────────────────────
function FundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="9"  width="3" height="6"  rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="6" y="5"  width="3" height="10" rx="0.5" fill="currentColor" opacity="0.75" />
      <rect x="11" y="2" width="3" height="13" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function TechIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <polyline points="1,12 5,7 9,10 13,3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    </svg>
  )
}

function NewsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="6"  x2="11" y2="6"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="9"  x2="11" y2="9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="12" x2="8"  y2="12" stroke="currentColor" strokeWidth="1"   strokeLinecap="round" />
    </svg>
  )
}

function MdaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2h7l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="5" y1="8.5" x2="11" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="5" y1="11"  x2="9"  y2="11"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const SOURCES = [
  {
    id:       'f',
    label:    'Fundamentals',
    desc:     'Revenue, earnings & balance sheet health',
    Icon:     FundIcon,
    dotDelay: '0s',
  },
  {
    id:       't',
    label:    'Technicals',
    desc:     'RSI, MACD, Bollinger Bands & key levels',
    Icon:     TechIcon,
    dotDelay: '0.6s',
  },
  {
    id:       'n',
    label:    'News Sentiment',
    desc:     'Real-time news volume and tone scoring',
    Icon:     NewsIcon,
    dotDelay: '1.2s',
  },
  {
    id:       'm',
    label:    'MDA Sentiment',
    desc:     'Annual report management commentary',
    Icon:     MdaIcon,
    dotDelay: '1.8s',
  },
] as const

// ─────────────────────────────────────────────
//  SOURCE CARD
// ─────────────────────────────────────────────
function SourceCard({ label, desc, Icon }: { label: string; desc: string; Icon: () => JSX.Element }) {
  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'flex-start',
        gap:             '12px',
        padding:         '14px 16px',
        backgroundColor: '#0a0a0a',
        border:          '1px solid #2e3038',
        borderLeft:      '2px solid #0664e8',
        borderRadius:    '6px',
        width:           '224px',
        boxSizing:       'border-box',
      }}
    >
      <div style={{ color: '#0664e8', flexShrink: 0, marginTop: '2px' }}>
        <Icon />
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-inter)',
          fontSize:   '13px',
          fontWeight: 600,
          color:      '#e2e3e9',
          margin:     0,
          lineHeight: 1.3,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'var(--font-inter)',
          fontSize:   '11px',
          color:      '#5e616e',
          margin:     '3px 0 0',
          lineHeight: 1.4,
        }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  AI SCORE NODE
// ─────────────────────────────────────────────
function AIScoreNode() {
  return (
    <div style={{ position: 'relative', width: '178px', height: '178px', flexShrink: 0 }}>
      {/* Pulsing rings — hidden when prefers-reduced-motion */}
      <div className="ai-sig-pulse-ring" />
      <div className="ai-sig-pulse-ring ai-sig-pulse-ring-2" />
      {/* Core */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    '9999px',
          backgroundColor: '#040c1c',
          border:          '1px solid rgba(6,100,232,0.4)',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          boxShadow:       '0 0 48px rgba(6,100,232,0.22), inset 0 0 24px rgba(6,100,232,0.06)',
        }}
      >
        <span style={{
          fontFamily:    'var(--font-inter)',
          fontSize:      '11px',
          fontWeight:    600,
          color:         'rgba(255,255,255,0.5)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom:  '6px',
        }}>
          SCORE
        </span>
        <span style={{
          fontFamily: 'var(--font-inter)',
          fontSize:   '28px',
          fontWeight: 700,
          color:      '#ffffff',
          lineHeight: 1,
        }}>
          /100
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  DESKTOP DIAGRAM
// ─────────────────────────────────────────────
function DesktopDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const aiRef        = useRef<HTMLDivElement>(null)
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  const [paths, setPaths] = useState<string[]>([])

  useEffect(() => {
    function measure() {
      const cEl = containerRef.current
      const aEl = aiRef.current
      if (!cEl || !aEl) return

      const cr  = cEl.getBoundingClientRect()
      const ar  = aEl.getBoundingClientRect()
      const aiCy = ar.top  - cr.top  + ar.height / 2
      const aiLx = ar.left - cr.left  // left edge of AI node

      const next = cardRefs.current.map(el => {
        if (!el) return ''
        const r  = el.getBoundingClientRect()
        const sx = r.right - cr.left          // right edge of card
        const sy = r.top   - cr.top + r.height / 2  // vertical midpoint
        const mx = (sx + aiLx) / 2
        return `M ${sx} ${sy} C ${mx} ${sy} ${mx} ${aiCy} ${aiLx} ${aiCy}`
      })

      setPaths(next)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position:       'relative',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginTop:      '72px',
      }}
    >
      {/* Source cards column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
        {SOURCES.map((src, i) => (
          <div key={src.id} ref={el => { cardRefs.current[i] = el }}>
            <SourceCard label={src.label} desc={src.desc} Icon={src.Icon} />
          </div>
        ))}
      </div>

      {/* AI Score — right side, vertically centered by flexbox */}
      <div ref={aiRef}>
        <AIScoreNode />
      </div>

      {/* SVG overlay — paths + traveling dots */}
      <svg
        style={{
          position:     'absolute',
          inset:        0,
          width:        '100%',
          height:       '100%',
          pointerEvents:'none',
          overflow:     'visible',
        }}
        aria-hidden="true"
      >
        {paths.map((d, i) => {
          if (!d) return null
          const src = SOURCES[i]
          return (
            <g key={src.id}>
              {/* Dashed guide line */}
              <path
                id={`sig-path-${src.id}`}
                d={d}
                fill="none"
                stroke="#0664e8"
                strokeWidth="1"
                strokeOpacity="0.28"
                strokeDasharray="5 5"
              />
              {/* Traveling dot */}
              <circle r="3.5" fill="#0664e8" fillOpacity="0.9" className="ai-sig-dot">
                <animateMotion
                  dur="2.4s"
                  begin={src.dotDelay}
                  repeatCount="indefinite"
                >
                  <mpath href={`#sig-path-${src.id}`} />
                </animateMotion>
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MOBILE DIAGRAM
// ─────────────────────────────────────────────
function MobileDiagram() {
  return (
    <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* 2 × 2 grid of source mini-cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
        {SOURCES.map(src => (
          <div
            key={src.id}
            style={{
              display:         'flex',
              flexDirection:   'column',
              gap:             '6px',
              padding:         '12px',
              backgroundColor: '#0a0a0a',
              border:          '1px solid #2e3038',
              borderTop:       '2px solid #0664e8',
              borderRadius:    '6px',
            }}
          >
            <div style={{ color: '#0664e8' }}><src.Icon /></div>
            <p style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '12px',
              fontWeight: 600,
              color:      '#e2e3e9',
              margin:     0,
              lineHeight: 1.3,
            }}>
              {src.label}
            </p>
          </div>
        ))}
      </div>

      {/* Convergence arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <div style={{ width: '1px', height: '8px',  backgroundColor: 'rgba(6,100,232,0.3)' }} />
        <div style={{ width: '1px', height: '8px',  backgroundColor: 'rgba(6,100,232,0.5)' }} />
        <div style={{ width: '1px', height: '8px',  backgroundColor: 'rgba(6,100,232,0.7)' }} />
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
          <path d="M1 1L6 6L11 1" stroke="#0664e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* AI Score */}
      <AIScoreNode />
    </div>
  )
}

// ─────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader() {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily:    'var(--font-inter)',
        fontSize:      '11px',
        fontWeight:    600,
        color:         '#0664e8',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        margin:        '0 0 16px',
      }}>
        HOW IT WORKS
      </p>
      <h2 style={{ margin: 0 }}>
        <span
          className="block"
          style={{
            fontFamily:    'var(--font-playfair)',
            fontSize:      'clamp(40px, 5vw, 72px)',
            fontWeight:    400,
            color:         '#ffffff',
            lineHeight:    1.05,
            letterSpacing: '-0.02em',
          }}
        >
          Four signals.
        </span>
        <span
          className="block"
          style={{
            fontFamily:    'var(--font-playfair)',
            fontSize:      'clamp(40px, 5vw, 72px)',
            fontWeight:    400,
            fontStyle:     'italic',
            color:         '#0664e8',
            lineHeight:    1.05,
            letterSpacing: '-0.02em',
          }}
        >
          One score.
        </span>
      </h2>
      <p style={{
        fontFamily: 'var(--font-inter)',
        fontSize:   '15px',
        color:      '#777a88',
        maxWidth:   '440px',
        margin:     '16px auto 0',
        lineHeight: 1.6,
      }}>
        Every analysis combines four independent data streams, weighted and scored by AI.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
//  EXPORT
// ─────────────────────────────────────────────
export function AISignalFlowSection() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth < 768)
  }, [])

  return (
    <section
      style={{
        backgroundColor: '#000000',
        paddingTop:      '100px',
        paddingBottom:   '100px',
        borderBottom:    '1px solid #2e3038',
        overflow:        'hidden',
      }}
    >
      <style>{SECTION_STYLES}</style>
      <div
        className="sec-inner"
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}
      >
        <SectionHeader />
        {mounted && (isMobile ? <MobileDiagram /> : <DesktopDiagram />)}
      </div>
    </section>
  )
}
