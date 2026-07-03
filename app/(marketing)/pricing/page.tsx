import Link from 'next/link'
import type { Metadata } from 'next'
import { AIDisclosureNote } from '@/components/common/AIDisclosureNote'

export const metadata: Metadata = {
  title: 'Pricing — Sentiquant | AI Stock Analysis for Indian Markets',
  description:
    'Simple, transparent pricing for AI-powered stock analysis. Start free, upgrade when you\'re ready. No credit card required.',
}

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹0',
    period: '/month',
    tagline: 'Get a feel for AI-powered analysis.',
    cta: 'Get started free',
    ctaHref: '/signup',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      { text: '10 stock analyses per day',      included: true },
      { text: 'Basic swing signals',             included: true },
      { text: 'Watchlist (up to 5 stocks)',      included: true },
      { text: 'AI scoring (0–100 grade)',        included: true },
      { text: 'Advanced AI insights',            included: false },
      { text: 'Portfolio builder',               included: false },
      { text: 'Unlimited analyses',              included: false },
      { text: 'Priority processing',             included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Trader',
    price: '₹499',
    period: '/month',
    tagline: 'For active traders who trade on data, not gut feel.',
    cta: 'Upgrade to Pro',
    ctaHref: '/signup?plan=pro',
    ctaStyle: 'primary',
    popular: true,
    features: [
      { text: 'Unlimited stock analyses',        included: true },
      { text: 'Advanced swing + position signals', included: true },
      { text: 'Unlimited watchlist',             included: true },
      { text: 'AI scoring with detailed thesis', included: true },
      { text: 'Advanced AI insights',            included: true },
      { text: 'Portfolio builder',               included: true },
      { text: 'Priority processing',             included: true },
      { text: 'Strategy comparison tool',        included: true },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₹999',
    period: '/month',
    tagline: 'For serious investors who want every edge.',
    cta: 'Upgrade to Elite',
    ctaHref: '/signup?plan=elite',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      { text: 'Everything in Pro',               included: true },
      { text: 'Early access to new features',    included: true },
      { text: 'Priority data refresh',           included: true },
      { text: 'Advanced sentiment signals',      included: true },
      { text: 'Dedicated support',               included: true },
      { text: 'Export reports (PDF/CSV)',        included: true },
      { text: 'Portfolio risk scoring',          included: true },
      { text: 'API access (coming soon)',        included: true },
    ],
  },
] as const

const FAQS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Starter plan is completely free and requires no payment details. You can upgrade to Pro or Elite at any time from your account settings.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, absolutely. You can cancel from your dashboard at any time with no questions asked. Your plan stays active until the end of the billing period.',
  },
  {
    q: 'What Indian markets are covered?',
    a: 'We cover 250+ stocks across NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) — including large-caps, mid-caps, and popular ETFs.',
  },
  {
    q: 'How accurate are the AI signals?',
    a: 'Our signals combine technical analysis, fundamental scoring, and real-time sentiment — not a single indicator. We show all inputs so you can validate the reasoning yourself. Past signals are not a guarantee of future returns.',
  },
  {
    q: 'What is the difference between swing and position analysis?',
    a: 'Swing analysis targets 1–4 week trades with precise entry, stop-loss, and 3 price targets. Position analysis takes a 6–18 month view with a fundamental thesis and sector context.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Sentiquant provides AI-generated analysis to help you make more informed decisions. It is not SEBI-registered financial advice. Always do your own research before investing.',
  },
] as const

// ─────────────────────────────────────────────
//  CHECK ICON
// ─────────────────────────────────────────────
function CheckIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg
        width="14" height="14" viewBox="0 0 16 16" fill="none"
        style={{ color: '#10b981', flexShrink: 0 }}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 8l3.5 3.5L13 4.5" />
      </svg>
    )
  }
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none"
      style={{ color: '#2e3038', flexShrink: 0 }}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M5 5l6 6M11 5l-6 6" />
    </svg>
  )
}

