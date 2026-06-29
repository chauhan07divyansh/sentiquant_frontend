// ─────────────────────────────────────────────
//  AUTH LAYOUT
//  Two-column split: brand panel (desktop only) + form panel
// ─────────────────────────────────────────────
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const TRUST_POINTS = [
    '250+ stocks covered',
    'Analysis in under 30 seconds',
    'Free forever on Starter',
  ]

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#000000', display: 'flex' }}>

      {/* ── LEFT BRAND PANEL — desktop only ── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1"
        style={{
          backgroundColor: '#0a0a0a',
          borderRight:     '1px solid #2e3038',
          padding:         '48px',
        }}
      >
        {/* Wordmark */}
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
            fontSize:   '17px',
            color:      '#ffffff',
          }}
        >
          Sentiquant
        </span>

        {/* Quote block */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-playfair)',
              fontStyle:  'italic',
              fontSize:   'clamp(28px, 3vw, 40px)',
              color:      '#ffffff',
              fontWeight: 400,
              lineHeight: 1.25,
              margin:     0,
            }}
          >
            &ldquo;Make smarter stock decisions.&rdquo;
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '14px',
              color:      '#5e616e',
              marginTop:  '16px',
            }}
          >
            AI-powered analysis for NSE and BSE markets.
          </p>
        </div>

        {/* Trust points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TRUST_POINTS.map((point) => (
            <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#0664e8', fontSize: '14px', lineHeight: 1 }}>✓</span>
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '13px',
                  color:      '#777a88',
                }}
              >
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          backgroundColor: '#000000',
          padding:         '48px 24px',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {children}
        </div>
      </div>

    </div>
  )
}
