'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { useInView, useCountUp } from '@/lib/animations'

const VALUES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" /><path d="M10 6v5l3 2" />
      </svg>
    ),
    title: 'Speed over noise',
    body: 'Analysis in under 60 seconds. No dashboards full of lagging indicators — just the signal you need, now.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2l2.5 6H19l-5 3.5 1.9 6L10 14l-5.4 3.5L6.6 11.5 1.5 8H8z" />
      </svg>
    ),
    title: 'Conviction through data',
    body: 'Every score, signal, and target is backed by quantitative analysis — not gut feel or opinion.',
    accent: 'blue',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" />
        <path d="M6.5 10h7M10 6.5v7" />
      </svg>
    ),
    title: 'Radical transparency',
    body: 'We show you the score, the grade, the targets, and the stop — never just a vague "buy" recommendation.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="16" height="12" rx="2" />
        <path d="M6 6V5a4 4 0 018 0v1" />
        <path d="M2 11h16" />
      </svg>
    ),
    title: 'Retail-first, always',
    body: 'Institutional-grade analysis built for individual investors. No Bloomberg terminal required.',
    accent: 'blue',
  },
] as const

const FOUNDERS = [
  {
    initials: 'S',
    name: 'Shreyansh Chauhan',
    role: 'CEO & Co-Founder',
    bio: 'Leading Sentiquant with a vision to democratize AI-powered stock analysis for retail traders across India.',
    gradient: 'from-brand-blue to-brand-cyan',
    glowColor: 'rgba(59,130,246,0.25)',
    linkedin: 'https://www.linkedin.com/in/shreyansh-chauhan-3b547a204/',
    twitter: 'https://x.com/Shreyanshatwork',
    email: 'mailto:founder@sentiquant.org',
  },
  {
    initials: 'K',
    name: 'Keshav Chauhan',
    role: 'COO & Co-Founder',
    bio: 'Managing operations and ensuring seamless delivery of AI-driven insights to our growing community of retail traders.',
    gradient: 'from-indigo-500 to-brand-blue',
    glowColor: 'rgba(99,102,241,0.25)',
    linkedin: 'https://www.linkedin.com/in/keshav-chauhan-43287535b/',
    twitter: 'https://x.com/KeshavChau9275',
    email: 'mailto:founder@sentiquant.org',
  },
  {
    initials: 'D',
    name: 'Divyansh Chauhan',
    role: 'CTO & Co-Founder',
    bio: 'Building the technical infrastructure that powers real-time analysis of 250+ stocks with institutional-grade accuracy.',
    gradient: 'from-brand-cyan to-teal-400',
    glowColor: 'rgba(6,182,212,0.25)',
    linkedin: 'https://www.linkedin.com/in/divyansh-chauhan-742332302/',
    twitter: 'https://x.com/divyanshh_chh',
    email: 'mailto:founder@sentiquant.org',
  },
] as const

const STAGGER = ['', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500']

// ─────────────────────────────────────────────
//  PILL LABEL
// ─────────────────────────────────────────────
function PillLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border:        '1px solid rgba(6,100,232,0.30)',
        color:         '#0664e8',
        borderRadius:  '9999px',
        fontSize:      '11px',
        fontWeight:    500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding:       '4px 14px',
        display:       'inline-flex',
        marginBottom:  '24px',
        fontFamily:    'var(--font-inter)',
      }}
    >
      {children}
    </div>
  )
}

