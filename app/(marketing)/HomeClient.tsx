'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils/cn'

// ─────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  mercuryBlue:   '#5266eb',
  ghostBlue:     '#cdddff',
  deepSpace:     '#171721',
  midnightSlate: '#1e1e2a',
  graphite:      '#272735',
  lead:          '#70707d',
  starlight:     '#ededf3',
  silver:        '#c3c3cc',
  white:         '#ffffff',
} as const

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const METHODOLOGY = [
  { n: '01', title: 'Sentiment', desc: 'News and disclosures are read in real time. Tone, magnitude and recency are scored against historical baselines.' },
  { n: '02', title: 'Technical', desc: 'RSI, MACD, Bollinger Bands, Stochastic, plus support and resistance — read together, never in isolation.' },
  { n: '03', title: 'Fundamental', desc: 'Revenue, margins, leverage and growth trajectory. The story behind the price, refreshed every quarter.' },
  { n: '04', title: 'Risk', desc: 'Volatility, drawdown depth and beta. We weight every signal by how much pain it might ask you to sit through.' },
] as const

const PORTFOLIO_ROWS = [
  { sym: 'RELIANCE',   name: 'Reliance Industries',    signal: 'BUY'  as const, cmp: '₹2,912.40', delta: '+3.52%', pos: true,  t1: '₹2,920', t2: '₹3,050', t3: '₹3,180', hit: ''   },
  { sym: 'BAJFINANCE', name: 'Bajaj Finance',           signal: 'BUY'  as const, cmp: '₹7,245.10', delta: '+5.81%', pos: true,  t1: '₹7,100', t2: '₹7,400', t3: '₹7,650', hit: 'T1' },
  { sym: 'ITC',        name: 'ITC Ltd',                 signal: 'HOLD' as const, cmp: '₹462.30',   delta: '+0.22%', pos: true,  t1: '₹470',   t2: '₹485',   t3: '₹502',   hit: ''   },
  { sym: 'TATAMOTORS', name: 'Tata Motors',             signal: 'BUY'  as const, cmp: '₹985.75',   delta: '+2.14%', pos: true,  t1: '₹1,020', t2: '₹1,075', t3: '₹1,130', hit: ''   },
  { sym: 'MARUTI',     name: 'Maruti Suzuki',           signal: 'SELL' as const, cmp: '₹11,240.00', delta: '−1.85%', pos: false, t1: '₹11,000',t2: '₹10,750',t3: '₹10,400',hit: ''   },
] as const

const DEMO_STOCKS = [
  { ticker: 'RELIANCE', company: 'Reliance Industries',       signal: 'BUY'  as const, cmp: '₹2,847.50', delta: '+1.24%', pos: true,  t1: 2920,  t2: 3050,  t3: 3180,  rsi: 58, macd: 'Bullish' as const, sent: +0.72 },
  { ticker: 'TCS',      company: 'Tata Consultancy Services', signal: 'HOLD' as const, cmp: '₹4,123.80', delta: '−0.15%', pos: false, t1: 4180,  t2: 4290,  t3: 4400,  rsi: 51, macd: 'Neutral' as const, sent: +0.18 },
  { ticker: 'HDFCBANK', company: 'HDFC Bank',                 signal: 'BUY'  as const, cmp: '₹1,684.20', delta: '+0.86%', pos: true,  t1: 1720,  t2: 1780,  t3: 1850,  rsi: 62, macd: 'Bullish' as const, sent: +0.55 },
  { ticker: 'INFY',     company: 'Infosys',                   signal: 'SELL' as const, cmp: '₹1,542.65', delta: '−1.42%', pos: false, t1: 1490,  t2: 1430,  t3: 1370,  rsi: 38, macd: 'Bearish' as const, sent: -0.34 },
] as const

