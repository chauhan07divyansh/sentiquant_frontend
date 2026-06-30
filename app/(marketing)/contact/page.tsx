import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { FAQAccordion } from '@/components/contact/FAQAccordion'

export const metadata: Metadata = {
  title: 'Contact — Sentiquant',
  description:
    "Have a question, spotted a bug, or want to collaborate? Send us a message and we'll respond within 24 hours.",
}

const INFO_ITEMS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0664e8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/>
        <path d="M1.5 4.5l6.5 4.5 6.5-4.5"/>
      </svg>
    ),
    label: 'Email',
    value: 'founder@sentiquant.org',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0664e8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M8 4v4l2.5 2"/>
      </svg>
    ),
    label: 'Response time',
    value: 'Within 24 hours',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0664e8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z"/>
        <circle cx="8" cy="6" r="1.5"/>
      </svg>
    ),
    label: 'Based in',
    value: 'India',
  },
]

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: '#000000' }}>

      <style>{`
        .contact-info-icon {
          width: 36px; height: 36px;
          background-color: rgba(6,100,232,0.08);
          border: 1px solid rgba(6,100,232,0.18);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .contact-faq-link:hover { color: #ffffff !important; }
        @media (max-width: 639px) {
          .contact-outer { padding: 60px 20px !important; }
        }
      `}</style>

      <div className="contact-outer" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 48px' }}>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr]" style={{ gap: '80px', alignItems: 'start' }}>

          {/* ── LEFT — Contact info ── */}
          <div>
            {/* Pill */}
            <div
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             '6px',
                backgroundColor: 'rgba(6,100,232,0.08)',
                border:          '1px solid rgba(6,100,232,0.20)',
                borderRadius:    '100px',
                padding:         '4px 12px',
                marginBottom:    '20px',
              }}
            >
              <span
                style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#0664e8',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '11px',
                  fontWeight: 500,
                  color:      '#0664e8',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Contact
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily:   'var(--font-playfair)',
                fontSize:     'clamp(36px, 5vw, 52px)',
                fontWeight:   700,
                lineHeight:   1.1,
                color:        '#ffffff',
                margin:       '0 0 16px 0',
              }}
            >
              Get in touch.{' '}
              <span style={{ color: '#0664e8', fontStyle: 'italic' }}>
                We&apos;d love to hear from you.
              </span>
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '16px',
                lineHeight: 1.7,
                color:      '#777a88',
                margin:     '0 0 48px 0',
              }}
            >
              Bug report, feature request, or just curious how Sentiquant works —
              drop us a message and we&apos;ll get back to you.
            </p>

            {/* Info items */}
            <div className="flex flex-col" style={{ gap: '20px', marginBottom: '40px' }}>
              {INFO_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center" style={{ gap: '14px' }}>
                  <div className="contact-info-icon">{item.icon}</div>
                  <div>
                    <p
                      style={{
                        fontFamily:    'var(--font-inter)',
                        fontSize:      '11px',
                        fontWeight:    500,
                        color:         '#5e616e',
                        margin:        '0 0 2px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize:   '14px',
                        fontWeight: 500,
                        color:      '#d1d3dc',
                        margin:     0,
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Data issue note */}
            <div
              style={{
                backgroundColor: 'rgba(251,191,36,0.05)',
                border:          '1px solid rgba(251,191,36,0.16)',
                borderRadius:    '10px',
                padding:         '16px 20px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '12px',
                  fontWeight: 600,
                  color:      '#f59e0b',
                  margin:     '0 0 6px 0',
                }}
              >
                Found a data issue?
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '12px',
                  lineHeight: 1.6,
                  color:      '#9b8a5a',
                  margin:     0,
                }}
              >
                If you spot incorrect stock data or a broken analysis, describe the
                stock symbol and the issue clearly — it helps us fix it fast.
              </p>
            </div>
          </div>

          {/* ── RIGHT — Form ── */}
          <div className="lg:border-l lg:border-[#2e3038] lg:pl-16">
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '12px',
                fontWeight: 500,
                color:      '#5e616e',
                margin:     '0 0 24px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Send a message
            </p>
            <ContactForm />
          </div>

        </div>

        {/* ── FAQ ── */}
        <div
          style={{
            borderTop:  '1px solid #2e3038',
            marginTop:  '100px',
            paddingTop: '80px',
          }}
        >
          <div className="flex items-center" style={{ gap: '20px', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize:   '28px',
                fontWeight: 700,
                color:      '#ffffff',
                margin:     0,
                whiteSpace: 'nowrap',
              }}
            >
              Frequently asked
            </h2>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#2e3038' }} />
          </div>

          <div style={{ maxWidth: '760px' }}>
            <FAQAccordion />
          </div>
        </div>

      </div>
    </div>
  )
}