export function AboutClient() {

  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>(0.3)
  const { count: count240, run: run240 } = useCountUp(240, 1600)
  const { count: count60,  run: run60  } = useCountUp(60,  1400)

  useEffect(() => {
    if (statsInView) { run240(); run60() }
  }, [statsInView, run240, run60])

  const { ref: storyRef,    inView: storyInView    } = useInView<HTMLElement>(0.1)
  const { ref: valuesRef,   inView: valuesInView   } = useInView<HTMLElement>(0.05)
  const { ref: foundersRef, inView: foundersInView } = useInView<HTMLElement>(0.05)
  const { ref: ctaRef,      inView: ctaInView      } = useInView<HTMLElement>(0.15)

  return (
    <div style={{ backgroundColor: '#000000' }} className="flex flex-col">

      {/* Hover styles for cards and links */}
      <style>{`
        .about-card:hover  { border-color: #0664e8 !important; }
        .about-social:hover { border-color: #464853 !important; color: #ffffff !important; }
        .about-cta-ghost:hover { border-color: #464853 !important; color: #ffffff !important; }
        .about-cta-primary:hover { background-color: #e2e3e9 !important; border-color: #e2e3e9 !important; }
        @media (max-width: 639px) {
          .about-inner { padding-left: 20px !important; padding-right: 20px !important; }
          .about-hero-inner { padding: 60px 20px 40px !important; }
          .about-stats-grid { grid-template-columns: 1fr !important; }
          .about-stats-cell { border-right: none !important; border-bottom: 1px solid #2e3038; }
          .about-stats-cell:last-child { border-bottom: none !important; }
          .about-cta-primary, .about-cta-ghost { width: 100% !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section>
        <div
          className="about-hero-inner"
          style={{
            maxWidth: '1200px',
            margin:   '0 auto',
            padding:  '100px 48px 80px',
          }}
        >
          <PillLabel>About Sentiquant</PillLabel>

          <h1 style={{ margin: 0 }}>
            <span
              className="block"
              style={{
                fontFamily:    'var(--font-playfair)',
                fontWeight:    400,
                fontSize:      'clamp(40px, 5vw, 72px)',
                color:         '#ffffff',
                lineHeight:    1.05,
                letterSpacing: '-0.025em',
              }}
            >
              Built for India&apos;s
            </span>
            <span
              className="block"
              style={{
                fontFamily:    'var(--font-playfair)',
                fontWeight:    400,
                fontStyle:     'italic',
                fontSize:      'clamp(40px, 5vw, 72px)',
                color:         '#0664e8',
                lineHeight:    1.05,
                letterSpacing: '-0.025em',
              }}
            >
              retail traders.
            </span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   '16px',
              color:      '#777a88',
              lineHeight: 1.65,
              maxWidth:   '560px',
              marginTop:  '24px',
            }}
          >
            We started Sentiquant because great stock analysis was locked behind Bloomberg terminals and expensive services. We&apos;re changing that.
          </p>
        </div>
        <div style={{ borderBottom: '1px solid #2e3038' }} />
      </section>

      {/* ── STATS BAR ── */}
      <section
        style={{
          borderBottom: '1px solid #2e3038',
          backgroundColor: '#08080a',
        }}
      >
        <div
          ref={statsRef}
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}
          className="about-inner about-stats-grid grid grid-cols-3"
        >
          {/* 240+ stocks */}
          <div
            className="about-stats-cell"
            style={{
              padding:        '48px 0',
              textAlign:      'center',
              borderRight:    '1px solid #2e3038',
            }}
          >
            <p
              style={{
                fontFamily:  'var(--font-playfair)',
                fontSize:    '48px',
                fontWeight:  400,
                fontStyle:   'italic',
                color:       '#ffffff',
                lineHeight:  1,
                marginBottom: '8px',
              }}
            >
              {statsInView ? `${count240}+` : '0'}
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#5e616e' }}>
              NSE &amp; BSE stocks
            </p>
          </div>

          {/* < 60s */}
          <div
            className="about-stats-cell"
            style={{
              padding:     '48px 0',
              textAlign:   'center',
              borderRight: '1px solid #2e3038',
            }}
          >
            <p
              style={{
                fontFamily:  'var(--font-playfair)',
                fontSize:    '48px',
                fontWeight:  400,
                fontStyle:   'italic',
                color:       '#ffffff',
                lineHeight:  1,
                marginBottom: '8px',
              }}
            >
              {statsInView ? `< ${count60}s` : '0'}
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#5e616e' }}>
              Per AI analysis
            </p>
          </div>

          {/* 2026 */}
          <div
            style={{
              padding:   '48px 0',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily:  'var(--font-playfair)',
                fontSize:    '48px',
                fontWeight:  400,
                fontStyle:   'italic',
                color:       '#ffffff',
                lineHeight:  1,
                marginBottom: '8px',
              }}
            >
              2026
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#5e616e' }}>
              Year founded
            </p>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section
        ref={storyRef}
        className={cn('scroll-reveal', storyInView && 'in-view')}
        style={{
          borderBottom: '1px solid #2e3038',
          paddingTop:   '80px',
          paddingBottom: '80px',
        }}
      >
        <div className="about-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
          <div className="grid grid-cols-1 md:grid-cols-[40fr_60fr]" style={{ gap: '64px' }}>
            {/* Left */}
            <div>
              <p
                style={{
                  fontFamily:    'var(--font-inter)',
                  fontSize:      '11px',
                  color:         '#5e616e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight:    600,
                  margin:        0,
                }}
              >
                Our mission
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize:   '32px',
                  fontWeight: 400,
                  color:      '#ffffff',
                  lineHeight: 1.25,
                  marginTop:  '12px',
                  marginBottom: 0,
                }}
              >
                Democratising institutional-grade analysis.
              </h2>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '15px',
                  color:      '#777a88',
                  lineHeight: 1.75,
                  margin:     0,
                }}
              >
                Retail traders in India deserve the same quality of analysis that institutional investors have access to. The data exists. The models exist. What was missing was a product that made it fast, clear, and accessible.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '15px',
                  color:      '#777a88',
                  lineHeight: 1.75,
                  margin:     0,
                }}
              >
                Sentiquant uses AI to process technical indicators, fundamental data, and market sentiment simultaneously — then surfaces the signal in plain English, in under 60 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section
        ref={valuesRef}
        style={{
          paddingTop:    '80px',
          paddingBottom: '80px',
          borderBottom:  '1px solid #2e3038',
        }}
      >
        <div className="about-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>

          {/* Header */}
          <div
            className={cn('scroll-reveal', valuesInView && 'in-view')}
            style={{ marginBottom: '48px' }}
          >
            <PillLabel>What we believe</PillLabel>
            <h2
              style={{
                fontFamily:    'var(--font-playfair)',
                fontSize:      '40px',
                fontWeight:    400,
                color:         '#ffffff',
                margin:        0,
                letterSpacing: '-0.02em',
              }}
            >
              Four principles.
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '12px' }}>
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={cn('about-card scroll-reveal', valuesInView && 'in-view', STAGGER[i])}
                style={{
                  backgroundColor: '#0a0a0a',
                  border:          '1px solid #2e3038',
                  borderRadius:    '10px',
                  padding:         '28px',
                  transition:      'border-color 200ms ease',
                  display:         'flex',
                  flexDirection:   'column',
                }}
              >
                <div style={{ color: '#0664e8', marginBottom: '16px' }}>
                  {v.icon}
                </div>
                <h3
                  style={{
                    fontFamily:   'var(--font-inter)',
                    fontSize:     '15px',
                    fontWeight:   500,
                    color:        '#ffffff',
                    margin:       '0 0 8px 0',
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize:   '13px',
                    color:      '#5e616e',
                    lineHeight: 1.65,
                    margin:     0,
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ── */}
      <section
        ref={foundersRef}
        style={{
          paddingTop:    '80px',
          paddingBottom: '80px',
          borderBottom:  '1px solid #2e3038',
        }}
      >
        <div className="about-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>

          {/* Header */}
          <div
            className={cn('scroll-reveal', foundersInView && 'in-view')}
            style={{ marginBottom: '48px' }}
          >
            <PillLabel>The team</PillLabel>
            <h2
              style={{
                fontFamily:    'var(--font-playfair)',
                fontSize:      '40px',
                fontWeight:    400,
                color:         '#ffffff',
                margin:        0,
                letterSpacing: '-0.02em',
              }}
            >
              The people behind Sentiquant.
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>
            {FOUNDERS.map((f, i) => (
              <div
                key={f.role}
                className={cn('about-card scroll-reveal', foundersInView && 'in-view', STAGGER[i])}
                style={{
                  backgroundColor: '#0a0a0a',
                  border:          '1px solid #2e3038',
                  borderRadius:    '10px',
                  padding:         '28px',
                  transition:      'border-color 200ms ease',
                  display:         'flex',
                  flexDirection:   'column',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width:           '52px',
                    height:          '52px',
                    borderRadius:    '9999px',
                    backgroundColor: 'rgba(6,100,232,0.10)',
                    border:          '1px solid rgba(6,100,232,0.25)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 600,
                      fontSize:   '16px',
                      color:      '#0664e8',
                    }}
                  >
                    {f.initials}
                  </span>
                </div>

                {/* Name + role */}
                <p
                  style={{
                    fontFamily:  'var(--font-inter)',
                    fontSize:    '15px',
                    fontWeight:  500,
                    color:       '#ffffff',
                    marginTop:   '16px',
                    marginBottom: 0,
                  }}
                >
                  {f.name}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize:   '12px',
                    color:      '#5e616e',
                    marginTop:  '4px',
                  }}
                >
                  {f.role}
                </p>

                {/* Bio */}
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize:   '13px',
                    color:      '#777a88',
                    lineHeight: 1.65,
                    marginTop:  '12px',
                    flex:       1,
                  }}
                >
                  {f.bio}
                </p>

                {/* Social links */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${f.name} on LinkedIn`}
                    className="about-social"
                    style={{
                      border:         '1px solid #2e3038',
                      borderRadius:   '2px',
                      padding:        '6px 10px',
                      fontFamily:     'var(--font-inter)',
                      fontSize:       '12px',
                      color:          '#777a88',
                      textDecoration: 'none',
                      transition:     'border-color 150ms ease, color 150ms ease',
                    }}
                  >
                    LinkedIn
                  </a>
                  <a
                    href={f.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${f.name} on X`}
                    className="about-social"
                    style={{
                      border:         '1px solid #2e3038',
                      borderRadius:   '2px',
                      padding:        '6px 10px',
                      fontFamily:     'var(--font-inter)',
                      fontSize:       '12px',
                      color:          '#777a88',
                      textDecoration: 'none',
                      transition:     'border-color 150ms ease, color 150ms ease',
                    }}
                  >
                    Twitter
                  </a>
                  <a
                    href={f.email}
                    aria-label={`Email ${f.name}`}
                    className="about-social"
                    style={{
                      border:         '1px solid #2e3038',
                      borderRadius:   '2px',
                      padding:        '6px 10px',
                      fontFamily:     'var(--font-inter)',
                      fontSize:       '12px',
                      color:          '#777a88',
                      textDecoration: 'none',
                      transition:     'border-color 150ms ease, color 150ms ease',
                    }}
                  >
                    Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section
        ref={ctaRef}
        className={cn('scroll-reveal', ctaInView && 'in-view')}
        style={{
          paddingTop:    '80px',
          paddingBottom: '80px',
          backgroundColor: '#08080a',
        }}
      >
        <div
          className="about-inner"
          style={{
            maxWidth:  '640px',
            margin:    '0 auto',
            padding:   '0 48px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily:    'var(--font-playfair)',
              fontSize:      '40px',
              fontWeight:    400,
              color:         '#ffffff',
              margin:        0,
              letterSpacing: '-0.02em',
            }}
          >
            Ready to trade smarter?
          </h2>
          <p
            style={{
              fontFamily:   'var(--font-inter)',
              fontSize:     '15px',
              color:        '#5e616e',
              marginTop:    '12px',
              marginBottom: '32px',
            }}
          >
            Join 750+ traders already using Sentiquant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '12px' }}>
            <Link
              href="/signup"
              className="about-cta-primary"
              style={{
                backgroundColor: '#ffffff',
                color:           '#000000',
                border:          '1px solid #ffffff',
                borderRadius:    '2px',
                padding:         '11px 24px',
                fontFamily:      'var(--font-inter)',
                fontSize:        '14px',
                fontWeight:      600,
                textDecoration:  'none',
                display:         'inline-flex',
                alignItems:      'center',
                justifyContent:  'center',
                transition:      'background-color 150ms ease, border-color 150ms ease',
              }}
            >
              Get started free
            </Link>
            <Link
              href="/pricing"
              className="about-cta-ghost"
              style={{
                backgroundColor: 'transparent',
                color:           '#acafb9',
                border:          '1px solid #2e3038',
                borderRadius:    '2px',
                padding:         '11px 24px',
                fontFamily:      'var(--font-inter)',
                fontSize:        '14px',
                fontWeight:      500,
                textDecoration:  'none',
                display:         'inline-flex',
                alignItems:      'center',
                justifyContent:  'center',
                transition:      'border-color 150ms ease, color 150ms ease',
              }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