// ─────────────────────────────────────────────
//  PRICING PAGE
// ─────────────────────────────────────────────
export default function PricingPage() {
  return (
    <div style={{ backgroundColor: '#000000' }} className="flex flex-col overflow-hidden">

      {/* ── SECTION HEADER ── */}
      <section
        style={{
          paddingTop:    '100px',
          paddingBottom: '0',
          borderBottom:  'none',
        }}
      >
        <div
          style={{
            maxWidth: '640px',
            margin:   '0 auto',
            padding:  '0 24px',
            textAlign: 'center',
            display:  'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0',
          }}
        >
          {/* Blue pill */}
          <div
            style={{
              border:        '1px solid rgba(6,100,232,0.30)',
              color:         '#0664e8',
              borderRadius:  '9999px',
              fontSize:      '12px',
              fontWeight:    500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding:       '4px 14px',
              display:       'inline-flex',
              marginBottom:  '24px',
              fontFamily:    'var(--font-inter)',
            }}
          >
            Pricing
          </div>

          {/* Headline */}
          <h1 style={{ margin: 0 }}>
            <span
              className="block"
              style={{
                fontFamily:    'var(--font-playfair)',
                fontWeight:    400,
                fontSize:      'clamp(36px, 4vw, 56px)',
                color:         '#ffffff',
                lineHeight:    1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Simple,
            </span>
            <span
              className="block"
              style={{
                fontFamily:    'var(--font-playfair)',
                fontWeight:    400,
                fontStyle:     'italic',
                fontSize:      'clamp(36px, 4vw, 56px)',
                color:         '#0664e8',
                lineHeight:    1.1,
                letterSpacing: '-0.02em',
              }}
            >
              honest pricing.
            </span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '15px',
              color:      '#777a88',
              marginTop:  '12px',
            }}
          >
            Start free. Upgrade when you need more.
          </p>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section style={{ paddingTop: '56px', paddingBottom: '80px' }}>
        <div
          className="pricing-inner"
          style={{
            maxWidth: '1000px',
            margin:   '0 auto',
            padding:  '0 48px',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px', alignItems: 'stretch' }}>
            {PLANS.map((plan) => {
              const isPro = plan.popular

              return (
                <div
                  key={plan.id}
                  className="flex flex-col"
                  style={{
                    backgroundColor: '#0a0a0a',
                    border:          isPro ? '1px solid #0664e8' : '1px solid #2e3038',
                    borderRadius:    '10px',
                    padding:         '32px',
                    boxShadow:       isPro ? '0 0 0 1px rgba(6,100,232,0.15)' : 'none',
                    transition:      'border-color 200ms ease',
                    position:        'relative',
                  }}
                >
                  {/* Most popular tag — Pro only */}
                  {isPro && (
                    <div
                      style={{
                        border:        '1px solid rgba(6,100,232,0.30)',
                        color:         '#0664e8',
                        borderRadius:  '9999px',
                        fontSize:      '12px',
                        padding:       '3px 10px',
                        display:       'inline-flex',
                        marginBottom:  '12px',
                        alignSelf:     'flex-start',
                        fontFamily:    'var(--font-inter)',
                        fontWeight:    500,
                      }}
                    >
                      Most popular
                    </div>
                  )}

                  {/* Plan name */}
                  <p
                    style={{
                      fontFamily:    'var(--font-inter)',
                      fontSize:      '12px',
                      color:         '#5e616e',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight:    600,
                      margin:        0,
                    }}
                  >
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '16px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize:   '48px',
                        fontWeight: 400,
                        color:      '#ffffff',
                        lineHeight: 1,
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize:   '14px',
                        color:      '#5e616e',
                      }}
                    >
                      {plan.period}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize:   '13px',
                      color:      '#5e616e',
                      marginTop:  '4px',
                    }}
                  >
                    {plan.tagline}
                  </p>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#2e3038', margin: '24px 0' }} />

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {plan.features.map((f) => (
                      <li
                        key={f.text}
                        style={{
                          display:    'flex',
                          alignItems: 'center',
                          gap:        '10px',
                          padding:    '6px 0',
                        }}
                      >
                        <CheckIcon included={f.included} />
                        <span
                          style={{
                            fontFamily: 'var(--font-inter)',
                            fontSize:   '13px',
                            color:      f.included ? '#acafb9' : '#464853',
                          }}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Divider above CTA */}
                  <div style={{ height: '1px', backgroundColor: '#2e3038', margin: '24px 0 0' }} />

                  {/* CTA */}
                  <Link
                    href={plan.ctaHref}
                    className={isPro ? 'pricing-cta-pro' : 'pricing-cta-ghost'}
                    style={{
                      display:        'block',
                      width:          '100%',
                      textAlign:      'center',
                      marginTop:      '20px',
                      padding:        '11px',
                      borderRadius:   '2px',
                      fontFamily:     'var(--font-inter)',
                      fontSize:       '14px',
                      fontWeight:     isPro ? 600 : 500,
                      textDecoration: 'none',
                      transition:     'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                      ...(isPro
                        ? {
                            backgroundColor: '#ffffff',
                            color:           '#000000',
                            border:          '1px solid #ffffff',
                          }
                        : {
                            backgroundColor: 'transparent',
                            color:           '#acafb9',
                            border:          '1px solid #2e3038',
                          }),
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Hover styles + CTA hover styles */}
          <style>{`
            .pricing-cta-pro:hover  { background-color: #e2e3e9 !important; border-color: #e2e3e9 !important; }
            .pricing-cta-ghost:hover { border-color: #464853 !important; color: #ffffff !important; }
            @media (max-width: 639px) {
              .pricing-inner { padding-left: 20px !important; padding-right: 20px !important; }
            }
          `}</style>

          {/* Trust row */}
          <div
            style={{
              marginTop:      '48px',
              display:        'flex',
              justifyContent: 'center',
              alignItems:     'center',
              gap:            '12px',
              flexWrap:       'wrap',
            }}
          >
            {['No contracts', 'Cancel anytime', 'Free plan forever'].map((item, i) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#5e616e' }}>
                  {item}
                </span>
                {i < 2 && (
                  <span style={{ color: '#2e3038', fontSize: '13px' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <section
        style={{
          borderTop:     '1px solid #2e3038',
          borderBottom:  '1px solid #2e3038',
          paddingTop:    '80px',
          paddingBottom: '80px',
          backgroundColor: '#08080a',
        }}
      >
        <div className="pricing-inner" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 48px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p
              style={{
                fontFamily:    'var(--font-inter)',
                fontSize:      '12px',
                color:         '#5e616e',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight:    600,
                marginBottom:  '16px',
              }}
            >
              Compare plans
            </p>
            <h2
              style={{
                fontFamily:    'var(--font-playfair)',
                fontSize:      '36px',
                fontWeight:    400,
                color:         '#ffffff',
                letterSpacing: '-0.02em',
                margin:        0,
              }}
            >
              Everything you get
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e3038' }}>
                  <th
                    style={{
                      textAlign:  'left',
                      padding:    '12px 16px 12px 0',
                      fontFamily: 'var(--font-inter)',
                      fontSize:   '12px',
                      color:      '#5e616e',
                      fontWeight: 500,
                      width:      '40%',
                    }}
                  >
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      style={{
                        padding:    '12px 8px',
                        textAlign:  'center',
                        fontFamily: 'var(--font-inter)',
                        fontSize:   '12px',
                        fontWeight: 600,
                        color:      p.popular ? '#0664e8' : '#777a88',
                      }}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Stock analyses / day',        starter: '10',         pro: 'Unlimited',  elite: 'Unlimited' },
                  { feature: 'Swing trading signals',       starter: 'Basic',      pro: 'Advanced',   elite: 'Advanced+' },
                  { feature: 'Position analysis',           starter: '—',          pro: '✓',          elite: '✓' },
                  { feature: 'AI scoring (0–100)',          starter: '✓',          pro: '✓',          elite: '✓' },
                  { feature: 'Portfolio builder',           starter: '—',          pro: '✓',          elite: '✓' },
                  { feature: 'Watchlist size',              starter: '5 stocks',   pro: 'Unlimited',  elite: 'Unlimited' },
                  { feature: 'Strategy comparison',         starter: '—',          pro: '✓',          elite: '✓' },
                  { feature: 'Priority processing',         starter: '—',          pro: '✓',          elite: '✓' },
                  { feature: 'Sentiment signals',           starter: '—',          pro: 'Standard',   elite: 'Advanced' },
                  { feature: 'Export reports',              starter: '—',          pro: '—',          elite: '✓' },
                  { feature: 'Portfolio risk scoring',      starter: '—',          pro: '—',          elite: '✓' },
                  { feature: 'Dedicated support',           starter: '—',          pro: '—',          elite: '✓' },
                  { feature: 'Early feature access',        starter: '—',          pro: '—',          elite: '✓' },
                ].map(({ feature, starter, pro, elite }) => (
                  <tr key={feature} style={{ borderBottom: '1px solid #1c1d22' }}>
                    <td style={{ padding: '12px 16px 12px 0', fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#acafb9' }}>
                      {feature}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#5e616e' }}>
                      {starter}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#0664e8', fontWeight: 500 }}>
                      {pro}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#777a88' }}>
                      {elite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        style={{
          paddingTop:    '100px',
          paddingBottom: '100px',
          borderBottom:  '1px solid #2e3038',
        }}
      >
        <div className="pricing-inner" style={{ maxWidth: '720px', margin: '0 auto', padding: '0 48px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                border:        '1px solid rgba(6,100,232,0.30)',
                color:         '#0664e8',
                borderRadius:  '9999px',
                fontSize:      '12px',
                fontWeight:    500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding:       '4px 14px',
                display:       'inline-flex',
                marginBottom:  '24px',
                fontFamily:    'var(--font-inter)',
              }}
            >
              FAQ
            </div>
            <h2
              style={{
                fontFamily:    'var(--font-playfair)',
                fontSize:      '40px',
                fontWeight:    400,
                color:         '#ffffff',
                margin:        0,
              }}
            >
              Common questions.
            </h2>
          </div>

          <div>
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group"
                style={{ borderBottom: '1px solid #2e3038' }}
              >
                <summary
                  style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    gap:            '16px',
                    padding:        '20px 0',
                    cursor:         'pointer',
                    listStyle:      'none',
                    userSelect:     'none',
                  }}
                  className="[&::-webkit-details-marker]:hidden"
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize:   '15px',
                      fontWeight: 500,
                      color:      '#e2e3e9',
                    }}
                  >
                    {q}
                  </span>
                  <span
                    style={{
                      color:      '#5e616e',
                      fontSize:   '20px',
                      lineHeight: 1,
                      flexShrink: 0,
                      display:    'inline-block',
                    }}
                    className="group-open:rotate-45 transition-transform duration-200"
                  >
                    +
                  </span>
                </summary>
                <p
                  style={{
                    fontFamily:  'var(--font-inter)',
                    fontSize:    '14px',
                    color:       '#777a88',
                    lineHeight:  1.65,
                    paddingBottom: '20px',
                    margin:      0,
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section
        style={{
          backgroundColor: '#08080a',
          paddingTop:      '100px',
          paddingBottom:   '100px',
        }}
      >
        <div
          style={{
            maxWidth:  '640px',
            margin:    '0 auto',
            padding:   '0 48px',
            textAlign: 'center',
          }}
          className="pricing-inner"
        >
          <h2 style={{ margin: '0 0 12px 0' }}>
            <span
              className="block"
              style={{
                fontFamily:    'var(--font-playfair)',
                fontWeight:    400,
                fontSize:      'clamp(36px, 4vw, 56px)',
                color:         '#ffffff',
                lineHeight:    1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Start analysing stocks
            </span>
            <span
              className="block"
              style={{
                fontFamily:    'var(--font-playfair)',
                fontWeight:    400,
                fontStyle:     'italic',
                fontSize:      'clamp(36px, 4vw, 56px)',
                color:         '#0664e8',
                lineHeight:    1.1,
                letterSpacing: '-0.02em',
              }}
            >
              for free today.
            </span>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '15px',
              color:      '#5e616e',
              marginTop:  '12px',
              marginBottom: '36px',
            }}
          >
            No credit card. No commitment. AI-grade analysis in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '12px' }}>
            <Link
              href="/signup"
              className="pricing-cta-pro inline-flex items-center justify-center"
              style={{
                backgroundColor: '#ffffff',
                color:           '#000000',
                border:          '1px solid #ffffff',
                borderRadius:    '2px',
                fontFamily:      'var(--font-inter)',
                fontSize:        '14px',
                fontWeight:      600,
                padding:         '13px 32px',
                textDecoration:  'none',
                transition:      'background-color 150ms ease, border-color 150ms ease',
              }}
            >
              Start free →
            </Link>
            <Link
              href="/stocks"
              className="pricing-cta-ghost inline-flex items-center justify-center"
              style={{
                backgroundColor: 'transparent',
                color:           '#acafb9',
                border:          '1px solid #2e3038',
                borderRadius:    '2px',
                fontFamily:      'var(--font-inter)',
                fontSize:        '14px',
                fontWeight:      500,
                padding:         '13px 32px',
                textDecoration:  'none',
                transition:      'border-color 150ms ease, color 150ms ease',
              }}
            >
              Analyse a stock
            </Link>
          </div>
          <AIDisclosureNote variant="inline" className="text-xs mt-5" />
        </div>
      </section>

    </div>
  )
}