const FAQ_ITEMS = [
  { q: 'What is SentiQuant?', a: 'SentiQuant is an AI signal engine for NSE-listed Indian stocks. It analyses news sentiment, technical indicators, fundamentals and price action — then hands you a single BUY / HOLD / SELL signal with three target prices (T1, T2, T3) and a risk profile.' },
  { q: 'How does the AI decide on a signal?', a: 'Every stock is scored across four pillars: sentiment, technicals, fundamentals and risk. The pillars are weighted by the current market regime and combined into one directional signal with target levels.' },
  { q: 'Is this SEBI-registered investment advice?', a: 'No. SentiQuant publishes AI-generated analytical signals for research and educational purposes only. Nothing here is personalised investment advice. Always consult a SEBI-registered advisor before acting on any signal.' },
  { q: 'Can I try it without signing up?', a: 'Yes. Open any stock page (e.g. /stocks/RELIANCE) and you will see one full analysis per day with no signup required. Create a free account to lift that limit to ten analyses a day.' },
  { q: 'What is included in the free plan?', a: 'Ten stock analyses per day, one portfolio generation per day, full access to every technical indicator, sentiment scoring and T1 / T2 / T3 targets. Pro removes the daily limits.' },
  { q: 'How often is the data updated?', a: 'Price and technical data refresh on every analysis run during market hours. News sentiment refreshes every few hours. Fundamentals update on quarterly results.' },
  { q: 'Which stocks are supported?', a: 'Every equity listed on NSE — large cap, mid cap, small cap, F&O names, everything. Just use the standard NSE ticker (e.g. INFY, HDFCBANK, TATAMOTORS).' },
] as const

// ─────────────────────────────────────────────
//  ICONS (inline SVG)
// ─────────────────────────────────────────────
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
)
const TrendingUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
)
const TrendingDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
  </svg>
)
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
)
const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─────────────────────────────────────────────
//  SIGNAL BADGE
// ─────────────────────────────────────────────
type SignalType = 'BUY' | 'SELL' | 'HOLD'
type BadgeSize = 'sm' | 'md' | 'lg'

function SignalBadge({ signal, size = 'md' }: { signal: SignalType; size?: BadgeSize }) {
  const config = {
    BUY:  { color: '#6ee7b7', bg: 'rgba(16,185,129,0.10)', border: 'rgba(52,211,153,0.30)', icon: <TrendingUp /> },
    SELL: { color: '#fda4af', bg: 'rgba(244,63,94,0.10)',  border: 'rgba(251,113,133,0.30)', icon: <TrendingDown /> },
    HOLD: { color: '#fde68a', bg: 'rgba(245,158,11,0.10)', border: 'rgba(253,230,138,0.30)', icon: <MinusIcon /> },
  }[signal]

  const padding = { sm: '4px 8px', md: '6px 10px', lg: '12px 14px' }[size]
  const fontSize = { sm: '10px', md: '12px', lg: '14px' }[size]
  const tracking = { sm: '0.18em', md: '0.20em', lg: '0.22em' }[size]

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      color: config.color, background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 0, padding,
      fontSize, letterSpacing: tracking,
      fontWeight: 480, textTransform: 'uppercase',
      fontFamily: 'arcadia, Inter, sans-serif',
    }}>
      {config.icon}{signal}
    </span>
  )
}

// ─────────────────────────────────────────────
//  LOGO MARK
// ─────────────────────────────────────────────
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '4px',
      background: C.mercuryBlue, flexShrink: 0,
    }}>
      <span style={{ color: C.white, fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 530, fontSize: size * 0.57 }}>S</span>
    </span>
  )
}

