'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const NetworkGraphScene = dynamic(
  () => import('./NetworkGraphScene').then(m => m.NetworkGraphScene),
  { ssr: false }
)

const STATS = [
  { value: '250+',  label: 'Stocks Analysed'  },
  { value: '< 30s', label: 'Avg Analysis Time' },
  { value: '750+',  label: 'Traders Signed Up' },
  { value: '24/7',  label: 'Market Monitoring' },
]

export function NetworkGraphSection() {
  // PART 6 — JS mobile detection for responsive stat row
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => { setIsMobile(window.innerWidth < 768) }, [])

  return (
    <section
      style={{
        position:      'relative',
        minHeight:     '100vh',
        background:    '#000000',
        borderBottom:  '1px solid #2e3038',
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
      }}
    >
      {/* Stats row */}
      <div
        style={{
          position:            'relative',
          zIndex:              10,
          display:             isMobile ? 'grid' : 'flex',
          gridTemplateColumns: isMobile ? '1fr 1fr' : undefined,
          rowGap:              isMobile ? '20px' : undefined,
          columnGap:           isMobile ? '8px' : undefined,
          justifyContent:      isMobile ? undefined : 'center',
          paddingTop:          isMobile ? '28px' : '56px',
          maxWidth:            isMobile ? '100%' : '900px',
          margin:              '0 auto',
          width:               '100%',
          paddingLeft:         isMobile ? '16px' : '24px',
          paddingRight:        isMobile ? '16px' : '24px',
          boxSizing:           'border-box',
          overflow:            'hidden',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              minWidth:      0,
              textAlign:     'center',
              padding:       isMobile ? '0 4px' : '0 24px',
              borderRight:   isMobile
                ? (i % 2 === 0 ? '1px solid #2e3038' : 'none')
                : i < STATS.length - 1 ? '1px solid #2e3038' : 'none',
              borderBottom:  isMobile && i < 2 ? '1px solid #2e3038' : 'none',
              paddingBottom: isMobile && i < 2 ? '16px' : '0',
            }}
          >
            <div
              style={{
                fontFamily:    'var(--font-playfair), Playfair Display, Georgia, serif',
                fontSize:      isMobile ? 'clamp(20px, 6vw, 30px)' : 'clamp(28px, 3.5vw, 44px)',
                fontWeight:    500,
                color:         '#f5f5f7',
                lineHeight:    1,
                letterSpacing: '-0.01em',
                whiteSpace:    'nowrap',
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily:    'var(--font-inter), Inter, system-ui, sans-serif',
                fontSize:      '10px',
                fontWeight:    500,
                color:         '#5e616e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop:     '8px',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Network graph canvas */}
      <div
        style={{
          position:  'absolute',
          inset:     0,
          top:       isMobile ? '160px' : '120px',
          zIndex:    1,
        }}
      >
        <NetworkGraphScene />
      </div>

      {/* Bottom label */}
      <div
        style={{
          position:      'absolute',
          bottom:        '40px',
          left:          0,
          right:         0,
          zIndex:        10,
          textAlign:     'center',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily:    'var(--font-inter), Inter, system-ui, sans-serif',
            fontSize:      '11px',
            color:         '#464853',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight:    500,
          }}
        >
          Every stock, connected · Move your cursor to explore
        </p>
      </div>
    </section>
  )
}
