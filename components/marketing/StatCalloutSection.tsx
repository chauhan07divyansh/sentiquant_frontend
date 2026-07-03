'use client'

export function StatCalloutSection() {
  return (
    <section
      className="stat-callout-section"
      style={{
        position:     'relative',
        background:   '#000000',
        borderTop:    '1px solid #2e3038',
        borderBottom: '1px solid #2e3038',
        padding:      '120px 48px',
        textAlign:    'center',
      }}
    >
      <style>{`
        @media (max-width: 639px) {
          .stat-callout-section { padding: 64px 20px !important; }
        }
      `}</style>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            fontFamily:    'var(--font-playfair), Playfair Display, serif',
            fontSize:      'clamp(56px, 8vw, 96px)',
            fontWeight:    400,
            fontStyle:     'italic',
            color:         '#0664e8',
            lineHeight:    1,
            letterSpacing: '-0.02em',
            marginBottom:  '20px',
          }}
        >
          4-in-1
        </div>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize:   'clamp(16px, 2vw, 19px)',
            color:      '#acafb9',
            lineHeight: 1.6,
            maxWidth:   '480px',
            margin:     '0 auto',
          }}
        >
          Fundamental, Technical, Sentiment, and MDA analysis —{' '}
          processed together, not separately. One AI score that{' '}
          actually means something.
        </p>
      </div>
    </section>
  )
}
