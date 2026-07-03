import Link from 'next/link'

// ─────────────────────────────────────────────
//  FOOTER COLUMNS
// ─────────────────────────────────────────────
const PRODUCT_LINKS = [
  { label: 'Stocks',    href: '/stocks'    },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Analysis',  href: '/analysis'  },
] as const

const COMPANY_LINKS = [
  { label: 'About',       href: '/about'       },
  { label: 'Blog',        href: '/blogs'        },
  { label: 'Contact',     href: '/contact'     },
  { label: 'Methodology', href: '/methodology' },
] as const

const LEGAL_LINKS = [
  { label: 'Privacy Policy',    href: '/privacy'    },
  { label: 'Terms of Service',  href: '/terms'      },
  { label: 'Disclaimer',        href: '/disclaimer' },
] as const

const COLUMN_LABEL_STYLE: React.CSSProperties = {
  fontFamily:    'var(--font-inter)',
  fontSize:      '11px',
  fontWeight:    600,
  color:         '#5e616e',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom:  '16px',
  display:       'block',
}

const LINK_STYLE: React.CSSProperties = {
  fontFamily:     'var(--font-inter)',
  fontSize:       '13px',
  color:          '#777a88',
  display:        'block',
  padding:        '4px 0',
  textDecoration: 'none',
}

// ─────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────
export function Footer() {
  return (
    <footer
      className="footer-root"
      style={{
        backgroundColor: '#08080a',
        borderTop:       '1px solid #2e3038',
        paddingTop:      '56px',
        paddingBottom:   '32px',
      }}
    >
      <style>{`
        .footer-link:hover { color: #ffffff !important; }
        .footer-link-sm:hover { color: #acafb9 !important; }
        @media (max-width: 639px) {
          .footer-root { padding-top: 40px !important; padding-bottom: 24px !important; }
          .footer-inner { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      <div
        className="footer-inner"
        style={{
          maxWidth: '1200px',
          margin:   '0 auto',
          padding:  '0 48px',
        }}
      >
        {/* ── TOP ROW ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]"
          style={{
            gap:           '40px',
            paddingBottom: '48px',
            borderBottom:  '1px solid #2e3038',
          }}
        >
          {/* Brand column */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '16px',
                fontWeight: 500,
                color:      '#ffffff',
                display:    'block',
              }}
            >
              Sentiquant
            </span>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '13px',
                color:      '#5e616e',
                marginTop:  '8px',
                maxWidth:   '200px',
                lineHeight: 1.6,
              }}
            >
              AI-powered stock analysis for Indian markets.
            </p>
            <p
              className="hidden md:block"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '12px',
                color:      '#464853',
                marginTop:  '20px',
              }}
            >
              © 2025 Sentiquant. All rights reserved.
            </p>
          </div>

          {/* Product column */}
          <div>
            <span style={COLUMN_LABEL_STYLE}>Product</span>
            {PRODUCT_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="footer-link" style={LINK_STYLE}>
                {label}
              </Link>
            ))}
          </div>

          {/* Company column */}
          <div>
            <span style={COLUMN_LABEL_STYLE}>Company</span>
            {COMPANY_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="footer-link" style={LINK_STYLE}>
                {label}
              </Link>
            ))}
          </div>

          {/* Legal column */}
          <div>
            <span style={COLUMN_LABEL_STYLE}>Legal</span>
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="footer-link" style={LINK_STYLE}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            paddingTop:     '24px',
            flexWrap:       'wrap',
            gap:            '12px',
          }}
        >
          {/* Left text */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '12px',
              color:      '#464853',
            }}
          >
            Built for Indian traders. Powered by AI.
          </p>

          {/* Right links */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link
              href="/privacy"
              className="footer-link-sm"
              style={{
                fontFamily:     'var(--font-inter)',
                fontSize:       '12px',
                color:          '#464853',
                textDecoration: 'none',
                transition:     'color 150ms ease',
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="footer-link-sm"
              style={{
                fontFamily:     'var(--font-inter)',
                fontSize:       '12px',
                color:          '#464853',
                textDecoration: 'none',
                transition:     'color 150ms ease',
              }}
            >
              Terms
            </Link>
          </div>

          {/* Mobile copyright — shown only on small screens */}
          <p
            className="md:hidden w-full"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '12px',
              color:      '#464853',
            }}
          >
            © 2025 Sentiquant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
