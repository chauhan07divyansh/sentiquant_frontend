'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'
import { useMagneticHover } from '@/lib/useMagneticHover'
import { NetworkGraphSection } from '@/components/marketing/NetworkGraphSection'
import { PortfolioTrackerSection } from '@/components/marketing/PortfolioTrackerSection'
import { InputsBreakdownSection } from '@/components/marketing/InputsBreakdownSection'
import { SolarSystemSection } from '@/components/marketing/SolarSystemSection'
import { StatCalloutSection } from '@/components/marketing/StatCalloutSection'

import { use3DTilt } from '@/lib/use3DTilt'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { GuestGateModal } from '@/components/auth/GuestGateModal'

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const STAGGER = ['', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500'] as const

const FAQ_ITEMS = [
  {
    q: 'Is Sentiquant free to use?',
    a: 'Yes. The Starter plan is free forever — you get up to 10 stock analyses per month, no credit card required. Pro and Max plans unlock unlimited analyses and portfolio generation.',
  },
  {
    q: 'Which stocks does Sentiquant cover?',
    a: "We currently cover 250+ NSE and BSE listed stocks, including all Nifty 50 constituents, Nifty Next 50, and popular mid-cap names. We're expanding coverage regularly.",
  },
  {
    q: 'How accurate are the AI signals?',
    a: 'Our signals are based on quantitative technical and fundamental analysis — the same inputs professional traders use. They are not financial advice and past signal quality does not guarantee future results. Always apply your own judgement.',
  },
  {
    q: 'How long does an analysis take?',
    a: 'Under 30 seconds for a full stock analysis. Portfolio generation typically takes under 2 minutes.',
  },
  {
    q: 'Do I need to know finance to use Sentiquant?',
    a: 'No. Every analysis comes with a plain-English summary. We explain what each signal means so you can make informed decisions — no finance degree required.',
  },
]

// ─────────────────────────────────────────────
//  GOOGLE SIGN IN BUTTON
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GoogleSignInButton() {
  return (
    <button
      onClick={() => { track.guestSignupClicked('hero_cta', 'google'); signIn('google', { callbackUrl: '/dashboard' }) }}
      className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl border border-surface-700 bg-surface-900/80 text-white text-sm font-medium hover:bg-surface-800 hover:border-surface-600 transition-all duration-200 w-full sm:w-auto"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  )
}

// ─────────────────────────────────────────────
//  FLOATING MOCKUP
// ─────────────────────────────────────────────
function FloatingMockup() {
  const chartBars = [38, 52, 44, 61, 70, 64, 78, 85]
  const tilt = use3DTilt({ maxTilt: 10, perspective: 1000, scale: 1.02 })
  return (
    <div ref={tilt.ref} style={tilt.style} className="relative w-[285px] lg:w-[330px] xl:w-[355px] select-none card-3d glow-3d shadow-3d" aria-hidden="true">
      <div className="absolute -bottom-8 -right-8 w-[240px] card rounded-xl p-4 rotate-[-5deg] opacity-50 blur-[1.5px] pointer-events-none">
        <p className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-3">Portfolio</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">Total Value</span>
            <span className="text-xs font-mono font-semibold text-white">₹2,40,000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">Day P&amp;L</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">+₹3,840</span>
          </div>
          <div className="h-px bg-surface-700/60 my-0.5" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">AI Grade</span>
            <span className="text-xs font-semibold text-brand-cyan">A</span>
          </div>
        </div>
      </div>
      <div className="relative card rounded-xl overflow-hidden p-5 flex flex-col gap-4 hero-entry-mockup animate-float" style={{ boxShadow: '0 48px 120px -12px rgba(0,0,0,0.9), 0 16px 48px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07), 0 0 80px 20px rgba(6,100,232,0.25)' }}>
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-cyan" />
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display font-bold text-lg text-white leading-none">TCS</span>
              <span className="text-[10px] text-surface-500 bg-surface-800/60 px-1.5 py-0.5 rounded font-medium">NSE</span>
            </div>
            <p className="text-[11px] text-surface-500">Tata Consultancy Services</p>
          </div>
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <span className="font-mono font-bold text-[17px] text-emerald-400 leading-none tabular-nums">85</span>
            <span className="text-[8px] text-emerald-400/70 uppercase tracking-wide mt-0.5">score</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-mono font-bold text-[26px] text-white leading-none tabular-nums">₹3,842</span>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">▲ +2.4%</span>
        </div>
        <div className="h-14 flex items-end gap-[3px] px-1">
          {chartBars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-brand-blue/60 to-brand-cyan/80" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-surface-800/50">
          <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-blue to-emerald-400" style={{ width: '85%' }} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Entry Zone', val: '₹3,780', cls: 'text-brand-cyan'  },
            { label: 'Support',    val: '₹3,650', cls: 'text-rose-400'    },
            { label: 'R1',         val: '₹3,940', cls: 'text-emerald-400' },
          ].map((t) => (
            <div key={t.label} className="flex flex-col gap-0.5 rounded-lg px-2 py-2 bg-surface-800/40 border border-surface-700/30">
              <span className="text-[8px] text-surface-500 uppercase tracking-wider font-medium">{t.label}</span>
              <span className={cn('font-mono text-[11px] font-bold', t.cls)}>{t.val}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-surface-800/50">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            Bullish Setup
          </span>
          <span className="text-[9px] text-surface-600 font-medium">AI · &lt;60s</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  TICKER STRIP
// ─────────────────────────────────────────────
interface TickerStock {
  symbol: string
  name: string
  slug: string
}

const FALLBACK_STOCKS: TickerStock[] = [
  { symbol: 'RELIANCE',   name: 'Reliance Industries', slug: 'RELIANCE'   },
  { symbol: 'TCS',        name: 'Tata Consultancy',    slug: 'TCS'        },
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',           slug: 'HDFCBANK'   },
  { symbol: 'INFY',       name: 'Infosys',             slug: 'INFY'       },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',          slug: 'ICICIBANK'  },
  { symbol: 'ITC',        name: 'ITC',                 slug: 'ITC'        },
  { symbol: 'SBIN',       name: 'State Bank of India', slug: 'SBIN'       },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',       slug: 'BHARTIARTL' },
  { symbol: 'LT',         name: 'Larsen & Toubro',     slug: 'LT'         },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',        slug: 'ASIANPAINT' },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',       slug: 'MARUTI'     },
  { symbol: 'WIPRO',      name: 'Wipro',               slug: 'WIPRO'      },
  { symbol: 'AXISBANK',   name: 'Axis Bank',           slug: 'AXISBANK'   },
  { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank', slug: 'KOTAKBANK'  },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',  slug: 'HINDUNILVR' },
]

function TickerStrip() {
  const { status } = useSession()
  const router = useRouter()
  const [stocks, setStocks] = useState<TickerStock[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/proxy/stocks/list')
      .then((r) => {
        if (!r.ok) {
          console.warn('[TickerStrip] Stock list fetch failed (%s), using fallback', r.status)
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (data === null) return
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('[TickerStrip] Stock list returned non-array or empty, using fallback')
          return
        }
        setStocks(
          data
            .map((s: { symbol?: string; name?: string; slug?: string }) => ({
              symbol: s.symbol ?? '',
              name: s.name ?? '',
              slug:
                typeof s.slug === 'string' && s.slug
                  ? s.slug
                  : (s.name ?? '').toLowerCase().replace(/\s+/g, '-'),
            }))
            .filter((s: TickerStock) => s.name),
        )
      })
      .catch((err) => console.warn('[TickerStrip] Stock list fetch threw, using fallback:', err))
  }, [])

  const displayStocks = stocks.length > 0 ? stocks : FALLBACK_STOCKS

  const handleClick = (slug: string) => {
    if (status === 'authenticated') {
      router.push(`/stocks/${slug}`)
      return
    }
    const raw = typeof window !== 'undefined' ? localStorage.getItem('sq_guest_views') : null
    const count = raw ? parseInt(raw, 10) : 0
    if (count === 0) {
      router.push(`/stocks/${slug}`)
    } else {
      setShowModal(true)
    }
  }

  const doubled = [...displayStocks, ...displayStocks]

  return (
    <>
      {/* Gate modal — shown to guests who have used their one free view */}
      {showModal && <GuestGateModal onClose={() => setShowModal(false)} />}

      {/* Scrolling strip */}
      <div
        style={{
          backgroundColor: '#08080a',
          borderTop: '1px solid #2e3038',
          borderBottom: '1px solid #2e3038',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <style>{`
          @keyframes ticker-x-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-x-track {
            display: flex;
            width: max-content;
            animation: ticker-x-scroll 40s linear infinite;
          }
          .ticker-x-track:hover { animation-play-state: paused; }
          @media (prefers-reduced-motion: reduce) {
            .ticker-x-track { animation: none; }
          }
          .ticker-item {
            display: inline-flex;
            align-items: center;
            padding: 12px 28px;
            cursor: pointer;
            border-right: 1px solid #2e3038;
            border-top: none;
            border-bottom: none;
            border-left: none;
            background: transparent;
            transition: background 150ms ease;
          }
          .ticker-item:hover { background: rgba(6,100,232,0.06); }
          .ticker-item-name {
            font-family: var(--font-inter);
            font-weight: 500;
            font-size: 13px;
            color: #acafb9;
            white-space: nowrap;
            transition: color 150ms ease;
          }
          .ticker-item:hover .ticker-item-name { color: #ffffff; }
        `}</style>
        <div className="ticker-x-track">
          {doubled.map((stock, i) => (
            <button
              key={i}
              type="button"
              className="ticker-item"
              onClick={() => handleClick(stock.slug)}
            >
              <span className="ticker-item-name">{stock.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
//  VIDEO SECTION
// ─────────────────────────────────────────────
function VideoSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1)

  return (
    <section
      style={{
        backgroundColor: '#000000',
        paddingTop: '100px',
        paddingBottom: '100px',
        borderBottom: '1px solid #2e3038',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
        className="sec-inner"
      >
        {/* Headline */}
        <h2 style={{ margin: 0 }}>
          <span
            className="block"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 400,
              fontSize: 'clamp(36px, 4vw, 56px)',
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            AI analysis in under
          </span>
          <span
            className="block"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(36px, 4vw, 56px)',
              color: '#0664e8',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            60 seconds.
          </span>
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '15px',
            color: '#777a88',
            maxWidth: '480px',
            margin: '16px auto 0',
            lineHeight: 1.6,
          }}
        >
          Watch how Sentiquant analyses a real NSE stock — from search to signal in one click.
        </p>

        {/* Video frame with browser chrome */}
        <div
          ref={ref}
          className={cn('scroll-reveal', inView && 'in-view')}
          style={{
            maxWidth: '900px',
            width: '100%',
            margin: '48px auto 0',
            backgroundColor: '#08080a',
            border: '1px solid #2e3038',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Chrome bar */}
          <div
            style={{
              height: '36px',
              backgroundColor: '#121317',
              borderBottom: '1px solid #2e3038',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#2e3038', flexShrink: 0 }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#2e3038', flexShrink: 0 }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#2e3038', flexShrink: 0 }} />
            <div
              style={{
                backgroundColor: '#1c1d22',
                border: '1px solid #2e3038',
                borderRadius: '2px',
                padding: '3px 10px',
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                color: '#5e616e',
                width: '220px',
                marginLeft: '8px',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              sentiquant.org/stocks/RELIANCE
            </div>
          </div>

          {/* Video element — placeholder shows underneath until video loads */}
          <div style={{ position: 'relative', backgroundColor: '#0a0a0a', minHeight: '500px' }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#464853' }}>
                Drop your screen recording as /public/demo.mp4
              </span>
            </div>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              src="/demo.mp4"
              poster="/demo-poster.jpg"
              style={{ width: '100%', display: 'block', position: 'relative', zIndex: 1 }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
//  FEATURE CARDS SECTION
// ─────────────────────────────────────────────
function BentoSection() {
  const { ref: refA, inView: inViewA } = useInView<HTMLDivElement>(0.1)
  const { ref: refB, inView: inViewB } = useInView<HTMLDivElement>(0.1)
  const { ref: refC, inView: inViewC } = useInView<HTMLDivElement>(0.1)

  const BENTO_CARD: React.CSSProperties = {
    backgroundColor: '#0a0a0a',
    border:          '1px solid #2e3038',
    borderRadius:    '10px',
    overflow:        'hidden',
    minHeight:       '400px',
    transition:      'border-color 200ms ease',
  }

  return (
    <section
      style={{
        backgroundColor: '#000000',
        paddingTop:      '100px',
        paddingBottom:   '100px',
        borderBottom:    '1px solid #2e3038',
      }}
    >
      <style>{`
        .bcard:hover { border-color: #0664e8 !important; }
      `}</style>
      <div className="sec-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ margin: 0 }}>
            <span
              className="block"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(36px, 4vw, 56px)', color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              Three tools.
            </span>
            <span
              className="block"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(36px, 4vw, 56px)', color: '#0664e8', lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              One platform.
            </span>
          </h2>
        </div>

        {/* Bento grid — 2 col desktop, 1 col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '12px' }}>

          {/* ── CARD A — AI Stock Analysis ── */}
          <div
            ref={refA}
            className={cn('bcard scroll-reveal', inViewA && 'in-view', STAGGER[0])}
            style={BENTO_CARD}
          >
            <div style={{ padding: '28px 28px 0' }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#5e616e', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                AI Stock Analysis
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize:   '24px',
                  fontWeight: 400,
                  color:      '#ffffff',
                  marginTop:  '10px',
                  marginBottom: 0,
                  lineHeight: 1.3,
                }}
              >
                Instant signals for any NSE stock.
              </h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#777a88', marginTop: '8px', lineHeight: 1.6 }}>
                Entry zone, support, resistance levels, and an AI score — in under 30 seconds.
              </p>
            </div>
            {/* Stock analysis UI preview */}
            <div
              aria-hidden="true"
              style={{
                marginTop:       '24px',
                width:           '100%',
                backgroundColor: '#0d0d10',
                borderTop:       '1px solid #2e3038',
                overflow:        'hidden',
              }}
            >
              {/* Stock header */}
              <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #1c1d22' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>RELIANCE</span>
                      <span style={{ fontSize: '10px', color: '#777a88', backgroundColor: '#1c1d22', padding: '2px 6px', borderRadius: '2px', fontFamily: 'var(--font-inter)' }}>NSE</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#777a88', margin: 0, fontFamily: 'var(--font-inter)' }}>Reliance Industries Ltd</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', fontWeight: 700, color: '#10b981', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>87</span>
                    <span style={{ fontSize: '7px', color: 'rgba(16,185,129,0.7)', letterSpacing: '0.06em', marginTop: '2px', fontFamily: 'var(--font-inter)', textTransform: 'uppercase' }}>score</span>
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '22px', fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>₹2,943</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '9999px', fontFamily: 'var(--font-inter)', marginBottom: '2px' }}>▲ +1.4%</span>
                </div>
                {/* Sparkline */}
                <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '2px', marginTop: '12px' }}>
                  {[38, 45, 41, 55, 50, 64, 59, 70, 65, 75, 71, 80, 87].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '1px', background: 'linear-gradient(to top, rgba(6,100,232,0.5), rgba(6,100,232,0.9))', height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* Targets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', padding: '14px 24px' }}>
                {[
                  { label: 'Entry Zone', val: '₹2,880', color: '#0664e8' },
                  { label: 'Support',    val: '₹2,720', color: '#f43f5e' },
                  { label: 'Resistance', val: '₹3,150', color: '#10b981' },
                ].map((t) => (
                  <div key={t.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', background: '#1c1d22', borderRadius: '6px' }}>
                    <span style={{ fontSize: '8px', color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)' }}>{t.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: t.color, fontFamily: 'var(--font-inter)', fontVariantNumeric: 'tabular-nums' }}>{t.val}</span>
                  </div>
                ))}
              </div>
              {/* Signal */}
              <div style={{ padding: '10px 24px 16px', borderTop: '1px solid #1c1d22', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '5px 12px', borderRadius: '9999px', border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'var(--font-inter)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
                  Bullish Setup
                </span>
                <span style={{ fontSize: '10px', color: '#777a88', fontFamily: 'var(--font-inter)' }}>AI · &lt;30s</span>
              </div>
            </div>
          </div>

          {/* ── CARD B — Portfolio Generator ── */}
          <div
            ref={refB}
            className={cn('bcard scroll-reveal', inViewB && 'in-view', STAGGER[1])}
            style={BENTO_CARD}
          >
            <div style={{ padding: '28px 28px 0' }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#5e616e', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Portfolio Generator
              </p>
              <h3
                style={{
                  fontFamily:   'var(--font-playfair)',
                  fontSize:     '24px',
                  fontWeight:   400,
                  color:        '#ffffff',
                  marginTop:    '10px',
                  marginBottom: 0,
                  lineHeight:   1.3,
                }}
              >
                A full portfolio built by AI.
              </h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#777a88', marginTop: '8px', lineHeight: 1.6 }}>
                Tell us your budget. We scan 250+ stocks and build a diversified basket with targets.
              </p>
            </div>
            {/* Portfolio generator UI preview */}
            <div
              aria-hidden="true"
              style={{
                marginTop:       '24px',
                width:           '100%',
                backgroundColor: '#0d0d10',
                borderTop:       '1px solid #2e3038',
                overflow:        'hidden',
              }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #1c1d22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#777a88', margin: '0 0 4px', fontFamily: 'var(--font-inter)' }}>Budget · ₹1,00,000</p>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>AI Portfolio</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 14px', background: 'rgba(6,100,232,0.08)', border: '1px solid rgba(6,100,232,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0664e8', fontFamily: 'var(--font-inter)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>A+</span>
                  <span style={{ fontSize: '7px', color: 'rgba(6,100,232,0.7)', letterSpacing: '0.06em', marginTop: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>AI grade</span>
                </div>
              </div>
              {/* Allocation rows */}
              <div style={{ padding: '8px 0' }}>
                {[
                  { sym: 'HDFCBANK', alloc: 32, color: '#10b981' },
                  { sym: 'TCS',      alloc: 24, color: '#0664e8' },
                  { sym: 'INFY',     alloc: 18, color: '#0664e8' },
                  { sym: 'RELIANCE', alloc: 15, color: '#f59e0b' },
                  { sym: 'WIPRO',    alloc: 11, color: '#f59e0b' },
                ].map((s) => (
                  <div key={s.sym} style={{ display: 'flex', alignItems: 'center', padding: '9px 24px', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-inter)', width: '80px', flexShrink: 0 }}>{s.sym}</span>
                    <div style={{ flex: 1, height: '3px', background: '#2e3038', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.alloc * 3}%`, background: s.color, borderRadius: '9999px', opacity: 0.8 }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#777a88', fontFamily: 'var(--font-inter)', fontVariantNumeric: 'tabular-nums', width: '30px', textAlign: 'right', flexShrink: 0 }}>{s.alloc}%</span>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid #1c1d22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#777a88', fontFamily: 'var(--font-inter)' }}>Diversification</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', fontFamily: 'var(--font-inter)', fontVariantNumeric: 'tabular-nums' }}>9.2 / 10</span>
              </div>
            </div>
          </div>

          {/* ── CARD C — How It Works (full width) ── */}
          <div
            ref={refC}
            className={cn('bcard bento-card-c scroll-reveal md:col-span-2', inViewC && 'in-view', STAGGER[2])}
            style={{
              backgroundColor: '#0a0a0a',
              border:          '1px solid #2e3038',
              borderRadius:    '10px',
              padding:         '48px',
              transition:      'border-color 200ms ease',
            }}
          >
            {/* Card header */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ margin: 0 }}>
                <span
                  className="block"
                  style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px', fontWeight: 400, color: '#ffffff', lineHeight: 1.2 }}
                >
                  From search to signal
                </span>
                <span
                  className="block"
                  style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px', fontWeight: 400, fontStyle: 'italic', color: '#0664e8', lineHeight: 1.2 }}
                >
                  in 60 seconds.
                </span>
              </h3>
            </div>

            {/* 3-step flow */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              {[
                {
                  title: 'Enter any stock',
                  body:  'Search by name or ticker. 250+ NSE and BSE stocks covered.',
                  pad:   { padding: '0 32px 0 0' } as React.CSSProperties,
                  border: '1px solid #2e3038',
                },
                {
                  title: 'AI analyses instantly',
                  body:  'Technicals, fundamentals, and sentiment — processed simultaneously in under 30 seconds.',
                  pad:   { padding: '0 32px' } as React.CSSProperties,
                  border: '1px solid #2e3038',
                },
                {
                  title: 'Get clear signals',
                  body:  'AI score, entry zone, support, three resistance targets, and a plain-English summary.',
                  pad:   { padding: '0 0 0 32px' } as React.CSSProperties,
                  border: 'none',
                },
              ].map(({ title, body, pad, border }) => (
                <div
                  key={title}
                  className="bento-step"
                  style={{ ...pad, borderRight: border }}
                >
                  <div style={{ width: '24px', height: '2px', backgroundColor: '#0664e8', marginBottom: '20px' }} />
                  <h4
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize:   '16px',
                      fontWeight: 500,
                      color:      '#ffffff',
                      margin:     '0 0 8px 0',
                    }}
                  >
                    {title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize:   '13px',
                      color:      '#777a88',
                      lineHeight: 1.65,
                      margin:     0,
                    }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
//  PULL QUOTE SECTION
// ─────────────────────────────────────────────
function PullQuoteSection() {
  return (
    <section
      style={{
        backgroundColor: '#000000',
        borderBottom:    '1px solid #2e3038',
        paddingTop:      '100px',
        paddingBottom:   '100px',
        position:        'relative',
        overflow:        'hidden',
      }}
    >
      <div
        className="sec-inner"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 48px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          className="pullquote-mark"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '80px',
            color: '#0664e8',
            lineHeight: 0.8,
            display: 'block',
            marginBottom: '8px',
          }}
        >
          &ldquo;
        </span>
        <p
          style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: 'clamp(22px, 3vw, 32px)',
            color: '#e2e3e9',
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          Finally, a stock analysis tool that speaks plain English. I got my first technical reading in under a minute — no jargon, no noise.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            color: '#777a88',
            marginTop: '24px',
            fontWeight: 400,
          }}
        >
          — Early user, Sentiquant Beta
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
//  FAQ SECTION
// ─────────────────────────────────────────────
function FAQSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1)
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      style={{
        backgroundColor: '#000000',
        borderBottom: '1px solid #2e3038',
        paddingTop: '100px',
        paddingBottom: '100px',
      }}
    >
      <div className="sec-inner" style={{ maxWidth: '720px', margin: '0 auto', padding: '0 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
          <h2
            className="faq-h2"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '40px',
              color: '#ffffff',
              fontWeight: 400,
              margin: 0,
            }}
          >
            Common questions.
          </h2>
        </div>

        {/* Accordion */}
        <div ref={ref}>
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div
              key={q}
              className={cn('scroll-reveal', inView && 'in-view', STAGGER[i])}
              style={{ borderBottom: '1px solid #2e3038' }}
            >
              <button
                id={`faq-question-${i}`}
                type="button"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '20px 0',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '15px',
                    color: '#e2e3e9',
                    fontWeight: 500,
                  }}
                >
                  {q}
                </span>
                <span
                  style={{
                    color: '#5e616e',
                    fontSize: '20px',
                    lineHeight: 1,
                    flexShrink: 0,
                    transition: 'transform 200ms ease',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}
                >
                  +
                </span>
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateRows: open === i ? '1fr' : '0fr',
                  transition: 'grid-template-rows 300ms ease',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '14px',
                      color: '#777a88',
                      lineHeight: 1.65,
                      paddingBottom: '20px',
                      margin: 0,
                    }}
                  >
                    {a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
//  BOTTOM CTA SECTION
// ─────────────────────────────────────────────
function BottomCTASection() {
  return (
    <section
      style={{
        backgroundColor: '#08080a',
        borderTop:       '1px solid #2e3038',
        paddingTop:      '100px',
        paddingBottom:   '100px',
        position:        'relative',
        overflow:        'hidden',
      }}
    >
      <div
        className="sec-inner"
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '0 48px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h2 style={{ margin: '0 0 12px 0' }}>
          <span
            className="block"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontSize: 'clamp(36px, 4vw, 56px)', color: '#ffffff', lineHeight: 1.1 }}
          >
            Start analysing
          </span>
          <span
            className="block"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(36px, 4vw, 56px)', color: '#0664e8', lineHeight: 1.1 }}
          >
            smarter today.
          </span>
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '15px',
            color: '#777a88',
            marginBottom: '36px',
          }}
        >
          Free forever on Starter. No credit card required.
        </p>
        <Link
          href="/signup"
          className="inline-flex hover:bg-[#e2e3e9] hover:border-[#e2e3e9] transition-colors duration-150"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #ffffff',
            borderRadius: '2px',
            padding: '13px 32px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter)',
            textDecoration: 'none',
            margin: '0 auto',
          }}
        >
          Get started free →
        </Link>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
//  HOME CLIENT
// ─────────────────────────────────────────────
export function HomeClient() {
  const magneticCta = useMagneticHover<HTMLAnchorElement>(0.22)

  return (
    <div className="flex flex-col overflow-hidden">
      <style>{`
        @media (max-width: 639px) {
          .sec-inner { padding-left: 20px !important; padding-right: 20px !important; }
          .hero-pad { padding-top: 48px !important; padding-bottom: 48px !important; }
          .pullquote-mark { font-size: 48px !important; }
          .faq-h2 { font-size: 28px !important; }
          .bento-card-c { padding: 24px !important; }
          .hero-cta-row { flex-direction: column !important; }
          .hero-cta-row a { width: 100% !important; box-sizing: border-box !important; justify-content: center !important; }
        }
        @media (max-width: 767px) {
          .bento-step { padding: 0 !important; border-right: none !important; }
          .bento-step:not(:last-child) { margin-bottom: 32px !important; }
        }
      `}</style>
      {/* ── HERO ── */}
      <section
        className="relative flex items-center px-4 sm:px-6 hero-pad"
        style={{ backgroundColor: '#000000', paddingTop: '80px', paddingBottom: '80px', overflowX: 'hidden' }}
      >
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] items-center gap-10 lg:gap-16">

            {/* Left column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

              {/* Headline */}
              <h1 className="hero-entry-1 hero-h1" style={{ marginTop: 0 }}>
                <span
                  className="block"
                  style={{
                    fontFamily:    'var(--font-playfair)',
                    fontWeight:    400,
                    color:         '#ffffff',
                    fontSize:      'clamp(48px, 6vw, 88px)',
                    lineHeight:    1.05,
                    letterSpacing: '-0.025em',
                  }}
                >
                  Make smarter
                </span>
                <span
                  className="block"
                  style={{
                    fontFamily:    'var(--font-playfair)',
                    fontWeight:    400,
                    color:         '#ffffff',
                    fontSize:      'clamp(48px, 6vw, 88px)',
                    lineHeight:    1.05,
                    letterSpacing: '-0.025em',
                  }}
                >
                  stock decisions
                </span>
                <span
                  className="block"
                  style={{
                    fontFamily:           'var(--font-playfair)',
                    fontWeight:           400,
                    fontStyle:            'italic',
                    fontSize:             'clamp(48px, 6vw, 88px)',
                    lineHeight:           1.05,
                    letterSpacing:        '-0.025em',
                    background:           'linear-gradient(135deg, #0664e8 0%, #6E56CF 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip:       'text',
                    color:                'transparent',
                  }}
                >
                  with AI.
                </span>
              </h1>

              {/* Subheading */}
              <p
                className="hero-entry-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '16px',
                  color:      '#acafb9',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  maxWidth:   '480px',
                  marginTop:  '24px',
                }}
              >
                Instant analysis of NSE and BSE stocks — technicals, fundamentals, sentiment, and entry zones in under 60 seconds.
              </p>

              {/* CTA Buttons */}
              <div
                className="hero-entry-3 flex flex-row flex-wrap items-center gap-3 hero-cta-row"
                style={{ marginTop: '36px' }}
              >
                <Link
                  ref={magneticCta.ref}
                  href="/stocks"
                  className="inline-flex items-center justify-center bg-white text-black border border-white rounded-[2px] text-[14px] font-semibold hover:bg-[#e2e3e9] hover:border-[#e2e3e9] transition-colors duration-150"
                  style={{ ...magneticCta.style, padding: '11px 24px', fontFamily: 'var(--font-inter)' }}
                >
                  Analyze a stock
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center border border-[#2e3038] rounded-[2px] bg-transparent text-[14px] font-medium hover:border-[#464853] hover:text-white transition-colors duration-150"
                  style={{ padding: '11px 24px', color: '#acafb9', fontFamily: 'var(--font-inter)' }}
                >
                  View dashboard →
                </Link>
              </div>

              {/* Trust line */}
              <p
                className="hero-entry-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '12px',
                  color:      '#777a88',
                  fontWeight: 400,
                  marginTop:  '20px',
                }}
              >
                No credit card required · Free forever on Starter plan
              </p>

            </div>

            {/* Right column: FloatingMockup */}
            <div className="hidden md:flex items-center justify-center md:pl-0 lg:pl-4 xl:pl-8">
              <FloatingMockup />
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '1px', backgroundColor: '#2e3038' }}
          aria-hidden="true"
        />
      </section>

      {/* ── TICKER STRIP ── */}
      <TickerStrip />

      {/* ── INPUTS BREAKDOWN ── */}
      <ErrorBoundary context="InputsBreakdownSection">
        <InputsBreakdownSection />
      </ErrorBoundary>

      {/* ── VIDEO SECTION ── */}
      <VideoSection />

      {/* ── FEATURE CARDS ── */}
      <BentoSection />

      {/* ── SOLAR SYSTEM SECTION ── */}
      <ErrorBoundary context="SolarSystemSection" fallback={() => null}>
        <SolarSystemSection />
      </ErrorBoundary>

      {/* ── STAT CALLOUT ── */}
      <StatCalloutSection />

      {/* ── PORTFOLIO TRACKER ── */}
      <ErrorBoundary context="PortfolioTrackerSection">
        <PortfolioTrackerSection />
      </ErrorBoundary>

      {/* ── NETWORK GRAPH ── */}
      <ErrorBoundary context="NetworkGraphSection" fallback={() => null}>
        <NetworkGraphSection />
      </ErrorBoundary>

      {/* ── PULL QUOTE ── */}
      <PullQuoteSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── BOTTOM CTA ── */}
      <BottomCTASection />
    </div>
  )
}