// ─────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────
function Nav() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { label: 'Home',      href: '/'          },
    { label: 'Stocks',    href: '/stocks'    },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Pricing',   href: '/pricing'   },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(30,30,42,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid rgba(112,112,125,0.33)`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left — logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 480, fontSize: 17, color: C.starlight, letterSpacing: '0.01em' }}>SentiQuant</span>
        </Link>

        {/* Center — desktop links */}
        <div className="hidden md:flex" style={{ gap: 36 }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontWeight: 400, fontSize: 15, color: C.starlight, textDecoration: 'none', opacity: 0.85 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.55')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — auth */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 16 }}>
          {session ? (
            <>
              <Link href="/stocks" style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver, textDecoration: 'none' }}>Open app</Link>
              <button onClick={() => signOut()} style={{
                fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, fontWeight: 480,
                color: C.starlight, background: 'rgba(205,221,255,0.20)',
                border: '1px solid rgba(205,221,255,0.25)', borderRadius: 40,
                padding: '8px 20px', cursor: 'pointer',
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver, textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" style={{
                fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, fontWeight: 480,
                color: C.starlight, background: 'rgba(205,221,255,0.20)',
                border: '1px solid rgba(205,221,255,0.25)', borderRadius: 40,
                padding: '8px 20px', textDecoration: 'none', display: 'inline-block',
              }}>Get started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: C.starlight, cursor: 'pointer', padding: 4 }}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: C.midnightSlate, borderBottom: `1px solid rgba(112,112,125,0.33)`, padding: '16px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 16, color: C.starlight, textDecoration: 'none' }}>{l.label}</Link>
            ))}
            <div style={{ borderTop: `1px solid rgba(112,112,125,0.33)`, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {session ? (
                <>
                  <Link href="/stocks" onClick={() => setOpen(false)} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.silver, textDecoration: 'none' }}>Open app</Link>
                  <button onClick={() => { signOut(); setOpen(false) }} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.starlight, background: 'rgba(205,221,255,0.20)', border: '1px solid rgba(205,221,255,0.25)', borderRadius: 40, padding: '10px 20px', cursor: 'pointer', textAlign: 'left' }}>Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.silver, textDecoration: 'none' }}>Log in</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.starlight, background: C.mercuryBlue, borderRadius: 32, padding: '10px 20px', textDecoration: 'none', display: 'inline-block' }}>Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─────────────────────────────────────────────
//  ANIMATED DEMO CARD
// ─────────────────────────────────────────────
type DemoPhase = 'typing' | 'analysing' | 'result'

function DemoCard() {
  const [stockIdx, setStockIdx]   = useState(0)
  const [phase, setPhase]         = useState<DemoPhase>('typing')
  const [typed, setTyped]         = useState('')
  const [showAnalysing, setShowAnalysing] = useState(false)
  const [showResult, setShowResult]       = useState(false)

  const stock = DEMO_STOCKS[stockIdx]

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const T = (fn: () => void, ms: number) => { const t = setTimeout(() => { if (!cancelled) fn() }, ms); timers.push(t) }

    // Phase 1: typing
    setPhase('typing')
    setTyped('')
    setShowAnalysing(false)
    setShowResult(false)

    const ticker = DEMO_STOCKS[stockIdx].ticker
    let charIdx = 0
    const typeNext = () => {
      if (cancelled) return
      if (charIdx < ticker.length) {
        setTyped(ticker.slice(0, charIdx + 1))
        charIdx++
        T(typeNext, 85)
      } else {
        // Done typing — pause then analysing
        T(() => {
          setPhase('analysing')
          setShowAnalysing(true)
          // Then result
          T(() => {
            setPhase('result')
            setShowResult(true)
            // Then next stock
            T(() => {
              setStockIdx(i => (i + 1) % DEMO_STOCKS.length)
            }, 3800)
          }, 1100)
        }, 380)
      }
    }
    T(typeNext, 200)

    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [stockIdx])

  return (
    <div style={{
      maxWidth: 820, width: '100%', margin: '0 auto',
      background: C.midnightSlate,
      border: `1px solid rgba(112,112,125,0.55)`,
      borderRadius: 0,
    }}>
      {/* Top bar */}
      <div style={{
        background: C.deepSpace,
        borderBottom: `1px solid rgba(112,112,125,0.33)`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          SentiQuant · Live Engine
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 11, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em' }}>ONLINE</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '36px', minHeight: 380 }}>
        {/* Prompt line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.lead }}>{'>'}</span>
          <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.silver }}>analyse</span>
          <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.starlight, tabularNums: true, letterSpacing: '0.01em' }}>{typed}</span>
          {phase === 'typing' && (
            <span style={{ display: 'inline-block', width: 8, height: 15, background: C.starlight, animation: 'pulse 1s infinite' }} />
          )}
        </div>

        {/* Analysing */}
        {showAnalysing && phase !== 'result' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, animation: 'sqFadeUp 0.42s ease-out both' }}>
            <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.lead }}>{'>'}</span>
            <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver }}>scoring four pillars</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 150, 300].map(delay => (
                <span key={delay} style={{ width: 6, height: 6, borderRadius: '50%', background: C.starlight, display: 'inline-block', animation: `bounce 1s infinite ${delay}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* Result card */}
        {showResult && phase === 'result' && (
          <div style={{ animation: 'sqFadeUp 0.42s ease-out both' }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontSize: 28, fontWeight: 480, color: C.starlight, letterSpacing: '0.005em', fontVariantNumeric: 'tabular-nums' }}>{stock.ticker}</div>
                <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 13, color: C.silver, marginTop: 2 }}>{stock.company}</div>
              </div>
              <SignalBadge signal={stock.signal} size="lg" />
            </div>

            {/* CMP row */}
            <div style={{ borderTop: `1px solid rgba(112,112,125,0.33)`, borderBottom: `1px solid rgba(112,112,125,0.33)`, padding: '16px 0', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 11, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>CMP</div>
                <div style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontSize: 32, fontWeight: 360, color: C.starlight, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{stock.cmp}</div>
              </div>
              <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, fontWeight: 480, color: stock.pos ? '#6ee7b7' : '#fda4af', fontVariantNumeric: 'tabular-nums' }}>{stock.delta}</div>
            </div>

            {/* Targets */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 11, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>Targets</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {(['T1', 'T2', 'T3'] as const).map((t, i) => (
                  <div key={t} style={{ background: C.deepSpace, border: `1px solid rgba(112,112,125,0.33)`, borderRadius: 0, padding: 16 }}>
                    <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 10, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>{t}</div>
                    <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 16, fontWeight: 480, color: C.starlight, fontVariantNumeric: 'tabular-nums' }}>
                      ₹{[stock.t1, stock.t2, stock.t3][i].toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver }}>
              <span>RSI <span style={{ color: C.starlight, fontVariantNumeric: 'tabular-nums' }}>{stock.rsi}</span></span>
              <span>MACD <span style={{ color: stock.macd === 'Bullish' ? '#6ee7b7' : stock.macd === 'Bearish' ? '#fda4af' : C.starlight }}>{stock.macd}</span></span>
              <span>Sentiment <span style={{ color: stock.sent >= 0 ? '#6ee7b7' : '#fda4af', fontVariantNumeric: 'tabular-nums' }}>{stock.sent >= 0 ? '+' : ''}{stock.sent.toFixed(2)}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Progress strip */}
      <div style={{ padding: '20px 24px', display: 'flex', gap: 8 }}>
        {DEMO_STOCKS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 1, background: i === stockIdx ? C.starlight : `rgba(112,112,125,0.55)`, transition: 'background 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  HERO SEARCH BAR
// ─────────────────────────────────────────────
function HeroSearch() {
  const router = useRouter()
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sym = value.trim().toUpperCase()
    if (sym) router.push(`/stocks/${sym}`)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', maxWidth: 520, width: '100%', margin: '0 auto' }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Try a ticker — RELIANCE, TCS, INFY"
        autoCapitalize="characters"
        spellCheck={false}
        style={{
          flex: 1, padding: '16px 24px',
          fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, color: C.starlight,
          background: 'transparent',
          border: `1px solid ${C.lead}`,
          borderRight: 'none',
          borderRadius: '32px 0 0 32px',
          outline: 'none',
        }}
      />
      <button type="submit" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '16px 28px',
        fontFamily: 'arcadia, Inter, sans-serif', fontSize: 15, fontWeight: 480, color: C.white,
        background: C.mercuryBlue,
        border: 'none',
        borderRadius: '0 32px 32px 0',
        cursor: 'pointer',
        flexShrink: 0,
      }}>
        Analyse <ArrowRight />
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────
//  FAQ ACCORDION
// ─────────────────────────────────────────────
function FAQAccordion() {
  const [open, setOpen] = useState<number>(0)

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ borderTop: `1px solid ${C.lead}` }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${C.lead}` }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 24, padding: '28px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 13, color: C.silver, marginTop: 2, flexShrink: 0 }}>0{i + 1}</span>
                <span style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontSize: 24, fontWeight: 480, color: C.starlight, lineHeight: 1.3 }}>{item.q}</span>
              </div>
              <span style={{
                color: C.silver, flexShrink: 0, marginTop: 4,
                transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 300ms ease-out', display: 'block',
              }}>
                <ChevronDown />
              </span>
            </button>
            <div style={{
              display: 'grid',
              gridTemplateRows: open === i ? '1fr' : '0fr',
              transition: 'grid-template-rows 300ms ease-out',
              overflow: 'hidden',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontFamily: 'arcadia, Inter, sans-serif', fontSize: 16, color: C.silver,
                  lineHeight: 1.6, paddingLeft: 52, paddingBottom: 28, margin: 0,
                }}>{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MAIN HOME CLIENT
// ─────────────────────────────────────────────
export function HomeClient() {
  return (
    <div style={{ background: C.midnightSlate, minHeight: '100vh', fontFamily: 'arcadia, Inter, sans-serif' }}>
      <style>{`
        @keyframes sqFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        input::placeholder { color: ${C.lead}; }
        input:focus { border-color: rgba(82,102,235,0.6) !important; }
        * { box-sizing: border-box; }
      `}</style>

      <Nav />

      {/* ── 01 HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '128px 24px 96px' }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: `radial-gradient(${C.starlight} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(82,102,235,0.30) 0%, transparent 70%)`,
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          {/* Eyebrow */}
          <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 28 }}>
            AI Signal Engine · NSE
          </p>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 360,
            fontSize: 'clamp(42px, 7vw, 65px)', lineHeight: 1.1, letterSpacing: '0.005em',
            color: C.starlight, margin: '0 0 28px', whiteSpace: 'pre-line',
          }}>
            {'Every stock,\nread properly.'}
          </h1>

          {/* Subhead */}
          <p style={{
            fontFamily: 'arcadia, Inter, sans-serif', fontSize: 21, fontWeight: 400,
            color: C.silver, lineHeight: 1.4, maxWidth: 560, margin: '0 auto 48px',
          }}>
            SentiQuant reads news, charts, fundamentals and risk for every NSE-listed stock — then hands you a single signal with target prices.
          </p>

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <HeroSearch />
          </div>
          <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 13, color: C.silver, margin: 0 }}>
            One free analysis a day · No signup required
          </p>

          {/* Demo card */}
          <div style={{ marginTop: 96 }}>
            <DemoCard />
          </div>
        </div>
      </section>

      {/* ── 02 METHODOLOGY ── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid rgba(112,112,125,0.2)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 64 }}>
            <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 20 }}>How it works</p>
            <h2 style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 360, fontSize: 'clamp(32px, 5vw, 49px)', lineHeight: 1.15, color: C.starlight, margin: '0 0 20px', whiteSpace: 'pre-line' }}>
              {'Four pillars,\none verdict.'}
            </h2>
            <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 16, color: C.silver, lineHeight: 1.5, maxWidth: 560, margin: 0 }}>
              We don't trust any single indicator. Each stock is scored across four independent dimensions — then the engine weighs them by the current market regime and produces the signal you see.
            </p>
          </div>

          {/* Feature rows */}
          <div>
            {METHODOLOGY.map((item, i) => (
              <div key={i}
                style={{
                  borderTop: `1px solid ${C.lead}`, padding: '32px 0',
                  display: 'grid', gridTemplateColumns: '48px 1fr 1fr', gap: 24, alignItems: 'start',
                  cursor: 'default', transition: 'opacity 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver, paddingTop: 4 }}>{item.n}</span>
                <span style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontSize: 28, fontWeight: 480, color: C.starlight, lineHeight: 1.2 }}>{item.title}</span>
                <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 16, color: C.silver, lineHeight: 1.5 }}>{item.desc}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.lead}` }} />
          </div>
        </div>
      </section>

      {/* ── 03 PORTFOLIO TRACKER ── */}
      <section style={{ background: C.deepSpace, padding: '80px 24px', borderTop: `1px solid rgba(112,112,125,0.2)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 20 }}>Portfolio Tracker</p>
          <h2 style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 360, fontSize: 'clamp(32px, 5vw, 49px)', lineHeight: 1.15, color: C.starlight, margin: '0 0 20px', whiteSpace: 'pre-line' }}>
            {'Watch your picks\nin flight.'}
          </h2>
          <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 16, color: C.silver, lineHeight: 1.5, maxWidth: 560, margin: '0 0 48px' }}>
            Generate an AI portfolio in one click. Track every position against its T1, T2 and T3 targets in a live table — sortable, filterable, ruthlessly clean.
          </p>

          {/* Portfolio table */}
          <div style={{ background: C.midnightSlate, border: `1px solid rgba(112,112,125,0.55)`, borderRadius: 0, overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{ padding: '14px 24px', borderBottom: `1px solid rgba(112,112,125,0.33)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em' }}>My Portfolio · Swing</span>
                <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 10, color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
              </div>
              <span className="hidden sm:block" style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver }}>5 positions · 1 target hit</span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid rgba(112,112,125,0.22)` }}>
                    {['Symbol', 'Signal', 'CMP', 'Δ', 'T1', 'T2', 'T3'].map(h => (
                      <th key={h} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 11, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 400, padding: '12px 20px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PORTFOLIO_ROWS.map((row, i) => (
                    <tr key={i}
                      style={{ borderBottom: `1px solid rgba(112,112,125,0.22)`, transition: 'background 150ms' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, fontWeight: 480, color: C.starlight }}>{row.sym}</div>
                        <div style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, marginTop: 2 }}>{row.name}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}><SignalBadge signal={row.signal} size="sm" /></td>
                      <td style={{ padding: '16px 20px', fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.starlight, fontVariantNumeric: 'tabular-nums' }}>{row.cmp}</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: row.pos ? '#6ee7b7' : '#fda4af', fontVariantNumeric: 'tabular-nums' }}>{row.delta}</td>
                      {(['t1', 't2', 't3'] as const).map(t => (
                        <td key={t} style={{ padding: '16px 20px', fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, fontVariantNumeric: 'tabular-nums', color: row.hit === t.toUpperCase() ? '#6ee7b7' : C.silver }}>
                          {row[t]}{row.hit === t.toUpperCase() ? ' ✓' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card footer */}
            <div style={{ padding: '14px 24px', borderTop: `1px solid rgba(112,112,125,0.33)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver }}>Updated · just now</span>
              <Link href="/portfolio" style={{
                fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, fontWeight: 480,
                color: C.white, background: C.mercuryBlue,
                borderRadius: 32, padding: '8px 20px', textDecoration: 'none', display: 'inline-block',
              }}>
                Generate yours →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 FAQ ── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid rgba(112,112,125,0.2)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.silver, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 20 }}>Questions</p>
          <h2 style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 360, fontSize: 'clamp(32px, 5vw, 49px)', lineHeight: 1.15, color: C.starlight, margin: '0 0 56px' }}>
            Asked, answered.
          </h2>
          <FAQAccordion />
        </div>
      </section>

      {/* ── 05 FOOTER ── */}
      <footer style={{ background: C.deepSpace, padding: '80px 24px', borderTop: `1px solid rgba(112,112,125,0.2)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 40 }}>
            {/* Brand block */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <LogoMark />
                <span style={{ fontFamily: 'arcadiaDisplay, Inter, sans-serif', fontWeight: 480, fontSize: 17, color: C.starlight }}>SentiQuant</span>
              </div>
              <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver, lineHeight: 1.6, maxWidth: 360, margin: '0 0 16px' }}>
                AI signal engine for NSE-listed Indian equities. Built for traders and long-term thinkers who want a second opinion before they click buy.
              </p>
              <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.lead, lineHeight: 1.6, maxWidth: 360, margin: 0 }}>
                SentiQuant is not a SEBI-registered investment advisor. All signals are AI-generated outputs for research and educational use only. Nothing on this site constitutes personalised investment advice.
              </p>
            </div>

            {/* Product */}
            <div>
              <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 11, color: C.lead, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 20 }}>Product</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Stocks', '/stocks'], ['Portfolio', '/portfolio'], ['Pricing', '/pricing'], ['Sign in', '/login']].map(([label, href]) => (
                  <Link key={href} href={href} style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver, textDecoration: 'none', opacity: 0.9 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.55')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.9')}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Community */}
            <div>
              <p style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 11, color: C.lead, textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: 20 }}>Community</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href="https://t.me/sentiquant_talks" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 14, color: C.silver, textDecoration: 'none', opacity: 0.9 }}>Telegram</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid rgba(112,112,125,0.33)`, paddingTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.lead }}>© {new Date().getFullYear()} SentiQuant · sentiquant.org</span>
            <span style={{ fontFamily: 'arcadia, Inter, sans-serif', fontSize: 12, color: C.lead }}>Made for Indian markets · NSE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
